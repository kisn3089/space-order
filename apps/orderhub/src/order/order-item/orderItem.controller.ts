import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrderItemService } from './orderItem.service';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  orderIdParamsSchema,
  orderItemIdParamsSchema,
} from '@spaceorder/api/schemas';
import type { PublicOrderItem } from '@spaceorder/db';
import {
  createOrderItemPayloadSchema,
  partialUpdateOrderItemPayloadSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import {
  DocsOrderItemCreate,
  DocsOrderItemDelete,
  DocsOrderItemGetList,
  DocsOrderItemGetUnique,
  DocsOrderItemUpdate,
} from 'src/docs/orderItem.docs';
import {
  CreateOrderItemPayloadDto,
  UpdateOrderItemPayloadDto,
} from 'src/dto/order-item.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderAccessGuard } from 'src/utils/guards/order-access.guard';
import { OrderItemAccessGuard } from 'src/utils/guards/order-item-access.guard';

@ApiTags('Order Item')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post(':orderId/order-items')
  @UseGuards(
    OrderAccessGuard,
    ZodValidation({
      params: orderIdParamsSchema,
      body: createOrderItemPayloadSchema,
    }),
  )
  @DocsOrderItemCreate()
  async create(
    @Param('orderId') orderId: string,
    @Body() createOrderItemPayload: CreateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.createOrderItem(
      orderId,
      createOrderItemPayload,
    );
  }

  @Get(':orderId/order-items')
  @UseGuards(OrderAccessGuard, ZodValidation({ params: orderIdParamsSchema }))
  @DocsOrderItemGetList()
  async list(
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderItem<'Wide'>[]> {
    return await this.orderItemService.getOrderItemList({
      where: { order: { publicId: orderId } },
      omit: this.orderItemService.omitPrivate,
    });
  }

  @Get('order-items/:orderItemId')
  @UseGuards(
    OrderItemAccessGuard,
    ZodValidation({ params: orderItemIdParamsSchema }),
  )
  @DocsOrderItemGetUnique()
  async getUnique(
    @Param('orderItemId') orderItemId: string,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.getOrderItemUnique({
      where: { publicId: orderItemId },
      omit: this.orderItemService.omitPrivate,
    });
  }

  @Patch('order-items/:orderItemId')
  @UseGuards(
    OrderItemAccessGuard,
    ZodValidation({
      params: orderItemIdParamsSchema,
      body: partialUpdateOrderItemPayloadSchema,
    }),
  )
  @DocsOrderItemUpdate()
  async partialUpdate(
    @Param('orderItemId') orderItemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.partialUpdateOrderItem(
      orderItemId,
      updateOrderItemDto,
    );
  }

  @Delete('order-items/:orderItemId')
  @UseGuards(
    OrderItemAccessGuard,
    ZodValidation({ params: orderItemIdParamsSchema }),
  )
  @HttpCode(204)
  @DocsOrderItemDelete()
  async delete(@Param('orderItemId') orderItemId: string): Promise<void> {
    return await this.orderItemService.deleteOrderItem(orderItemId);
  }
}
