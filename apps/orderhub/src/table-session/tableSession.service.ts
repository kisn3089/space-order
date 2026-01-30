import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  TableSessionStatus,
  ResponseTableSession,
  SessionWithTable,
  OrderItem,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTableSessionDto } from './tableSession.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { sumFromObjects } from '@spaceorder/api/utils';
import { Tx } from 'src/utils/helper/transactionPipe';
import { updateActivateSchema } from '@spaceorder/api/schemas';
import z from 'zod';

type UpdateSessionFromCreateOrder = z.infer<typeof updateActivateSchema>;

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}

  private sanitizeOmit = { id: true, tableId: true } as const;
  withTable = { table: true } as const;

  async findActivatedSessionOrCreate(
    tablePublicId: string,
  ): Promise<SessionWithTable> {
    return await this.prismaService.$transaction(async (tx) => {
      const activatedSession = await this.txFindActivatedSessionOrCreate(
        tx,
        tablePublicId,
      );

      return activatedSession;
    });
  }

  async txFindActivatedSessionOrCreate(
    tx: Tx,
    tablePublicId: string,
  ): Promise<SessionWithTable> {
    const activatedSession = await tx.tableSession.findFirst({
      ...this.getActivatedSessionById(tablePublicId),
      orderBy: { createdAt: 'desc' },
    });

    if (activatedSession) {
      if (!activatedSession.table.isActive) {
        throw new HttpException(
          exceptionContentsIs('TABLE_INACTIVE'),
          HttpStatus.FORBIDDEN,
        );
      }
      if (!this.isSessionExpired(activatedSession)) {
        return activatedSession;
      }
      await this.txUpdateSession(
        activatedSession,
        { status: TableSessionStatus.CLOSED },
        tx,
      );
    }

    await this.validActivatedTable(tx, tablePublicId);

    const createdTableSession = await tx.tableSession.create(
      this.createSession(tablePublicId),
    );

    return createdTableSession;
  }

  private getActivatedSessionById(tablePublicId: string) {
    return {
      where: {
        table: { publicId: tablePublicId, isActive: true },
        status: {
          in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
        },
      },
      include: this.withTable,
    };
  }

  private isSessionExpired(session: TableSession): boolean {
    return session.expiresAt < new Date();
  }

  private async validActivatedTable(tx: Tx, tablePublicId: string) {
    try {
      await tx.table.findUniqueOrThrow({
        where: { publicId: tablePublicId, isActive: true },
      });
    } catch {
      throw new HttpException(
        exceptionContentsIs('TABLE_INACTIVE'),
        HttpStatus.FORBIDDEN,
      );
    }
  }

  private createSession(tablePublicId: string) {
    const sessionToken = this.generateSecureSessionToken();
    return {
      data: {
        table: { connect: { publicId: tablePublicId } },
        sessionToken,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20분 후 만료
      },
      include: this.withTable,
    };
  }

  private generateSecureSessionToken(): string {
    const buffer = randomBytes(32);
    return buffer.toString('base64url');
  }

  async getActiveSession(sessionToken: string): Promise<SessionWithTable> {
    return await this.prismaService.tableSession.findFirstOrThrow({
      where: {
        sessionToken,
        expiresAt: { gt: new Date() },
        status: { in: this.readyToOrderStatuses },
      },
      include: this.withTable,
    });
  }

  private readonly readyToOrderStatuses = [
    TableSessionStatus.WAITING_ORDER,
    TableSessionStatus.ACTIVE,
  ];

  async getSessionList<T extends Prisma.TableSessionFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TableSessionFindManyArgs>,
  ): Promise<Prisma.TableSessionGetPayload<T>[]> {
    return await this.prismaService.tableSession.findMany(args);
  }

  async getSessionUnique<T extends Prisma.TableSessionFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.TableSessionFindFirstOrThrowArgs>,
  ): Promise<Prisma.TableSessionGetPayload<T>> {
    return await this.prismaService.tableSession.findFirstOrThrow(args);
  }

  async txUpdateSession(
    tableSession: TableSession,
    updateSessionDto: UpdateTableSessionDto,
    tx?: Tx,
  ): Promise<ResponseTableSession> {
    const txableService = tx ?? this.prismaService;

    switch (updateSessionDto.status) {
      case TableSessionStatus.CLOSED:
        return await txableService.tableSession.update(
          this.setSessionDeactivate(tableSession),
        );

      case TableSessionStatus.ACTIVE:
        return await txableService.tableSession.update(
          this.setSessionActivate(tableSession, updateSessionDto),
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

      default:
        throw new HttpException(
          exceptionContentsIs('INVALID_PAYLOAD_TABLE_SESSION'),
          HttpStatus.BAD_REQUEST,
        );
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
      omit: this.sanitizeOmit,
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
      omit: this.sanitizeOmit,
    };
  }

  /** WAITING_ORDER 상태였다가 주문 시 ACTIVE 상태로 변경 */
  private setSessionActivate(
    tableSession: TableSession,
    updateSessionDto: UpdateSessionFromCreateOrder,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: {
        ...updateSessionDto,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후 만료
      },
      omit: this.sanitizeOmit,
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
      omit: this.sanitizeOmit,
    };
  }

  private async txUpdateSessionFinishByPayment(
    tableSession: TableSession,
  ): Promise<ResponseTableSession> {
    return await this.prismaService.$transaction(async (tx) => {
      await tx.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: {
          status: TableSessionStatus.PAYMENT_PENDING,
        },
        omit: this.sanitizeOmit,
      });

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

      const flatMappedOrderItems = sessionOrders.flatMap(
        (order) => order.orderItems,
      );

      const totalAmount = sumFromObjects<OrderItem>(
        flatMappedOrderItems,
        (orderItems) => orderItems.unitPrice * orderItems.quantity,
      );

      return await tx.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: {
          paidAmount: totalAmount, // 전액 결제 가정
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
        omit: this.sanitizeOmit,
      });
    });
  }
}
