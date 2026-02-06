import { Injectable } from '@nestjs/common';
import {
  OrderItem,
  OrderStatus,
  Owner,
  Prisma,
  PublicOrderItem,
} from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { getValidatedMenuOptionsSnapshot } from 'src/common/validate/menu/options';
import { CreateOrderItemDto } from 'src/dto/create/order-item.dto';
import { UpdateOrderItemDto } from 'src/dto/update/order-item.dto';

type MenuId = { id: bigint } | { publicId: string };
@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}

  orderItemOmit = { id: true, orderId: true, menuId: true } as const;

  async createOrderItem(
    orderPublicId: string,
    createPayload: CreateOrderItemDto,
    client: Owner,
  ): Promise<PublicOrderItem<'Wide'>> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      createPayload;
    const [findMenu, findOrder] = await Promise.all([
      this.prismaService.menu.findFirstOrThrow(
        this.findMenuFields({ publicId: menuPublicId }, client),
      ),
      this.prismaService.order.findFirstOrThrow(
        this.findOrderFields(orderPublicId),
      ),
    ]);

    const { optionsPrice, optionsSnapshot } = getValidatedMenuOptionsSnapshot(
      findMenu,
      {
        requiredOptions,
        customOptions,
      },
    );

    return await this.prismaService.orderItem.create({
      data: {
        menuId: findMenu.id,
        menuName: findMenu.name,
        basePrice: findMenu.price,
        unitPrice: findMenu.price + optionsPrice,
        optionsPrice,
        quantity,
        orderId: findOrder.id,
        optionsSnapshot,
      },
      omit: this.orderItemOmit,
    });
  }

  private findMenuFields(menuId: MenuId, client: Owner) {
    return {
      where: { ...menuId, store: { ownerId: client.id }, deletedAt: null },
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
  ): Promise<PublicOrderItem<'Wide'>> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      updatePayload;
    if (!menuPublicId && !requiredOptions && !customOptions) {
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

    const { optionsPrice, optionsSnapshot } = getValidatedMenuOptionsSnapshot(
      findMenu,
      {
        requiredOptions,
        customOptions,
      },
    );

    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: {
        menu: { connect: { id: findMenu.id } },
        menuName: findMenu.name,
        basePrice: findMenu.price,
        unitPrice: findMenu.price + optionsPrice,
        optionsPrice,
        quantity,
        optionsSnapshot,
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
