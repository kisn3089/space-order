import { Request } from 'express';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Owner, ResponseOrderWithItem, Table } from '@spaceorder/db';
import { TableService } from 'src/table/table.service';

type RequestWithClientAndOrderAndTable = Request & {
  user: Owner;
  order: ResponseOrderWithItem | null;
  table: Table | null;
};

/**
 * @access CachedOrderByGuard
 * @description if orderId is present in params, can use CachedOrderByGuard
 * @access CachedTableByGuard
 * @description if orderId is not present in params, can use CachedTableByGuard
 */
@Injectable()
export class OwnerOrderPermission implements CanActivate {
  constructor(
    protected readonly orderService: OrderService,
    private readonly tableService: TableService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithClientAndOrderAndTable>();
    const client = request.user;
    const { storeId, tableId, orderId } = request.params;

    return await this.validateOwnerOrderPermission(
      request,
      { storeId, tableId, orderId },
      client,
    );
  }

  async validateOwnerOrderPermission(
    request: RequestWithClientAndOrderAndTable,
    params: { storeId: string; tableId: string; orderId: string },
    client: Owner,
  ) {
    const { storeId, tableId, orderId } = params;
    if (orderId) {
      const findOrder: ResponseOrderWithItem =
        await this.validateTableWithOrder(
          { storeId, tableId, orderId },
          client,
        );

      request.order = findOrder;
      return true;
    } else {
      const findTableAndStore: Table = await this.validateTableCanRead(
        { storeId, tableId },
        client,
      );

      request.table = findTableAndStore;
      return true;
    }
  }

  async validateTableWithOrder(
    params: { storeId: string; tableId: string; orderId: string },
    client: Owner,
    type: 'OWNER' | 'WRITE' = 'OWNER',
  ): Promise<ResponseOrderWithItem> {
    return await this.orderService.getOrderUnique({
      type,
      params: {
        storePublicId: params.storeId,
        tablePublicId: params.tableId,
        ownerId: client.id,
      },
      orderPublicId: params.orderId,
    });
  }

  async validateTableCanRead(
    params: { storeId: string; tableId: string },
    client: Owner,
  ): Promise<Table> {
    return await this.tableService.getTableUnique({
      where: {
        publicId: params.tableId,
        store: { publicId: params.storeId, ownerId: client.id },
      },
    });
  }
}

/**
 * @access CachedOrderByGuard
 * @description if orderId is present in params, can use CachedOrderByGuard
 */
@Injectable()
export class OwnerOrderWritePermission extends OwnerOrderPermission {
  async validateOwnerOrderPermission(
    request: RequestWithClientAndOrderAndTable,
    params: { storeId: string; tableId: string; orderId: string },
    client: Owner,
  ) {
    const findOrder = await this.validateTableWithOrder(
      params,
      client,
      'WRITE',
    );

    request.order = findOrder;
    return true;
  }
}
