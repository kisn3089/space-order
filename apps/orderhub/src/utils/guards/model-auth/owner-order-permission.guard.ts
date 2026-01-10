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
 * @access CachedOrder
 * @access CachedTable 현재는 저장은 하지만 해당 데코레이터를 사용하면서 CachedTable를 사용하지 않고 있음.
 * @description Guard to check permission to access the order or table and cache the result.
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
