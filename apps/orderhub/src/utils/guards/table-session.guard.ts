import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TableSession, COOKIE_TABLE, TableSessionStatus } from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/response-message';
import { TableSessionService } from 'src/table-session/tableSession.service';

@Injectable()
export class TableSessionGuard implements CanActivate {
  constructor(private readonly tableSessionService: TableSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ExtractedSessionTokenInCookie: string =
      request.cookies[COOKIE_TABLE.TABLE_SESSION];

    if (!ExtractedSessionTokenInCookie) {
      throw new HttpException(
        exceptionContentsIs('MISSING_TABLE_SESSION'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const validatedTableSession: TableSession =
      await this.tableSessionService.validateSessionToken(
        ExtractedSessionTokenInCookie,
      );

    if (
      validatedTableSession.expiresAt < new Date() ||
      validatedTableSession.status !== TableSessionStatus.ACTIVE
    ) {
      await this.tableSessionService.updateSessionDeactivate(
        validatedTableSession.publicId,
      );
      throw new HttpException(
        exceptionContentsIs('EXPIRED_TABLE_SESSION'),
        440,
      );
    }

    request.tableSession = validatedTableSession;

    return true;
  }
}
