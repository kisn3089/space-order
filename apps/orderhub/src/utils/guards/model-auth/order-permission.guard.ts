import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { BaseOrderParams, OrderIdParams } from 'src/order/order.service';
import { Order } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { IncludingIdTableSession } from '../table-session-auth.guard';

type RequestWithTableSession = Request & {
  tableSession: IncludingIdTableSession;
};

@Injectable()
export class OrderPermission implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithTableSession>();
    const tableSession = request.tableSession;
    const { orderId, storeId, tableId } = request.params;

    if (orderId) {
      const findOrder = await this.getOrderById({
        orderId,
        storeId,
        tableId,
        tableSession,
      });
      if (findOrder) {
        return true;
      }
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

  private async getOrderById(
    params: BaseOrderParams & OrderIdParams,
  ): Promise<Order> {
    return await this.prismaService.order.findFirstOrThrow({
      where: {
        publicId: params.orderId,
        store: { publicId: params.storeId },
        table: { publicId: params.tableId },
        tableSession: { id: params.tableSession.id },
      },
    });
  }
}
