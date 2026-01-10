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

type RequestWithTableSession = Request & {
  user: Owner;
  order: PublicOrderWithItem | null;
  table: TableAndStoreOwnerId | null;
};

@Injectable()
export class OwnerOrderPermission implements CanActivate {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableService: TableService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTableSession>();
    const client = request.user;
    const { storeId, tableId, orderId } = request.params;

    if (orderId) {
      const findOrder: PublicOrderWithItem =
        await this.orderService.getOrderById({
          type: 'OWNER',
          params: {
            orderPublicId: orderId,
            storePublicId: storeId,
            tablePublicId: tableId,
            ownerId: client.id,
          },
        });
      console.log('owner-order-permission----findOrder: ', findOrder);

      request.order = findOrder;
      return true;
    } else {
      const findTableAndStore: TableAndStoreOwnerId =
        await this.tableService.getTableById(
          { storeId, tableId },
          { include: { store: { select: { ownerId: true } } } },
        );
      console.log('owner-order-permission----: ', findTableAndStore);

      if (
        findTableAndStore.publicId === tableId &&
        findTableAndStore.store.ownerId === client.id
      ) {
        request.table = findTableAndStore;
        return true;
      }
    }
    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}
