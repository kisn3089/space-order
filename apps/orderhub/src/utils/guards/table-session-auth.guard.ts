import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { COOKIE_TABLE } from '@spaceorder/db/constants';
import { sessionTokenSchema } from '@spaceorder/api/schemas';
import { SessionWithTable } from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { TableSessionService } from 'src/table-session/tableSession.service';

type RequestWithClient = Request & {
  tableSession: SessionWithTable | null;
  cookies: Record<string, string>;
};
/**
 * @access CachedTableSession
 * @description Guard to check permission to access the table session and cache the result.
 */
@Injectable()
export class SessionAuth implements CanActivate {
  constructor(private readonly tableSessionService: TableSessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const extractedSessionInCookie: string | undefined =
      request.cookies[COOKIE_TABLE.TABLE_SESSION];

    const tokenValidation = sessionTokenSchema.safeParse(
      extractedSessionInCookie,
    );

    if (tokenValidation.success) {
      const activeSessionWithSanitizeId: SessionWithTable =
        await this.tableSessionService.getActiveSession(tokenValidation.data);
      request.tableSession = activeSessionWithSanitizeId;
      return true;
    }

    throw new HttpException(
      exceptionContentsIs('INVALID_TABLE_SESSION'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
