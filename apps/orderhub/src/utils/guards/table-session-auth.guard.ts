import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  TableSession,
  COOKIE_TABLE,
  TableSessionStatus,
  Table,
  Store,
} from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { TableSessionService } from 'src/table-session/tableSession.service';

export type IncludingIdTableSession = TableSession & {
  table: Table & { store: Pick<Store, 'publicId' | 'id'> };
};

@Injectable()
export class SessionAuth implements CanActivate {
  constructor(private readonly tableSessionService: TableSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const extractedSessionInCookie: string =
      request.cookies[COOKIE_TABLE.TABLE_SESSION];

    if (!extractedSessionInCookie) {
      throw new HttpException(
        exceptionContentsIs('INVALID_TABLE_SESSION'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const includingIdTableSession: IncludingIdTableSession =
      await this.tableSessionService.getSessionBySessionToken(
        extractedSessionInCookie,
      );

    if (this.isInvalidStatus(includingIdTableSession)) {
      await this.tableSessionService.txUpdateSession(includingIdTableSession, {
        status: TableSessionStatus.CLOSED,
      });
      throw new HttpException(
        exceptionContentsIs('INVALID_TABLE_SESSION'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.tableSession = includingIdTableSession;
    return true;
  }

  private isInvalidStatus(session: IncludingIdTableSession): boolean {
    return (
      session.expiresAt < new Date() &&
      !(
        session.status === TableSessionStatus.ACTIVE ||
        session.status === TableSessionStatus.WAITING_ORDER
      )
    );
  }
}
