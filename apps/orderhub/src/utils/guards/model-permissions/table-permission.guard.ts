import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { Owner, TableAndStoreOwnerId } from '@spaceorder/db';
import { StoreService } from 'src/store/store.service';
import { TableService } from 'src/table/table.service';

type RequestWithClient = Request & {
  user: Owner;
  table: TableAndStoreOwnerId | null;
};
/**
 * @access CachedTableByGuard
 * @description Guard to check permission to access the table and cache the result.
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
      const findTable = await this.tableService.getTableById({
        where: { publicId: tableId, store: { publicId: storeId } },
        include: { store: { select: { ownerId: true } } },
      });
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
}
