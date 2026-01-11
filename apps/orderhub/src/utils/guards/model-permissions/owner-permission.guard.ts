import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { Owner } from '@spaceorder/db';

type RequestWithClient = Request & {
  user: Owner;
};
@Injectable()
export class OwnerPermission implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { ownerId } = request.params;

    /**
     * 추후 Admin은 모든 Owner에 대한 권한을 가질 수 있도록 구현 예정
     * writer 권한은 Admin 권한만 가능하도록 변경 필요
     */

    if (ownerId === client.publicId) {
      return true;
    }

    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}
