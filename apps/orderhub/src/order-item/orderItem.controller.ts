import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  orderItemParamsSchema,
  orderIdParamsSchema,
} from '@spaceorder/api/schemas';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { PublicOrderItem } from '@spaceorder/db';

@Controller('orders/:orderId/order-items')
@UseGuards(JwtAuthGuard)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  /**
   * order-item은 order에 종속되므로 독립적으로 생성하고 수정하는 API는 존재하지 않음
   * PermissionGuard를 구현하지 않았다. 필요하면 이후에 구현할 것
   */

  @Get()
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  async getOrderItemList(
    @Param('orderId') orderPublicId: string,
  ): Promise<PublicOrderItem[]> {
    return await this.orderItemService.getOrderItemList(orderPublicId);
  }

  @Get(':orderItemId')
  @UseGuards(ZodValidation({ params: orderItemParamsSchema }))
  async getOrderItemById(
    @Param('orderId') orderPublicId: string,
    @Param('orderItemId') orderItemPublicId: string,
  ): Promise<PublicOrderItem> {
    return await this.orderItemService.getOrderItemById(
      orderPublicId,
      orderItemPublicId,
    );
  }
}
