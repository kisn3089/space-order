import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  Owner,
  Prisma,
  PublicOrderWithItem,
  SessionWithTable,
  SummarizedOrdersByStore,
  TableSession,
  TableSessionStatus,
} from '@spaceorder/db';
import { SessionClient } from 'src/internal/clients/session.client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ORDER_SITUATION_PAYLOAD } from 'src/common/query/order-query.const';
import { ORDER_ITEMS_WITH_OMIT_PRIVATE } from 'src/common/query/order-item-query.const';
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from 'src/dto/order.dto';
import { createOrderItemsWithValidMenu } from 'src/common/validate/order/create-order-item';
import { ALIVE_SESSION_STATUSES } from 'src/common/query/session-query.const';
import { validateOrderSessionToWrite } from 'src/common/validate/order/order-session-to-write';
import { MENU_VALIDATION_FIELDS_SELECT } from 'src/common/query/menu-query.const';
import { TABLE_OMIT } from 'src/common/query/table-query.const';
import { SessionIdentifier } from 'src/internal/services/session-core.service';

type CreateOrderParams = SessionIdentifier;
type CancelParams =
  | { orderId: string }
  | { tableSession: TableSession; orderId: string };

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionClient: SessionClient,
  ) {}

  async createOrder(
    params: CreateOrderParams,
    createOrderPayload: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const session: SessionWithTable =
        await this.sessionClient.txGetOrCreateSession(tx, params);

      const menuPublicIds = createOrderPayload.orderItems.map(
        (item) => item.menuPublicId,
      );

      const menus = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds }, deletedAt: null },
        select: MENU_VALIDATION_FIELDS_SELECT,
      });

      const orderItemsData = createOrderItemsWithValidMenu(
        createOrderPayload,
        menus,
        menuPublicIds,
      );

      if (session.status !== TableSessionStatus.ACTIVE) {
        await this.sessionClient.updateSessionStatus(
          tx,
          session,
          TableSessionStatus.ACTIVE,
        );
      }

      return await tx.order.create({
        data: {
          storeId: session.table.storeId,
          tableId: session.table.id,
          tableSessionId: session.id,
          orderItems: { create: orderItemsData },
          memo: createOrderPayload.memo,
        },
        ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
      });
    });
  }

  async getOrdersSummary(
    client: Owner,
    storeId: string,
  ): Promise<SummarizedOrdersByStore> {
    return await this.prismaService.table.findMany({
      where: { store: { ownerId: client.id, publicId: storeId } },
      include: ORDER_SITUATION_PAYLOAD,
      omit: TABLE_OMIT,
    });
  }

  async getOrdersByAliveSession(
    tableId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.prismaService.order.findMany({
      where: {
        table: { publicId: tableId },
        tableSession: {
          expiresAt: { gt: new Date() },
          status: { in: ALIVE_SESSION_STATUSES },
        },
      },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrderList<T extends Prisma.OrderFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderFindManyArgs>,
  ): Promise<Prisma.OrderGetPayload<T>[]> {
    return await this.prismaService.order.findMany(args);
  }

  async getOrderUnique<T extends Prisma.OrderFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderFindFirstOrThrowArgs>,
  ): Promise<Prisma.OrderGetPayload<T>> {
    return await this.prismaService.order.findFirstOrThrow(args);
  }

  async partialUpdateOrder(
    orderId: string,
    updatePayload: UpdateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return this.updateOrderWithValidation({ orderId }, updatePayload);
  }

  async cancelOrder(
    params: CancelParams,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return this.updateOrderWithValidation(params, {
      status: OrderStatus.CANCELLED,
    });
  }

  private async updateOrderWithValidation(
    params: CancelParams,
    data: Prisma.OrderUpdateInput,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    const whereClause =
      'tableSession' in params
        ? { publicId: params.orderId, tableSessionId: params.tableSession.id }
        : { publicId: params.orderId };

    const order = await this.prismaService.order.findFirst({
      where: whereClause,
      include: { tableSession: true },
    });

    const validOrder = validateOrderSessionToWrite(order);

    return await this.prismaService.order.update({
      where: { id: validOrder.id },
      data,
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
