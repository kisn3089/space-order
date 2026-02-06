import { Request } from 'express';
import { CanActivate } from '@nestjs/common/interfaces/features/can-activate.interface';
import { ExecutionContext } from '@nestjs/common/interfaces/features/execution-context.interface';
import {
  OrderItem,
  OrderStatus,
  Owner,
  TableSessionStatus,
} from '@spaceorder/db';
import { OrderItemService } from 'src/owner/order-item/orderItem.service';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { HttpException, HttpStatus } from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

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
  constructor(protected readonly orderItemService: OrderItemService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOrderItem>();
    const { orderId, orderItemId } = request.params;

    const client = request.user;
    const findOrderItemFromAliveSession = await this.findOrderItem(
      orderId,
      orderItemId,
      client,
    );

    request.orderItem = findOrderItemFromAliveSession;
    return true;
  }

  async findOrderItem(
    orderId: string,
    orderItemId: string | undefined,
    client: Owner,
  ): Promise<OrderItem> {
    return await this.orderItemService.getOrderItemUnique({
      where: {
        order: { publicId: orderId, table: { store: { ownerId: client.id } } },
        ...(orderItemId ? { publicId: orderItemId } : {}),
      },
    });
  }
}

export class OrderItemWritePermission extends OrderItemPermission {
  async findOrderItem(
    orderId: string,
    orderItemId: string | undefined,
    client: Owner,
  ): Promise<OrderItem> {
    const orderItemWithSession = await this.orderItemService.getOrderItemUnique(
      {
        where: {
          order: {
            publicId: orderId,
            table: { store: { ownerId: client.id } },
            status: {
              in: [
                OrderStatus.ACCEPTED,
                OrderStatus.PREPARING,
                OrderStatus.PENDING,
              ],
            },
          },
          ...(orderItemId ? { publicId: orderItemId } : {}),
        },
        include: {
          order: {
            include: {
              tableSession: { select: { status: true, expiresAt: true } },
            },
          },
        },
      },
    );

    if (
      orderItemWithSession.order.tableSession.status !==
        TableSessionStatus.ACTIVE ||
      orderItemWithSession.order.tableSession.expiresAt < new Date()
    ) {
      throw new HttpException(
        exceptionContentsIs('TABLE_SESSION_NOT_ACTIVE'),
        HttpStatus.FORBIDDEN,
      );
    }

    return orderItemWithSession;
  }
}
