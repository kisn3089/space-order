import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Menu, Prisma, ResponseOrderItem } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto, UpdateOrderItemDto } from './orderItem.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}

  orderItemOmit = { id: true, orderId: true, menuId: true } as const;

  async createOrderItem(
    orderPublicId: string,
    createData: CreateOrderItemDto,
  ): Promise<ResponseOrderItem> {
    const [findMenu, findOrder] = await Promise.all([
      this.prismaService.menu.findFirstOrThrow(
        this.findMenuFields(createData.menuPublicId),
      ),
      this.prismaService.order.findFirstOrThrow(
        this.findOrderFields(orderPublicId),
      ),
    ]);

    this.canMenuHasOptions(findMenu, createData.options);

    return await this.prismaService.orderItem.create({
      data: {
        menuId: findMenu.id,
        menuName: findMenu.name,
        price: findMenu.price,
        quantity: createData.quantity,
        orderId: findOrder.id,
        ...(createData.options ? { options: createData.options } : {}),
      },
      omit: this.orderItemOmit,
    });
  }

  private findMenuFields(menuPublicId: string) {
    return {
      where: { publicId: menuPublicId },
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

  private canMenuHasOptions(
    findMenu: Pick<Menu, 'requiredOptions' | 'customOptions'>,
    options: CreateOrderItemDto['options'],
  ): boolean {
    if (options && !(findMenu.requiredOptions || findMenu.customOptions)) {
      throw new HttpException(
        exceptionContentsIs('ORDER_ITEM_OPTIONS_INVALID'),
        HttpStatus.BAD_REQUEST,
      );
    }

    return true;
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
    updatePaylod: UpdateOrderItemDto,
  ): Promise<ResponseOrderItem> {
    if (!updatePaylod.menuPublicId) {
      return await this.prismaService.orderItem.update({
        where: { publicId: orderItemPublicId },
        data: updatePaylod,
        omit: this.orderItemOmit,
      });
    }

    const { menuPublicId, ...omitedUpdatePayload } = updatePaylod;
    const findMenu = await this.prismaService.menu.findFirstOrThrow(
      this.findMenuFields(menuPublicId),
    );

    this.canMenuHasOptions(findMenu, omitedUpdatePayload.options);

    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: {
        menu: { connect: { id: findMenu.id } },
        menuName: findMenu.name,
        price: findMenu.price,
        ...omitedUpdatePayload,
      },
      omit: this.orderItemOmit,
    });
  }

  async deleteOrderItem(orderItemPublicId: string) {
    await this.prismaService.orderItem.delete({
      where: { publicId: orderItemPublicId },
    });
  }
}
