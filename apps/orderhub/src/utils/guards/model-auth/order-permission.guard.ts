import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { OrderService } from 'src/order/order.service';
import { IncludingIdTableSession } from '../table-session-auth.guard';
import { PublicOrderWithItem } from '@spaceorder/db';

type RequestWithTableSession = Request & {
  tableSession: IncludingIdTableSession;
  order: PublicOrderWithItem | null;
};

@Injectable()
export class OrderPermission implements CanActivate {
  constructor(private readonly orderService: OrderService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTableSession>();
    const tableSession = request.tableSession;
    const { orderId, storeId, tableId } = request.params;

    if (orderId) {
      const findOrder = await this.orderService.getOrderById({
        orderId,
        storeId,
        tableId,
        tableSession,
      });
      request.order = findOrder;
      return true;
    } else {
      if (
        tableSession.table.publicId === tableId &&
        tableSession.table.store.publicId === storeId
      ) {
        return true;
      }
    }
    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}
