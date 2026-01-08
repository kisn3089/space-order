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
import { StoreService } from 'src/store/store.service';

type RequestWithClient = Request & {
  user: Owner;
  table: Table | null;
};

@Injectable()
export class TablePermission implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly storeService: StoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { storeId, tableId } = request.params;

    if (tableId) {
      const findTable = await this.getTableById(storeId, tableId);
      if (findTable.store.ownerId === client.id) {
        request.table = findTable;
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

  private async getTableById(
    storeId: string,
    tableId: string,
  ): Promise<Table & { store: Pick<Store, 'ownerId'> }> {
    return await this.prismaService.table.findFirstOrThrow({
      where: { publicId: tableId, store: { publicId: storeId } },
      include: { store: { select: { ownerId: true } } },
    });
  }
}
