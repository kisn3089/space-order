import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { OrderService } from 'src/order/order.service';
import {
  Owner,
  PublicOrderWithItem,
  TableAndStoreOwnerId,
} from '@spaceorder/db';
import { TableService } from 'src/table/table.service';

type RequestWithClientAndOrderAndTable = Request & {
  user: Owner;
  order: PublicOrderWithItem | null;
  table: TableAndStoreOwnerId | null;
};

/**
 * @access CachedOrderByGuard
 * @description if orderId is present in params, can use CachedOrder
 * @access CachedTableByGuard
 * @description if orderId is not present in params, can use CachedTable
 */
@Injectable()
export class OwnerOrderPermission implements CanActivate {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithClientAndOrderAndTable>();
    const client = request.user;
    const { storeId, tableId, orderId } = request.params;

    if (orderId) {
      const findOrder: PublicOrderWithItem =
        await this.orderService.getOrderById({
          type: 'OWNER',
          params: {
            storePublicId: storeId,
            tablePublicId: tableId,
            ownerId: client.id,
          },
          orderPublicId: orderId,
        });

      request.order = findOrder;
      return true;
    } else {
      const findTableAndStore: TableAndStoreOwnerId =
        await this.tableService.getTableById({
          storeId,
          tableId,
        });

      if (findTableAndStore.store.ownerId === client.id) {
        request.table = findTableAndStore;
        return true;
      }
    }
    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}
