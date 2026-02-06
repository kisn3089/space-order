import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PublicOrderWithItem,
  SessionWithTable,
  TableSessionStatus,
} from '@spaceorder/db';
import { SessionService } from '../session/session.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MENU_VALIDATION_FIELDS_SELECT,
  ORDER_ITEMS_WITH_OMIT_PRIVATE,
} from 'src/common/query/order-query.const';
import { createOrderItemsWithValidMenu } from 'src/common/validate/order/create-order-item';
import { CreateOrderPayloadDto } from 'src/dto/order.dto';

type OrderIdParams = { orderId: string };
type SessionParams = { tableSession: SessionWithTable };

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async createOrder(
    { tableSession }: SessionParams,
    createOrderPayload: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const getActivatedSessionOrCreated: SessionWithTable = tableSession;

      const menuPublicIds = createOrderPayload.orderItems.map(
        (item) => item.menuPublicId,
      );

      const findMenuList = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds }, deletedAt: null },
        select: MENU_VALIDATION_FIELDS_SELECT,
      });

      const bulkCreateOrderItems = createOrderItemsWithValidMenu(
        createOrderPayload,
        findMenuList,
        menuPublicIds,
      );

      if (getActivatedSessionOrCreated.status !== TableSessionStatus.ACTIVE) {
        await this.sessionService.txUpdateSession(
          getActivatedSessionOrCreated,
          { status: TableSessionStatus.ACTIVE },
          tx,
        );
      }

      return await tx.order.create({
        data: {
          storeId: getActivatedSessionOrCreated.table.storeId,
          tableId: getActivatedSessionOrCreated.table.id,
          tableSessionId: getActivatedSessionOrCreated.id,
          orderItems: { create: bulkCreateOrderItems },
          memo: createOrderPayload.memo,
        },
        ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
      });
    });
  }

  async getOrderList({
    tableSession,
  }: SessionParams): Promise<PublicOrderWithItem<'Wide'>[]> {
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
