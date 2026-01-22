import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Menu, Owner, Prisma, ResponseOrderItem } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderItemDto, UpdateOrderItemDto } from './orderItem.controller';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';

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
        this.findMenuFields(createPayload.menuPublicId, client),
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

  private findMenuFields(menuPublicId: string, client: Owner) {
    return {
      where: {
        publicId: menuPublicId,
        store: { ownerId: client.id },
      },
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
  ): Promise<ResponseOrderItem> {
    if (!updatePayload.menuPublicId) {
      return await this.prismaService.orderItem.update({
        where: { publicId: orderItemPublicId },
        data: updatePayload,
        omit: this.orderItemOmit,
      });
    }

    const { menuPublicId, ...omittedUpdatePayload } = updatePayload;
    const findMenu = await this.prismaService.menu.findFirstOrThrow(
      this.findMenuFields(menuPublicId, client),
    );

    this.validateMenuOptions(findMenu, omittedUpdatePayload.options);

    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: {
        menu: { connect: { id: findMenu.id } },
        menuName: findMenu.name,
        price: findMenu.price,
        ...omittedUpdatePayload,
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
