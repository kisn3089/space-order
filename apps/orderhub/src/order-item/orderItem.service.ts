import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Menu,
  OrderItem,
  OrderStatus,
  Owner,
  Prisma,
  ResponseOrderItem,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto, UpdateOrderItemDto } from './orderItem.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

type MenuId = { id: bigint } | { publicId: string };
@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}

  orderItemOmit = { id: true, orderId: true, menuId: true } as const;

  async createOrderItem(
    orderPublicId: string,
    createPayload: CreateOrderItemDto,
    client: Owner,
  ): Promise<ResponseOrderItem> {
    const [findMenu, findOrder] = await Promise.all([
      this.prismaService.menu.findFirstOrThrow(
        this.findMenuFields({ publicId: createPayload.menuPublicId }, client),
      ),
      this.prismaService.order.findFirstOrThrow(
        this.findOrderFields(orderPublicId),
      ),
    ]);

    this.validateMenuOptions(findMenu, createPayload.options);

    return await this.prismaService.orderItem.create({
      data: {
        menuId: findMenu.id,
        menuName: findMenu.name,
        price: findMenu.price,
        quantity: createPayload.quantity,
        orderId: findOrder.id,
        ...(createPayload.options ? { options: createPayload.options } : {}),
      },
      omit: this.orderItemOmit,
    });
  }

  private findMenuFields(menuId: MenuId, client: Owner) {
    return {
      where: { ...menuId, store: { ownerId: client.id } },
      select: {
        id: true,
        name: true,
        price: true,
        requiredOptions: true,
        customOptions: true,
      },
    };
  }

  private findOrderFields(orderPublicId: string) {
    return {
      where: { publicId: orderPublicId },
      select: { id: true },
    };
  }

  private validateMenuOptions(
    findMenu: Pick<Menu, 'requiredOptions' | 'customOptions'>,
    options: CreateOrderItemDto['options'],
  ): void {
    if (options && !(findMenu.requiredOptions || findMenu.customOptions)) {
      throw new HttpException(
        exceptionContentsIs('ORDER_ITEM_OPTIONS_INVALID'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getOrderItemList<T extends Prisma.OrderItemFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindManyArgs>,
  ): Promise<Prisma.OrderItemGetPayload<T>[]> {
    return await this.prismaService.orderItem.findMany(args);
  }

  async getOrderItemUnique<T extends Prisma.OrderItemFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindFirstOrThrowArgs>,
  ): Promise<Prisma.OrderItemGetPayload<T>> {
    return await this.prismaService.orderItem.findFirstOrThrow(args);
  }

  async partialUpdateOrderItem(
    orderItemPublicId: string,
    updatePayload: UpdateOrderItemDto,
    client: Owner,
    cachedOrderItem: OrderItem,
  ): Promise<ResponseOrderItem> {
    const { menuPublicId, options, quantity } = updatePayload;
    if (!menuPublicId && !options) {
      return await this.prismaService.orderItem.update({
        where: { publicId: orderItemPublicId },
        data: updatePayload,
        omit: this.orderItemOmit,
      });
    }

    const menuId = menuPublicId
      ? { publicId: menuPublicId }
      : { id: cachedOrderItem.menuId };
    const findMenu = await this.prismaService.menu.findFirstOrThrow(
      this.findMenuFields(menuId, client),
    );

    this.validateMenuOptions(findMenu, options);

    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: {
        menu: { connect: { id: findMenu.id } },
        menuName: findMenu.name,
        price: findMenu.price,
        quantity,
        options,
      },
      omit: this.orderItemOmit,
    });
  }

  async deleteOrderItem(
    orderItemPublicId: string,
    cachedOrderItem: OrderItem,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.orderItem.delete({ where: { publicId: orderItemPublicId } });

      const remainingItems = await tx.orderItem.count({
        where: { orderId: cachedOrderItem.orderId },
      });

      if (remainingItems === 0) {
        /**
         * order.cancelOrder 메서드와 다르게 살아있는 tableSession임을 검증하지 않는 이유는
         * controller에서 OrderItemWritePermission 가드가 이미 검증을 수행했기 때문이다.
         *
         * @see orderService.cancelOrder
         * @see OrderItemWritePermission
         */
        await tx.order.update({
          where: { id: cachedOrderItem.orderId },
          data: { status: OrderStatus.CANCELLED },
        });
      }
    });
  }
}
