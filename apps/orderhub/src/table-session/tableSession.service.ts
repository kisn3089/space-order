import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  TableSessionStatus,
  Order,
  PublicTableSession,
  SessionWithTable,
} from '@spaceorder/db';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTableSessionDto } from './tableSession.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { sumFromObjects } from '@spaceorder/api/utils';
import { Tx } from 'src/utils/helper/transactionPipe';

@Injectable()
export class TableSessionService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly sanitizeOmit = { id: true, tableId: true };
  private readonly includeSanitizeId = { table: true };

  private generateSecureSessionToken(): string {
    const buffer = randomBytes(32);
    return buffer.toString('base64url');
  }

  private getActivatedSessionById(tablePublicId: string) {
    return {
      where: {
        table: { publicId: tablePublicId },
        status: {
          in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
        },
      },
      include: this.includeSanitizeId,
    };
  }

  private createSession(tablePublicId: string) {
    const sessionToken = this.generateSecureSessionToken();
    return {
      data: {
        table: { connect: { publicId: tablePublicId } },
        sessionToken,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20분 후 만료
      },
      include: this.includeSanitizeId,
    };
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
  }

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

  private isSessionExpired(session: TableSession): boolean {
    return session.expiresAt < new Date();
  }

  async getActiveSession(sessionToken: string): Promise<SessionWithTable> {
    return await this.prismaService.tableSession.findFirstOrThrow({
      where: {
        sessionToken,
        expiresAt: { gte: new Date() },
        status: {
          in: [TableSessionStatus.ACTIVE, TableSessionStatus.WAITING_ORDER],
        },
      },
      include: this.includeSanitizeId,
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
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: {
        status: TableSessionStatus.ACTIVE,
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
  ): Promise<PublicTableSession> {
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
        omit: this.sanitizeOmit,
      });
    });
  }

  async getSessionList(tablePublicId: string) {
    return await this.prismaService.tableSession.findMany({
      where: { table: { publicId: tablePublicId } },
      omit: this.sanitizeOmit,
    });
  }
}
