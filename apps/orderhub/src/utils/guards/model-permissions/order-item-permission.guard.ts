import { Request } from 'express';
import { CanActivate } from '@nestjs/common/interfaces/features/can-activate.interface';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import { OrderItem, Owner, TableSessionStatus } from '@spaceorder/db';
import { OrderItemService } from 'src/order-item/orderItem.service';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { ForbiddenException } from '@nestjs/common/exceptions/forbidden.exception';

type RequestWithOrderItem = Request & {
  user: Owner;
  orderItem: OrderItem | null;
};

/**
 * @access CachedOrderItemByGuard
 * @description if orderItemId is present in params, can use CachedOrderItemByGuard
 */
@Injectable()
export class OrderItemPermission implements CanActivate {
  constructor(private readonly orderItemService: OrderItemService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOrderItem>();
    const { orderId, orderItemId } = request.params;

    const client = request.user;
    const findOrderItemFromAliveSession =
      await this.orderItemService.getOrderItemById({
        where: {
          order: {
            publicId: orderId,
            tableSession: {
              status: TableSessionStatus.ACTIVE,
              expiresAt: { gt: new Date() },
            },
            table: { store: { ownerId: client.id } },
          },
          publicId: orderItemId,
        },
      });

    if (findOrderItemFromAliveSession) {
      request.orderItem = findOrderItemFromAliveSession;
      return true;
    }

    throw new ForbiddenException(exceptionContentsIs('FORBIDDEN'));
  }
}
