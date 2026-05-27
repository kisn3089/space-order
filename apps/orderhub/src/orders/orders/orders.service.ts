import { Injectable } from "@nestjs/common";
import {
  OrderStatus,
  Owner,
  Prisma,
  PublicOrderWithItem,
  SessionWithTable,
  SummarizedOrdersByStore,
  TableSession,
  TableSessionStatus,
} from "@spaceorder/db";
import { SessionClient } from "src/internal/clients/session.client";
import { PrismaService } from "src/prisma/prisma.service";
import { orderSituationPayload } from "src/common/query/order-query.const";
import { ORDER_ITEMS_WITH_OMIT_PRIVATE } from "src/common/query/order-item-query.const";
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from "src/dto/order.dto";
import { createOrderItemsWithValidMenu } from "src/common/validate/order/create-order-item";
import { ALIVE_SESSION_STATUSES } from "src/common/query/session-query.const";
import { validateOrderSessionToWrite } from "src/common/validate/order/order-session-to-write";
import { MENU_VALIDATION_FIELDS_SELECT } from "src/common/query/menu-query.const";
import { TABLE_OMIT } from "src/common/query/table-query.const";
import { SessionIdentifier } from "src/internal/services/session-core.service";
import { OrderSubscriber } from "src/realtime/order-events.service";
import { MetaInfo } from "src/realtime/realtime.constants";

type CreateOrderParams = SessionIdentifier;
type CancelParams =
  | { kind: "owner"; orderId: string; ownerId: bigint }
  | { kind: "customer"; orderId: string; tableSession: TableSession };

type CreatedOrder = PublicOrderWithItem<
  "Wide",
  { sessionToken: string; expiresAt: Date }
>;
type UpdatedOrder = PublicOrderWithItem<"Wide">;

type ReturnOrder<Order extends CreatedOrder | UpdatedOrder, Meta = unknown> = {
  order: Order;
  subscriber: OrderSubscriber;
} & MetaInfo<Meta>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionClient: SessionClient
  ) {}

  async createOrder(
    params: CreateOrderParams,
    createOrderPayload: CreateOrderPayloadDto
  ): Promise<ReturnOrder<CreatedOrder, { tableNumber: number }>> {
    const { order, session } = await this.prismaService.$transaction(
      async (tx) => {
        const session: SessionWithTable =
          await this.sessionClient.txGetOrCreateSession(tx, params);

        const menuPublicIds = createOrderPayload.orderItems.map(
          (item) => item.menuPublicId
        );

        const menus = await tx.menu.findMany({
          where: {
            publicId: { in: menuPublicIds },
            deletedAt: null,
            category: { storeId: session.table.storeId },
          },
          select: MENU_VALIDATION_FIELDS_SELECT,
        });

        const orderItemsData = createOrderItemsWithValidMenu(
          createOrderPayload,
          menus,
          menuPublicIds
        );

        if (session.status !== TableSessionStatus.ACTIVE) {
          await this.sessionClient.updateSessionStatus(
            tx,
            session,
            TableSessionStatus.ACTIVE
          );
        }

        const order = await tx.order.create({
          data: {
            storeId: session.table.storeId,
            tableId: session.table.id,
            tableSessionId: session.id,
            orderItems: { create: orderItemsData },
            memo: createOrderPayload.memo,
          },
          include: {
            ...ORDER_ITEMS_WITH_OMIT_PRIVATE.include,
            tableSession: { select: { sessionToken: true, expiresAt: true } },
          },
          omit: ORDER_ITEMS_WITH_OMIT_PRIVATE.omit,
        });

        return { order, session };
      }
    );

    return {
      order,
      subscriber: {
        storePublicId: session.table.store.publicId,
        tablePublicId: session.table.publicId,
      },
      meta: { tableNumber: session.table.tableNumber },
    };
  }

  async getOrdersSummary(
    client: Owner,
    storeId: string
  ): Promise<SummarizedOrdersByStore> {
    return await this.prismaService.table.findMany({
      where: { store: { ownerId: client.id, publicId: storeId } },
      include: orderSituationPayload(),
      omit: TABLE_OMIT,
    });
  }

  async getOrdersByAliveSession(
    tableId: string
  ): Promise<PublicOrderWithItem<"Wide">[]> {
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
    args: Prisma.SelectSubset<T, Prisma.OrderFindManyArgs>
  ): Promise<Prisma.OrderGetPayload<T>[]> {
    return await this.prismaService.order.findMany(args);
  }

  async getOrderUnique<T extends Prisma.OrderFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderFindFirstOrThrowArgs>
  ): Promise<Prisma.OrderGetPayload<T>> {
    return await this.prismaService.order.findFirstOrThrow(args);
  }

  async partialUpdateOrder(
    orderId: string,
    ownerId: bigint,
    updatePayload: UpdateOrderPayloadDto
  ): Promise<ReturnOrder<UpdatedOrder, { orderStatus: OrderStatus }>> {
    const { order, subscriber } = await this.updateOrderWithValidation(
      { kind: "owner", orderId, ownerId },
      updatePayload
    );

    return { order, subscriber, meta: { orderStatus: order.status } };
  }

  async cancelOrder(params: CancelParams): Promise<ReturnOrder<UpdatedOrder>> {
    const { order, subscriber } = await this.updateOrderWithValidation(params, {
      status: OrderStatus.CANCELLED,
    });

    return { order, subscriber };
  }

  private async updateOrderWithValidation(
    params: CancelParams,
    data: Prisma.OrderUpdateInput
  ): Promise<ReturnOrder<UpdatedOrder>> {
    const whereClause: Prisma.OrderWhereInput =
      params.kind === "customer"
        ? { publicId: params.orderId, tableSessionId: params.tableSession.id }
        : {
            publicId: params.orderId,
            store: { ownerId: params.ownerId },
          };

    const order = await this.prismaService.order.findFirst({
      where: whereClause,
      include: {
        tableSession: true,
        store: { select: { publicId: true } },
        table: { select: { publicId: true, tableNumber: true } },
      },
    });

    const validOrder = validateOrderSessionToWrite(order);

    const updated = await this.prismaService.order.update({
      where: { id: validOrder.id },
      data,
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });

    return {
      order: updated,
      subscriber: {
        storePublicId: validOrder.store.publicId,
        tablePublicId: validOrder.table.publicId,
      },
    };
  }
}
