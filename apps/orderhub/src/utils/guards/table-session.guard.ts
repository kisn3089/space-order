import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TableSession, COOKIE_TABLE, TableSessionStatus } from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { TableSessionService } from 'src/table-session/tableSession.service';

@Injectable()
export class TableSessionGuard implements CanActivate {
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

    const retrievedTableSession: TableSession =
      await this.tableSessionService.retrieveSessionBySession(
        extractedSessionInCookie,
      );

    if (this.isValidStatus(retrievedTableSession)) {
      await this.tableSessionService.updateSessionDeactivate(
        retrievedTableSession,
      );
      throw new HttpException(
        exceptionContentsIs('INVALID_TABLE_SESSION'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.tableSession = retrievedTableSession;

    return true;
  }

  private isValidStatus(session: TableSession): boolean {
    return (
      session.expiresAt < new Date() &&
      !(
        session.status === TableSessionStatus.ACTIVE ||
        session.status === TableSessionStatus.WAITING_ORDER
      )
    );
  }
}
