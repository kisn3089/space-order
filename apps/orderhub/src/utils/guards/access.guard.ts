import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TokenPayload, User } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

type RequestWithClient = Request & {
  user: { info: User; jwt: TokenPayload };
};

@Injectable()
export abstract class AccessGuard implements CanActivate {
  constructor(protected prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();

    const canAccess = await this.proofCanAccess(request.user, request.params);
    if (!canAccess) {
      throw new HttpException(
        exceptionContentsIs('FORBIDDEN'),
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  protected abstract proofCanAccess(
    user: { info: User; jwt: TokenPayload },
    params: Record<string, string>,
  ): Promise<boolean>;
}
