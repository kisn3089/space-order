import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, PublicOrderItem } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { getValidatedMenuOptionsSnapshot } from 'src/common/validate/menu/options';
import {
  CreateOrderItemPayloadDto,
  UpdateOrderItemPayloadDto,
} from 'src/dto/order-item.dto';
import { Tx } from 'src/utils/helper/transactionPipe';
import { validateOrderSessionToWrite } from 'src/common/validate/order/order-session-to-write';
import { validateMenuAvailableOrThrow } from 'src/common/validate/menu/available';
import { MENU_VALIDATION_FIELDS_SELECT } from 'src/common/query/order-query.const';

type StoreIdAndOrderIdParams = {
  storeId: string;
  orderId: string;
};
type StoreIdAndOrderItemIdParams = {
  storeId: string;
  orderItemId: string;
};
@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}
  readonly omitPrivate = { id: true, orderId: true, menuId: true } as const;

  async createOrderItem(
    { orderId, storeId }: StoreIdAndOrderIdParams,
    createPayload: CreateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      createPayload;

    const [menu, order] = await Promise.all([
      this.prismaService.menu.findFirstOrThrow(
        this.buildMenuQuery(menuPublicId, storeId),
      ),
      this.prismaService.order.findFirstOrThrow(
        this.buildOrderQuery(orderId, storeId),
      ),
    ]);

    validateOrderSessionToWrite(order);
    validateMenuAvailableOrThrow(menu.isAvailable);

    const { optionsPrice, optionsSnapshot } = getValidatedMenuOptionsSnapshot(
      menu,
      {
        requiredOptions,
        customOptions,
      },
    );

    return await this.prismaService.orderItem.create({
      data: {
        menuId: menu.id,
        menuName: menu.name,
        basePrice: menu.price,
        unitPrice: menu.price + optionsPrice,
        optionsPrice,
        quantity,
        orderId: order.id,
        optionsSnapshot,
      },
      omit: this.omitPrivate,
    });
  }

  private buildMenuQuery(menuId: string | bigint, storeId: string) {
    const menuIdField =
      typeof menuId === 'string' ? { menuPublicId: menuId } : { id: menuId };

    return {
      where: { ...menuIdField, store: { publicId: storeId }, deletedAt: null },
      select: MENU_VALIDATION_FIELDS_SELECT,
    };
  }

  private buildOrderQuery(orderId: string, storeId: string) {
    return {
      where: { publicId: orderId, store: { publicId: storeId } },
      include: { tableSession: true },
    } as const;
  }

  async getOrderItemList<T extends Prisma.OrderItemFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindManyArgs>,
  ): Promise<Prisma.OrderItemGetPayload<T>[]> {
    return await this.prismaService.orderItem.findMany(args);
  }

  async getOrderItemUnique<T extends Prisma.OrderItemFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OrderItemFindFirstOrThrowArgs>,
    tx?: Tx,
  ): Promise<Prisma.OrderItemGetPayload<T>> {
    const service = tx ?? this.prismaService;
    return await service.orderItem.findFirstOrThrow(args);
  }

  async partialUpdateOrderItem(
    { orderItemId, storeId }: StoreIdAndOrderItemIdParams,
    updatePayload: UpdateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    const { menuPublicId, requiredOptions, customOptions, quantity } =
      updatePayload;

    const whereCondition = {
      publicId: orderItemId,
      order: { store: { publicId: storeId } },
    } as const;

    /** 메뉴에 관한 업데이트가 없을 때 */
    if (!menuPublicId && !requiredOptions && !customOptions) {
      const orderItem = await this.prismaService.orderItem.findFirstOrThrow({
        where: whereCondition,
        include: { order: { include: { tableSession: true } } },
      });
      validateOrderSessionToWrite(orderItem.order);

      return await this.prismaService.orderItem.update({
        where: whereCondition,
        data: updatePayload,
        omit: this.omitPrivate,
      });
    }

    /** 한 번의 쿼리로 orderItem + menu + order 모두 조회 */
    const orderItem = await this.prismaService.orderItem.findFirstOrThrow({
      where: whereCondition,
      include: {
        menu: { select: MENU_VALIDATION_FIELDS_SELECT },
        order: { include: { tableSession: true } },
      },
    });

    validateOrderSessionToWrite(orderItem.order);

    /** menuPublicId가 있으면 새 메뉴 조회, 없으면 기존 메뉴 사용 */
    const menu = menuPublicId
      ? await this.prismaService.menu.findFirstOrThrow(
          this.buildMenuQuery(menuPublicId, storeId),
        )
      : orderItem.menu;

    validateMenuAvailableOrThrow(menu.isAvailable);

    const { optionsPrice, optionsSnapshot } = getValidatedMenuOptionsSnapshot(
      menu,
      {
        requiredOptions,
        customOptions,
      },
    );

    return await this.prismaService.orderItem.update({
      where: whereCondition,
      data: {
        menu: { connect: { id: menu.id } },
        menuName: menu.name,
        basePrice: menu.price,
        unitPrice: menu.price + optionsPrice,
        optionsPrice,
        quantity,
        optionsSnapshot,
      },
      omit: this.omitPrivate,
    });
  }

  async deleteOrderItem({
    orderItemId,
    storeId,
  }: StoreIdAndOrderItemIdParams): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const parentOrder = await tx.order.findFirst({
        where: {
          orderItems: { some: { publicId: orderItemId } },
          store: { publicId: storeId },
        },
        include: {
          tableSession: true,
          _count: { select: { orderItems: true } },
        },
      });

      const validatedOrder = validateOrderSessionToWrite(parentOrder);

      await tx.orderItem.delete({ where: { publicId: orderItemId } });

      if (validatedOrder._count.orderItems === 1) {
        await tx.order.update({
          where: { id: validatedOrder.id },
          data: { status: OrderStatus.CANCELLED },
        });
      }
    });
  }
}
