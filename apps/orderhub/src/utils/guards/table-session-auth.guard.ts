import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { sessionTokenSchema } from '@spaceorder/api/schemas';
import { TableSession } from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { SessionService } from 'src/customer/session/session.service';

/** TODO: session을 쿠키 기반 -> url param sessionToken 기반으로 변경한다면 변경되어야 함 */
type RequestWithClient = Request & {
  session: TableSession | null;
};
/**
 * @access Session
 * @description Guard to check permission to access the session and cache the result.
 */
@Injectable()
export class SessionAuth implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const { sessionToken } = request.params;

    const tokenValidation = sessionTokenSchema.safeParse(sessionToken);

    if (tokenValidation.success) {
      const activeSession: TableSession =
        await this.sessionService.getActiveSession(tokenValidation.data);

      request.session = activeSession;
      return true;
    }

    throw new HttpException(
      exceptionContentsIs('INVALID_TABLE_SESSION'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
