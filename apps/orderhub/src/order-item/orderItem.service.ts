import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, ResponseOrderItem } from '@spaceorder/db';
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

    if (
      createData.options &&
      !(findMenu.requiredOptions || findMenu.customOptions)
    ) {
      throw new HttpException(
        exceptionContentsIs('ORDER_ITEM_OPTIONS_INVALID'),
        HttpStatus.BAD_REQUEST,
      );
    }

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
    updateData: UpdateOrderItemDto,
  ): Promise<ResponseOrderItem> {
    return await this.prismaService.orderItem.update({
      where: { publicId: orderItemPublicId },
      data: updateData,
      omit: this.orderItemOmit,
    });
  }

  async deleteOrderItem(orderItemPublicId: string) {
    await this.prismaService.orderItem.delete({
      where: { publicId: orderItemPublicId },
    });
  }
}
