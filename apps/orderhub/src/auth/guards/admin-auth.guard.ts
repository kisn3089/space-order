import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TokenPayload } from '@spaceorder/db';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

type RequestWithUser = Request & {
  user: { jwt: TokenPayload };
};

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user.jwt;
    const isAdminRole = user.role === 'admin';

    if (!isAdminRole) {
      throw new HttpException(
        exceptionContentsIs('FORBIDDEN'),
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
