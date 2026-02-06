import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Order,
  OrderStatus,
  Owner,
  PublicOrderWithItem,
  SessionWithTable,
  SummarizedOrdersByStore,
  TableSession,
  TableSessionStatus,
} from '@spaceorder/db';
import { SessionService } from 'src/owner/session/session.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import {
  MENU_VALIDATION_FIELDS_SELECT,
  ORDER_ITEMS_WITH_OMIT_PRIVATE,
  ORDER_SITUATION_PAYLOAD,
} from 'src/common/query/order-query.const';
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from 'src/dto/order.dto';
import { createOrderItemsWithValidMenu } from 'src/common/validate/order/create-order-item';
import { ALIVE_SESSION_STATUSES } from 'src/common/query/session-query.const';

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
      const getActivatedSessionOrCreated: SessionWithTable =
        await this.sessionService.txGetActivatedSessionOrCreate(tx, tableId);

      const menuPublicIds = createOrderDto.orderItems.map(
        (item) => item.menuPublicId,
      );

      const findMenuList = await tx.menu.findMany({
        where: { publicId: { in: menuPublicIds }, deletedAt: null },
        select: MENU_VALIDATION_FIELDS_SELECT,
      });

      const bulkCreateOrderItems = createOrderItemsWithValidMenu(
        createOrderDto,
        findMenuList,
        menuPublicIds,
      );

      if (getActivatedSessionOrCreated.status !== TableSessionStatus.ACTIVE) {
        await this.sessionService.txableUpdateSession(
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
      omit: { id: true, storeId: true },
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
    const activeSession = await this.prismaService.tableSession.findFirst({
      where: {
        table: { publicId: tableId, store: { publicId: storeId } },
        expiresAt: { gt: new Date() },
        status: { in: ALIVE_SESSION_STATUSES },
      },
      select: { id: true },
    });

    if (!activeSession) {
      return [];
    }

    return await this.prismaService.order.findMany({
      where: {
        store: { publicId: storeId },
        tableSessionId: activeSession.id,
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
    { storeId, orderId }: StoreIdWithOrderParams,
    updatePayload: UpdateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    const order = await this.findOrderWithSession({ storeId, orderId });

    this.validateOrderAndSessionActive(order);

    return await this.prismaService.order.update({
      where: { store: { publicId: storeId }, publicId: orderId },
      data: updatePayload,
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  private async findOrderWithSession({
    storeId,
    orderId,
  }: StoreIdWithOrderParams) {
    return await this.prismaService.order.findFirst({
      where: { publicId: orderId, store: { publicId: storeId } },
      include: { tableSession: true },
    });
  }

  private validateOrderAndSessionActive(
    order: (Order & { tableSession: TableSession }) | null,
  ) {
    if (!order) {
      throw new HttpException(
        exceptionContentsIs('NOT_FOUND'),
        HttpStatus.NOT_FOUND,
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new HttpException(
        exceptionContentsIs('ORDER_ALREADY_CANCELLED'),
        HttpStatus.BAD_REQUEST,
      );
    }

    this.validateSessionActive(order.tableSession.status);
    return true;
  }

  private validateSessionActive(status: TableSessionStatus) {
    if (
      status !== TableSessionStatus.ACTIVE &&
      status !== TableSessionStatus.WAITING_ORDER
    ) {
      throw new HttpException(
        exceptionContentsIs('SESSION_INACTIVE'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async cancelOrder({
    storeId,
    orderId,
  }: StoreIdWithOrderParams): Promise<PublicOrderWithItem<'Wide'>> {
    const order = await this.findOrderWithSession({ storeId, orderId });

    this.validateOrderAndSessionActive(order);

    return await this.prismaService.order.update({
      where: { store: { publicId: storeId }, publicId: orderId },
      data: { status: OrderStatus.CANCELLED },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
