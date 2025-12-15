import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlainOwner } from '@spaceorder/db';
import { JwtErrorInfo } from './jwt-auth.guard';
import { responseMessage } from 'src/common/constants/response-message';
import { Response } from 'express';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  handleRequest<User = PlainOwner>(
    err: any,
    user: any,
    info: JwtErrorInfo,
    context: ExecutionContext,
  ): User {
    if (err || !user) {
      console.warn('-------refresh token guard-------');
      console.warn('user: ', user);
      console.warn('error: ', err?.message);
      console.warn('info: ', info?.name);
      console.warn('info: ', info?.message);
      console.warn('timestamp: ', new Date().toISOString());
    }

    if (err) throw err;

    if (!user) {
      const response = context.switchToHttp().getResponse<Response>();
      response.clearCookie('Refresh');
      throw new HttpException(responseMessage('forbidden'), 403);
    }

    return user;
  }
}
