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
import { StoreService } from 'src/store/store.service';

type RequestWithClient = Request & {
  user: Owner;
  menu: Menu | null;
};
/**
 * @access CachedMenuByGuard
 * @description Guard to check permission to access the menu and cache the result.
 */
@Injectable()
export class MenuPermission implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storeService: StoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { storeId, menuId } = request.params;

    if (menuId) {
      const findMenuWithOwnerId = await this.getMenuById(storeId, menuId);
      if (findMenuWithOwnerId.store.ownerId === client.id) {
        request.menu = findMenuWithOwnerId;
        return true;
      }
    } else {
      const findStore = await this.storeService.getStoreById(storeId);
      if (findStore.ownerId === client.id) {
        return true;
      }
    }

    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }

  private async getMenuById(
    storeId: string,
    menuId: string,
  ): Promise<Menu & { store: Pick<Store, 'ownerId'> }> {
    return await this.prismaService.menu.findFirstOrThrow({
      where: { publicId: menuId, store: { publicId: storeId } },
      include: { store: { select: { ownerId: true } } },
    });
  }
}
