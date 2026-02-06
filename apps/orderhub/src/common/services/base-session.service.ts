import { HttpException, HttpStatus } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  TableSessionStatus,
  PublicSession,
  SessionWithTable,
  OrderItem,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { sumFromObjects } from '@spaceorder/api/utils';
import { Tx } from 'src/utils/helper/transactionPipe';
import { updateActivateSchema } from '@spaceorder/api/schemas';
import z from 'zod';
import {
  isActivateTableOrThrow,
  isSessionExpired,
} from 'src/common/validate/session/alive-session';
import {
  ALIVE_SESSION_STATUSES,
  ONE_HOURS,
  TWO_HOURS,
  SESSION_OMIT,
} from 'src/common/query/session-query.const';

export type UpdateSessionFromCreateOrder = z.infer<typeof updateActivateSchema>;

export abstract class BaseSessionService {
  constructor(protected readonly prismaService: PrismaService) {}

  protected abstract createSession(identifier: string): {
    data: Prisma.TableSessionCreateInput;
    include: Prisma.TableSessionInclude;
  };

  protected abstract getActivatedSessionQuery(identifier: string): {
    where: Prisma.TableSessionWhereInput;
    include: Prisma.TableSessionInclude;
  };

  protected async validateSessionWithDeactivate(
    tx: Tx,
    activatedSession: SessionWithTable | null,
  ): Promise<SessionWithTable | null> {
    if (!activatedSession) {
      return null;
    }

    isActivateTableOrThrow(activatedSession);
    if (isSessionExpired(activatedSession)) {
      await tx.tableSession.update(this.setSessionDeactivate(activatedSession));
      return null;
    }

    return activatedSession;
  }

  protected setSessionDeactivate(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: { status: TableSessionStatus.CLOSED, closedAt: new Date() },
      omit: SESSION_OMIT,
    };
  }

  /** WAITING_ORDER 상태였다가 주문 시 ACTIVE 상태로 변경 */
  protected setSessionActivate(
    tableSession: TableSession,
    updateSessionDto: UpdateSessionFromCreateOrder,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: { ...updateSessionDto, expiresAt: TWO_HOURS() },
      omit: SESSION_OMIT,
    };
  }

  protected setSessionExtendExpiresAt(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: {
        sessionToken: tableSession.sessionToken,
        status: { in: ALIVE_SESSION_STATUSES },
      },
      data: { expiresAt: ONE_HOURS(tableSession.expiresAt) },
      omit: SESSION_OMIT,
    };
  }

  protected async txUpdateSessionFinishByPayment(
    tableSession: TableSession,
  ): Promise<PublicSession> {
    return await this.prismaService.$transaction(async (tx) => {
      await tx.tableSession.update({
        where: { sessionToken: tableSession.sessionToken },
        data: { status: TableSessionStatus.PAYMENT_PENDING },
        omit: SESSION_OMIT,
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
          paidAmount: totalAmount,
          status: TableSessionStatus.CLOSED,
          closedAt: new Date(),
        },
        omit: SESSION_OMIT,
      });
    });
  }
}
