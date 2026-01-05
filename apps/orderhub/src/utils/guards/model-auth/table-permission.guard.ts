import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { PrismaService } from 'src/prisma/prisma.service';
import { Owner, Store, Table } from '@spaceorder/db';

type RequestWithClient = Request & {
  user: Owner;
};

@Injectable()
export class TablePermission implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { storeId, tableId } = request.params;

    if (tableId) {
      const findTable = await this.getTableById(storeId, tableId);
      if (findTable && findTable.store.ownerId === client.id) {
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

  private async getTableById(
    storePublicId: string,
    tablePublicId: string,
  ): Promise<Table & { store: Pick<Store, 'ownerId'> }> {
    return await this.prismaService.table.findFirstOrThrow({
      where: { publicId: tablePublicId, store: { publicId: storePublicId } },
      include: { store: { select: { ownerId: true } } },
    });
  }

  private async getStoreById(
    storePublicId: string,
  ): Promise<Pick<Store, 'ownerId'>> {
    return await this.prismaService.store.findFirstOrThrow({
      where: { publicId: storePublicId },
      select: { ownerId: true },
    });
  }
}
