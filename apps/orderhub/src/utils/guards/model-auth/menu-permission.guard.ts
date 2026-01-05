import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { Menu, Owner, Store } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';

type RequestWithClient = Request & {
  user: Owner;
};
@Injectable()
export class MenuPermission implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { storeId, menuId } = request.params;

    if (menuId) {
      const findMenuWithStoreId = await this.getMenuById(storeId, menuId);
      if (
        findMenuWithStoreId &&
        findMenuWithStoreId.store.ownerId === client.id
      ) {
        return true;
      }
    } else {
      const findStore = await this.getStoreById(storeId);
      if (findStore && findStore.ownerId === client.id) {
        return true;
      }
    }

    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }

  private async getStoreById(
    storePublicId: string,
  ): Promise<Pick<Store, 'ownerId'>> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { publicId: storePublicId },
      select: { ownerId: true },
    });
  }

  private async getMenuById(
    storePublicId: string,
    menuPublicId: string,
  ): Promise<Menu & { store: Pick<Store, 'ownerId'> }> {
    return await this.prismaService.menu.findFirstOrThrow({
      where: { publicId: menuPublicId, store: { publicId: storePublicId } },
      include: { store: { select: { ownerId: true } } },
    });
  }
}
