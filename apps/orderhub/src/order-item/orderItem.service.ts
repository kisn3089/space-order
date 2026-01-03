import { Injectable } from '@nestjs/common';
import { PublicOrderItem } from '@spaceorder/db';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrderItemService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrderItemList(orderPublicId: string): Promise<PublicOrderItem[]> {
    return await this.prismaService.orderItem.findMany({
      where: { order: { publicId: orderPublicId } },
      omit: { id: true, orderId: true, menuId: true },
    });
  }

  async getOrderItemById(
    orderPublicId: string,
    orderItemPublicId: string,
  ): Promise<PublicOrderItem> {
    return await this.prismaService.orderItem.findUniqueOrThrow({
      where: {
        order: { publicId: orderPublicId },
        publicId: orderItemPublicId,
      },
    });
  }
}
