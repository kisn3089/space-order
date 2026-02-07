import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PublicOrderWithItem,
  TableSession,
  TableSessionStatus,
} from '@spaceorder/db';
import { SessionService } from '../session/session.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ORDER_ITEMS_WITH_OMIT_PRIVATE } from 'src/common/query/order-item-query.const';
import { createOrderItemsWithValidMenu } from 'src/common/validate/order/create-order-item';
import { CreateOrderPayloadDto } from 'src/dto/order.dto';
import { MENU_VALIDATION_FIELDS_SELECT } from 'src/common/query/menu-query.const';

type OrderIdParams = { orderId: string };
type SessionParams = { tableSession: TableSession };

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async createOrder(
    tableSession: TableSession,
    createOrderPayload: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const menuPublicIds = createOrderPayload.orderItems.map(
        (item) => item.menuPublicId,
      );

      const [findMenuList, table] = await Promise.all([
        tx.menu.findMany({
          where: { publicId: { in: menuPublicIds }, deletedAt: null },
          select: MENU_VALIDATION_FIELDS_SELECT,
        }),
        tx.table.findUniqueOrThrow({
          where: { id: tableSession.tableId },
          select: { storeId: true },
        }),
      ]);

      const bulkCreateOrderItems = createOrderItemsWithValidMenu(
        createOrderPayload,
        findMenuList,
        menuPublicIds,
      );

      if (tableSession.status !== TableSessionStatus.ACTIVE) {
        await this.sessionService.txUpdateSession(
          tableSession,
          { status: TableSessionStatus.ACTIVE },
          tx,
        );
      }

      return await tx.order.create({
        data: {
          storeId: table.storeId,
          tableId: tableSession.tableId,
          tableSessionId: tableSession.id,
          orderItems: { create: bulkCreateOrderItems },
          memo: createOrderPayload.memo,
        },
        ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
      });
    });
  }

  async getOrderList(
    tableSession: TableSession,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.prismaService.order.findMany({
      where: this.whereSessionIdRecord({ tableSession }),
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrderUnique({
    tableSession,
    orderId,
  }: SessionParams & OrderIdParams): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.order.findUniqueOrThrow({
      where: {
        publicId: orderId,
        ...this.whereSessionIdRecord({ tableSession }),
      },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  private whereSessionIdRecord({ tableSession }: SessionParams) {
    return { tableSessionId: tableSession.id };
  }

  async cancelOrder(
    params: SessionParams & OrderIdParams,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.order.update({
      where: { publicId: params.orderId, ...this.whereSessionIdRecord(params) },
      data: { status: OrderStatus.CANCELLED },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
