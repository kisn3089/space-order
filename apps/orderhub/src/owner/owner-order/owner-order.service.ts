import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  Owner,
  Prisma,
  PublicOrderWithItem,
  SessionWithTable,
  SummarizedOrdersByStore,
  TableSessionStatus,
} from '@spaceorder/db';
import { SessionService } from 'src/owner/session/session.service';
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

type TableIdParams = { tableId: string };
type OrderIdParams = { orderId: string };
type StoreIdWithOrderParams = { storeId: string } & OrderIdParams;
type StoreIdWithTableParams = { storeId: string } & TableIdParams;

@Injectable()
export class OwnerOrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async createOrder(
    { tableId }: TableIdParams,
    createOrderDto: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.$transaction(async (tx) => {
      const session: SessionWithTable =
        await this.sessionService.txGetActivatedSessionOrCreate(tx, tableId);

      const menuPublicIds = createOrderDto.orderItems.map(
        (item) => item.menuPublicId,
      );

      const menus = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds }, deletedAt: null },
        select: MENU_VALIDATION_FIELDS_SELECT,
      });

      const orderItemsData = createOrderItemsWithValidMenu(
        createOrderDto,
        menus,
        menuPublicIds,
      );

      if (session.status !== TableSessionStatus.ACTIVE) {
        await this.sessionService.txableUpdateSession(
          session,
          { status: TableSessionStatus.ACTIVE },
          tx,
        );
      }

      return await tx.order.create({
        data: {
          storeId: session.table.storeId,
          tableId: session.table.id,
          tableSessionId: session.id,
          orderItems: { create: orderItemsData },
          memo: createOrderDto.memo,
        },
        ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
      });
    });
  }

  async getOrdersBoard(
    client: Owner,
    storeId: string,
  ): Promise<SummarizedOrdersByStore> {
    return await this.prismaService.table.findMany({
      where: { store: { ownerId: client.id, publicId: storeId } },
      include: ORDER_SITUATION_PAYLOAD,
      omit: TABLE_OMIT,
    });
  }

  async getOrderListByTable({
    storeId,
    tableId,
  }: StoreIdWithTableParams): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.prismaService.order.findMany({
      where: { store: { publicId: storeId }, table: { publicId: tableId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrdersByAliveSession({
    storeId,
    tableId,
  }: StoreIdWithTableParams): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.prismaService.order.findMany({
      where: {
        table: { publicId: tableId },
        store: { publicId: storeId },
        tableSession: {
          expiresAt: { gt: new Date() },
          status: { in: ALIVE_SESSION_STATUSES },
        },
      },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrderUniqueByTable({
    storeId,
    tableId,
    orderId,
  }: StoreIdWithTableParams & OrderIdParams): Promise<
    PublicOrderWithItem<'Wide'>
  > {
    return await this.prismaService.order.findFirstOrThrow({
      where: {
        store: { publicId: storeId },
        table: { publicId: tableId },
        publicId: orderId,
      },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrderListByStore(
    storeId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.prismaService.order.findMany({
      where: { store: { publicId: storeId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async getOrderUnique({
    storeId,
    orderId,
  }: StoreIdWithOrderParams): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.prismaService.order.findFirstOrThrow({
      where: { store: { publicId: storeId }, publicId: orderId },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  async partialUpdateOrder(
    params: StoreIdWithOrderParams,
    updatePayload: UpdateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return this.updateOrderWithValidation(params, updatePayload);
  }

  async cancelOrder(
    params: StoreIdWithOrderParams,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return this.updateOrderWithValidation(params, {
      status: OrderStatus.CANCELLED,
    });
  }

  private async updateOrderWithValidation(
    { storeId, orderId }: StoreIdWithOrderParams,
    data: Prisma.OrderUpdateInput,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    const order = await this.prismaService.order.findFirst({
      where: { publicId: orderId, store: { publicId: storeId } },
      include: { tableSession: true },
    });

    validateOrderSessionToWrite(order);

    return await this.prismaService.order.update({
      where: { publicId: orderId, store: { publicId: storeId } },
      data,
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
