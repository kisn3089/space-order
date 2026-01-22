import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Owner, Store, Table } from '@spaceorder/db';
import { StoreService } from 'src/store/store.service';
import { TableService } from 'src/table/table.service';

type RequestWithClient = Request & {
  user: Owner;
  table: Table | null;
  store: Store | null;
};
/**
 * @access CachedTableByGuard
 * @description Guard to check permission to access the table and cache the result.
 * @access CachedStoreByGuard
 * @description Guard to check permission to access the store and cache the result.
 */
@Injectable()
export class TablePermission implements CanActivate {
  constructor(
    private readonly storeService: StoreService,
    private readonly tableService: TableService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const client = request.user;
    const { storeId, tableId } = request.params;

    if (tableId) {
      const findTable = await this.tableService.getTableUnique({
        where: {
          publicId: tableId,
          store: { publicId: storeId, ownerId: client.id },
        },
      });

      request.table = findTable;
      return true;
    } else {
      const findStore = await this.storeService.getStoreUnique({
        where: { publicId: storeId, ownerId: client.id },
      });

      request.store = findStore;
      return true;
    }
  }
}
