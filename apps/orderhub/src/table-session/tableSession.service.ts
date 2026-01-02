import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  TableSessionStatus,
  Order,
  PublicTableSession,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTableSessionDto } from './tableSession.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { sumFromObjects } from '@spaceorder/auth';
import { Tx } from 'types/tx';

type TransactionPipe<T> = (tx?: Tx) => Promise<T>;

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}
  private generateSecureSessionToken(): string {
    const buffer = randomBytes(32);
    return buffer.toString('base64url');
  }

  private getActivatedSessionById(
    tablePublicId: string,
  ): Prisma.TableSessionFindFirstArgs {
    return {
      where: {
        table: { publicId: tablePublicId },
        status: {
          in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
        },
      },
      orderBy: { createdAt: 'desc' },
      omit: { id: true, tableId: true },
    };
  }

  private createSession(tablePublicId: string): Prisma.TableSessionCreateArgs {
    const sessionToken = this.generateSecureSessionToken();
    return {
      data: {
        table: { connect: { publicId: tablePublicId } },
        sessionToken,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20분 후 만료
      },
      omit: { id: true, tableId: true },
    };
  }

  async findActivatedSessionOrCreate(
    tablePublicId: string,
  ): Promise<PublicTableSession> {
    return await this.prismaService.$transaction(async (tx) => {
      const activatedSession = await tx.tableSession.findFirst(
        this.getActivatedSessionById(tablePublicId),
      );

      if (activatedSession) {
        if (!this.isSessionExpired(activatedSession)) {
          return activatedSession;
        }
        await this.txUpdateSession(
          activatedSession,
          { status: TableSessionStatus.CLOSED },
          tx,
        );
      }

      const createdTableSession = await tx.tableSession.create(
        this.createSession(tablePublicId),
      );

      return createdTableSession;
    });
  }

  private isSessionExpired(session: TableSession): boolean {
    return session.expiresAt < new Date();
  }

  async getSessionBySessionToken(
    sessionToken: string,
  ): Promise<PublicTableSession> {
    return await this.prismaService.tableSession.findUniqueOrThrow({
      where: { sessionToken },
    });
  }

  async txUpdateSession(
    tableSession: TableSession,
    updateSessionDto: UpdateTableSessionDto,
    tx?: Tx,
  ): Promise<PublicTableSession> {
    const txableService = tx ?? this.prismaService;

    switch (updateSessionDto.status) {
      case TableSessionStatus.CLOSED:
        return await txableService.tableSession.update(
          this.setSessionDeactivate(tableSession),
        );

      case TableSessionStatus.ACTIVE:
        return await txableService.tableSession.update(
          this.setSessionActivate(tableSession),
        );

      case 'REACTIVATE':
        return await txableService.tableSession.update(
          this.setSessionReactivate(tableSession),
        );

      case 'EXTEND_EXPIRES_AT':
        return await txableService.tableSession.update(
          this.setSessionExtendExpiresAt(tableSession),
        );

      case TableSessionStatus.PAYMENT_PENDING:
        return await this.txUpdateSessionFinishByPayment(tableSession);
    }
  }

  private setSessionDeactivate(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.CLOSED,
        closedAt: new Date(),
      },
      omit: { id: true, tableId: true },
    };
  }

  /** CLOSED 상태인 세션을 다시 ACTIVE 상태로 변경 */
  private setSessionReactivate(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.ACTIVE,
        closedAt: null,
      },
      omit: { id: true, tableId: true },
    };
  }

  /** WAITING_ORDER 상태였다가 주문 시 ACTIVE 상태로 변경 */
  private setSessionActivate(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료
      },
      omit: { id: true, tableId: true },
    };
  }

  private setSessionExtendExpiresAt(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: {
        sessionToken: tableSession.sessionToken,
        status: {
          in: [TableSessionStatus.WAITING_ORDER, TableSessionStatus.ACTIVE],
        },
      },
      data: {
        expiresAt: new Date(tableSession.expiresAt.getTime() + 60 * 60 * 1000), // 1시간 추가
      },
      omit: { id: true, tableId: true },
    };
  }

  private async txUpdateSessionFinishByPayment(
    tableSession: TableSession,
  ): Promise<PublicTableSession> {
    const setPendingStatus = async (tx: Tx): Promise<PublicTableSession> => {
      return await tx.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: {
          status: TableSessionStatus.PAYMENT_PENDING,
        },
        omit: { id: true, tableId: true },
      });
    };

    const setFinishSessionByPayment = async (
      tx: Tx,
    ): Promise<PublicTableSession> => {
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
          HttpStatus.NOT_FOUND,
        );
      }

      // 트랜잭션 내에서 총액 계산
      const totalAmount = sumFromObjects<Order>(
        sessionOrders,
        (order) => order.totalPrice,
      );

      return await tx.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: {
          totalAmount: totalAmount,
          paidAmount: totalAmount, // 전액 결제 가정
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
        omit: { id: true, tableId: true },
      });
    };

    const resultTransaction = await this.transactionPipe<PublicTableSession>(
      setPendingStatus,
      setFinishSessionByPayment,
    );
    return resultTransaction[1];
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

  async getSessionList(tablePublicId: string) {
    return await this.prismaService.tableSession.findMany({
      where: { table: { publicId: tablePublicId } },
    });
  }
}
