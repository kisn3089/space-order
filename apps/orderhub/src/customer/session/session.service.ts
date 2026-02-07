import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TableSession,
  TableSessionStatus,
  PublicSession,
  TableWithStoreContext,
  SessionWithTable,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateCustomerTableSessionDto } from './session.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { Tx } from 'src/utils/helper/transactionPipe';
import { CreateSessionPayloadDto } from 'src/dto/session.dto';
import {
  ALIVE_SESSION_STATUSES,
  TWENTY_MINUTE,
  INCLUDE_TABLE,
  INCLUDE_TABLE_STORE_AVAILABLE_MENUS,
} from 'src/common/query/session-query.const';
import { generateSecureSessionToken } from 'src/utils/lib/crypt';
import { BaseSessionService } from 'src/common/services/base-session.service';

@Injectable()
export class SessionService extends BaseSessionService {
  constructor(prismaService: PrismaService) {
    super(prismaService);
  }

  async findActivatedSessionOrCreate(
    createSessionPayload: CreateSessionPayloadDto,
  ): Promise<SessionWithTable> {
    return await this.prismaService.$transaction(async (tx) => {
      const activeSession = await tx.tableSession.findFirst({
        ...this.buildActiveSessionQuery(createSessionPayload.qrCode),
        orderBy: { createdAt: 'desc' },
      });

      const validSession = await this.validateSessionWithDeactivate(
        tx,
        activeSession,
      );

      return (
        validSession ??
        (await tx.tableSession.create(
          this.createSession(createSessionPayload.qrCode),
        ))
      );
    });
  }

  protected buildActiveSessionQuery(qrCode: string) {
    return {
      where: { table: { qrCode }, status: { in: ALIVE_SESSION_STATUSES } },
      include: INCLUDE_TABLE,
    };
  }

  protected createSession(qrCode: string) {
    const sessionToken = generateSecureSessionToken();
    return {
      data: {
        table: { connect: { qrCode } },
        sessionToken,
        expiresAt: TWENTY_MINUTE(),
      },
      include: INCLUDE_TABLE,
    };
  }

  async txUpdateSession(
    tableSession: TableSession,
    updateSessionPayload: UpdateCustomerTableSessionDto,
    tx?: Tx,
  ): Promise<PublicSession> {
    const txableService = tx ?? this.prismaService;

    switch (updateSessionPayload.status) {
      case TableSessionStatus.ACTIVE:
        return await txableService.tableSession.update(
          this.setSessionActivate(tableSession, updateSessionPayload),
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

  async getStoreUntilMenusBySession(
    sessionToken: string,
  ): Promise<TableSession & { table: TableWithStoreContext }> {
    return await this.prismaService.tableSession.findFirstOrThrow({
      where: this.buildSessionTokenQuery(sessionToken),
      include: INCLUDE_TABLE_STORE_AVAILABLE_MENUS,
    });
  }

  async getActiveSession(sessionToken: string): Promise<TableSession> {
    return await this.prismaService.tableSession.findFirstOrThrow({
      where: this.buildSessionTokenQuery(sessionToken),
    });
  }

  private buildSessionTokenQuery(sessionToken: string) {
    return {
      sessionToken,
      expiresAt: { gt: new Date() },
      status: { in: ALIVE_SESSION_STATUSES },
    } as const;
  }
}
