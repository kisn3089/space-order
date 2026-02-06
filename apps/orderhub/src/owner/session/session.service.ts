import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  Prisma,
  TableSessionStatus,
  PublicSession,
  SessionWithTable,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTableSessionDto } from './session.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { Tx } from 'src/utils/helper/transactionPipe';
import {
  ALIVE_SESSION_STATUSES,
  TWENTY_MINUTE,
  INCLUDE_TABLE,
  SESSION_OMIT,
} from 'src/common/query/session-query.const';
import { generateSecureSessionToken } from 'src/utils/lib/crypt';
import { BaseSessionService } from 'src/common/services/base-session.service';

type StoreIdAndSessionIdParams = {
  storeId: string;
  sessionId: string;
};

@Injectable()
export class SessionService extends BaseSessionService {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  async findActivatedSessionOrCreate(
    tableId: string,
  ): Promise<SessionWithTable> {
    return await this.prismaService.$transaction(async (tx) => {
      return await this.txGetActivatedSessionOrCreate(tx, tableId);
    });
  }

  async txGetActivatedSessionOrCreate(
    tx: Tx,
    tableId: string,
  ): Promise<SessionWithTable> {
    const activeSession = await tx.tableSession.findFirst({
      ...this.buildActiveSessionQuery(tableId),
      orderBy: { createdAt: 'desc' },
    });

    const validSession = await this.validateSessionWithDeactivate(
      tx,
      activeSession,
    );

    return (
      validSession ?? (await tx.tableSession.create(this.createSession(tableId)))
    );
  }

  protected buildActiveSessionQuery(tableId: string) {
    return {
      where: {
        table: { publicId: tableId, isActive: true },
        status: { in: ALIVE_SESSION_STATUSES },
      },
      include: INCLUDE_TABLE,
    };
  }

  protected createSession(tableId: string) {
    const sessionToken = generateSecureSessionToken();
    return {
      data: {
        table: { connect: { publicId: tableId } },
        sessionToken,
        expiresAt: TWENTY_MINUTE(),
      },
      include: INCLUDE_TABLE,
    };
  }

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

  async getSessionAndPartialUpdate(
    { sessionId, storeId }: StoreIdAndSessionIdParams,
    updateSessionPayload: UpdateTableSessionDto,
  ): Promise<PublicSession> {
    const activeSession = await this.getSessionUnique({
      where: {
        publicId: sessionId,
        table: { store: { publicId: storeId } },
      },
      include: INCLUDE_TABLE,
    });

    return await this.txableUpdateSession(activeSession, updateSessionPayload);
  }

  async txableUpdateSession(
    tableSession: TableSession,
    updateSessionPayload: UpdateTableSessionDto,
    tx?: Tx,
  ): Promise<PublicSession> {
    const txableService = tx ?? this.prismaService;

    switch (updateSessionPayload.status) {
      case TableSessionStatus.CLOSED:
        return await txableService.tableSession.update(
          this.setSessionDeactivate(tableSession),
        );

      case TableSessionStatus.ACTIVE:
        return await txableService.tableSession.update(
          this.setSessionActivate(tableSession, updateSessionPayload),
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

  /** CLOSED 상태인 세션을 다시 ACTIVE 상태로 변경 */
  private setSessionReactivate(
    tableSession: TableSession,
  ): Prisma.TableSessionUpdateArgs {
    return {
      where: { sessionToken: tableSession.sessionToken },
      data: { status: TableSessionStatus.ACTIVE, closedAt: null },
      omit: SESSION_OMIT,
    };
  }
}
