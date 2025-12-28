import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { TableSession, COOKIE_TABLE } from '@spaceorder/db';
import { responseMessage } from 'src/common/constants/response-message';
import { TableSessionService } from 'src/table-session/tableSession.service';

@Injectable()
export class TableSessionGuard implements CanActivate {
  constructor(private readonly tableSessionService: TableSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ExtractedSessionTokenInCookie: string =
      request.cookies[COOKIE_TABLE.TABLE_SESSION];

    if (!ExtractedSessionTokenInCookie) {
      throw new HttpException(responseMessage('missingTableSession'), 401);
    }

    const validatedSessionToken: TableSession =
      await this.tableSessionService.validateSessionToken(
        ExtractedSessionTokenInCookie,
      );

    request.tableSession = validatedSessionToken;

    return true;
  }
}
