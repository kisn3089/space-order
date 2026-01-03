import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { orderItemParamsSchema, orderIdParamsSchema } from '@spaceorder/auth';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { PublicOrderItem } from '@spaceorder/db';

@Controller('orders/:orderId/order-items')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  /**
   * order-item은 order에 종속되므로 독립적으로 생성하고 수정하는 API는 존재하지 않음
   */

  @Get()
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: orderIdParamsSchema }))
  async getOrderItemList(
    @Param('orderId') orderPublicId: string,
  ): Promise<PublicOrderItem[]> {
    return await this.orderItemService.getOrderItemList(orderPublicId);
  }

  @Get(':orderItemId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: orderItemParamsSchema }))
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
