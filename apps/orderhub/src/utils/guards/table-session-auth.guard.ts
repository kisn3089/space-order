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
import { PrismaService } from 'src/prisma/prisma.service';
import { ALIVE_SESSION_STATUSES } from 'src/common/query/session-query.const';

type RequestWithClient = Request & {
  session: TableSession | null;
};
/**
 * @access Session
 * @type TableSession
 * @description Guard to check permission to access the session and cache the result.
 */
@Injectable()
export class SessionAuth implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const { sessionToken } = request.params;

    const tokenValidation = sessionTokenSchema.safeParse(sessionToken);

    if (tokenValidation.success) {
      const activeSession = await this.prismaService.tableSession.findFirst({
        where: {
          sessionToken: tokenValidation.data,
          expiresAt: { gt: new Date() },
          status: { in: ALIVE_SESSION_STATUSES },
        },
      });

      if (activeSession) {
        request.session = activeSession;
        return true;
      }
    }

    throw new HttpException(
      exceptionContentsIs('INVALID_TABLE_SESSION'),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
