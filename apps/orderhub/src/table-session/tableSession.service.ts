import type { Response } from 'express';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  PrismaClient,
  TableSessionStatus,
  COOKIE_TABLE,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTableSessionDto } from './tableSession.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { responseCookie } from 'src/utils/cookies';

type Tx = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;
type TransactionPipe<T> = (tx?: Tx) => Promise<T>;

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}
  private generateSecureSessionToken(): string {
    const buffer = randomBytes(32);
    return buffer.toString('base64url');
  }

  private async retrieveActivatedSessionById(tablePublicId: string) {
    return await this.prismaService.tableSession.findFirst({
      where: {
        table: { publicId: tablePublicId },
        status: TableSessionStatus.ACTIVE,
      },
    });
  }

  private async createSession(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<TableSession> {
    const sessionToken = this.generateSecureSessionToken();
    return await this.prismaService.tableSession.create({
      data: {
        store: { connect: { publicId: storePublicId } },
        table: { connect: { publicId: tablePublicId } },
        status: TableSessionStatus.WAITING_ORDER,
        sessionToken,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20분 후 만료
      },
    });
  }

  async createOrRetrieveActivatedSession(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<TableSession> {
    const retrievedActivatedSession =
      await this.retrieveActivatedSessionById(tablePublicId);

    if (retrievedActivatedSession) {
      if (this.isExpireSession(retrievedActivatedSession)) {
        await this.updateSessionDeactivate(retrievedActivatedSession);
      }
      return retrievedActivatedSession;
    }

    const createdTableSession = await this.createSession(
      storePublicId,
      tablePublicId,
    );

    return createdTableSession;
  }

  private isExpireSession(session: TableSession): boolean {
    return session.expiresAt && session.expiresAt < new Date();
  }

  async retrieveSessionBySession(sessionToken: string): Promise<TableSession> {
    const session = await this.prismaService.tableSession.findUniqueOrThrow({
      where: { sessionToken },
    });

    return session;
  }

  async updateSessiona(
    tableSession: TableSession,
    updateSessionDto: UpdateTableSessionDto,
    response: Response,
  ): Promise<TableSession> {
    switch (updateSessionDto.status) {
      case TableSessionStatus.CLOSED:
        return await this.updateSessionDeactivate(tableSession);

      case TableSessionStatus.ACTIVE:
        return await this.updateSessionActivate(tableSession);

      case 'REACTIVATE':
        return await this.updateSessionReactivate(tableSession);

      case 'EXTEND_EXPIRES_AT':
        return await this.updateSessionExtendExpiresAt(tableSession, response);

      case TableSessionStatus.PAYMENT_PENDING:
        return await this.txUpdateSessionFinishByPayment(tableSession)[1];

      default:
        throw new HttpException(
          exceptionContentsIs('INVALID_PAYLOAD_TABLE_SESSION'),
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private validSessionStatus(status: TableSessionStatus) {
    const isWaitOrActive = () => {
      return status === 'ACTIVE' || status === 'WAITING_ORDER';
    };

    return { isWaitOrActive };
  }

  async updateSessionDeactivate(
    tableSession: TableSession,
  ): Promise<TableSession> {
    return await this.prismaService.tableSession.update({
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  /** CLOSED 상태인 세션을 다시 ACTIVE 상태로 변경 */
  async updateSessionReactivate(
    tableSession: TableSession,
  ): Promise<TableSession> {
    return await this.prismaService.tableSession.update({
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.ACTIVE,
        closedAt: null,
      },
    });
  }

  /** WAITING_ORDER 상태였다가 주문 시 ACTIVE 상태로 변경 */
  async updateSessionActivate(
    tableSession: TableSession,
  ): Promise<TableSession> {
    return await this.prismaService.tableSession.update({
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료
      },
    });
  }

  async updateSessionExtendExpiresAt(
    tableSession: TableSession,
    response: Response,
  ): Promise<TableSession> {
    if (!this.validSessionStatus(tableSession.status).isWaitOrActive()) {
      throw new HttpException(
        {
          ...exceptionContentsIs('TABLE_SESSION_NOT_ACTIVE'),
          details: { status: tableSession.status },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedSession = await this.prismaService.tableSession.update({
      where: {
        sessionToken: tableSession.sessionToken,
      },
      data: {
        expiresAt: new Date(tableSession.expiresAt.getTime() + 60 * 60 * 1000), // 1시간 추가
      },
    });

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      updatedSession.sessionToken,
      {
        expires: updatedSession.expiresAt,
      },
    );

    return updatedSession;
  }

  async txUpdateSessionFinishByPayment(
    tableSession: TableSession,
  ): Promise<TableSession[]> {
    const setPendingStatus = async (tx: Tx): Promise<TableSession> => {
      return await this.txableUpdateSession(tx).partialUpdate(tableSession, {
        status: TableSessionStatus.PAYMENT_PENDING,
      });
    };

    const setFinishSessionByPayment = async (tx: Tx): Promise<TableSession> => {
      // 트랜잭션 내에서 주문 조회
      const sessionOrders = await tx.order.findMany({
        where: { tableSessionId: tableSession.id },
        include: { orderItems: true },
      });

      if (!sessionOrders.length) {
        throw new HttpException(
          {
            ...exceptionContentsIs('ORDER_IS_EMPTY'),
            details: { orders: sessionOrders },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // 트랜잭션 내에서 총액 계산
      const calculatedTotalAmount = sessionOrders.reduce<number>(
        (sum, order) => sum + order.totalPrice,
        0,
      );

      return await this.txableUpdateSession(tx).partialUpdate(tableSession, {
        totalAmount: calculatedTotalAmount,
        paidAmount: calculatedTotalAmount, // 전액 결제 가정
        status: TableSessionStatus.CLOSED,
        closedAt: new Date(),
      });
    };

    const resultTransaction = await this.transactionPipe<TableSession>(
      setPendingStatus,
      setFinishSessionByPayment,
    );
    console.log('resultTransaction: ', resultTransaction);

    return resultTransaction;
  }

  private txableUpdateSession(tx?: Tx) {
    const service = tx ?? this.prismaService;

    const partialUpdate = async (
      tableSession: TableSession,
      updateSessionDto: Partial<TableSession>,
    ) => {
      return await service.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: updateSessionDto,
      });
    };

    return { partialUpdate };
  }

  private async transactionPipe<T>(
    ...args: TransactionPipe<T>[]
  ): Promise<Awaited<T>[]> {
    const results: Awaited<T>[] = [];
    await this.prismaService.$transaction(async (tx) => {
      for (const func of args) {
        const result: Awaited<ReturnType<typeof func>> = await func(tx);
        results.push(result);
      }
    });

    return results;
  }

  async retrieveSessionBySessionToken(sessionToken: string) {
    return await this.prismaService.tableSession.findUniqueOrThrow({
      where: { sessionToken },
    });
  }

  async retrieveSessionList(tablePublicId: string) {
    const retrievedTableSessionList =
      await this.prismaService.tableSession.findMany({
        where: { table: { publicId: tablePublicId } },
      });

    return retrievedTableSessionList;
  }
}
