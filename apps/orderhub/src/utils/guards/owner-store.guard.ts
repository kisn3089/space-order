import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Owner, Store } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

type RequestWithClientAndOrder = Request & {
  user: Owner;
  store: Store | null;
};

/**
 * @access CachedStoreByGuard
 * @description if OwnerStoreGuard is present in controller, can use CachedStoreByGuard
 * 하지만 권한 검증만 수행하기 때문에 2개 이상의 store를 가질 경우 올바른 store를 가져오지 못할 수 있음
 */
@Injectable()
export class OwnerStoreGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithClientAndOrder>();
    const ownerId = request.user.id;
    const storeId = request.params.storeId;

    const store = await this.prisma.store.findFirst({
      where: { publicId: storeId, ownerId },
    });

    if (!store) {
      throw new HttpException(
        exceptionContentsIs('FORBIDDEN'),
        HttpStatus.FORBIDDEN,
      );
    }

    request.store = store;
    return true;
  }
}
