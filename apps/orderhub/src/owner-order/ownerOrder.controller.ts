import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  createOrderSchema,
  mergedStoreAndTableParamsSchema,
  orderParamsSchema,
  updateOrderSchema,
} from '@spaceorder/api/schemas';
import type { Owner, PublicOrderWithItem } from '@spaceorder/db';
import { CachedOrderByGuard } from 'src/decorators/cache/order.decorator';
import { Client } from 'src/decorators/client.decorator';
import { CreateOrderDto, UpdateOrderDto } from 'src/order/order.controller';
import { OrderService } from 'src/order/order.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { OwnerOrderPermission } from 'src/utils/guards/model-permissions/owner-order-permission.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';

@Controller('owner/stores/:storeId/tables/:tableId/orders')
@UseGuards(JwtAuthGuard)
export class OwnerOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: mergedStoreAndTableParamsSchema,
      body: createOrderSchema,
    }),
    OwnerOrderPermission,
  )
  async createOrder(
    @Param('tableId') tableId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<PublicOrderWithItem> {
    const { createdOrder } = await this.orderService.createOrder(
      { tableId },
      createOrderDto,
    );

    return createdOrder;
  }

  @Get()
  @UseGuards(
    ZodValidation({ params: mergedStoreAndTableParamsSchema }),
    OwnerOrderPermission,
  )
  async getOrderList(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<PublicOrderWithItem[]> {
    return await this.orderService.getOrderList({
      type: 'OWNER',
      params: {
        storePublicId: storeId,
        tablePublicId: tableId,
        ownerId: client.id,
      },
    });
  }

  @Get(':orderId')
  @UseGuards(ZodValidation({ params: orderParamsSchema }), OwnerOrderPermission)
  getOrderById(
    @CachedOrderByGuard() cachedOrder: PublicOrderWithItem,
  ): PublicOrderWithItem {
    return cachedOrder;
  }

  @Patch(':orderId')
  @UseGuards(
    ZodValidation({ params: orderParamsSchema, body: updateOrderSchema }),
    OwnerOrderPermission,
  )
  async updateOrder(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<PublicOrderWithItem> {
    return await this.orderService.updateOrder(
      {
        type: 'OWNER',
        params: {
          storePublicId: storeId,
          tablePublicId: tableId,
          ownerId: client.id,
        },
        orderPublicId: orderId,
      },
      updateOrderDto,
    );
  }

  @Delete(':orderId')
  @UseGuards(ZodValidation({ params: orderParamsSchema }), OwnerOrderPermission)
  async cancelOrder(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem> {
    return await this.orderService.cancelOrder({
      type: 'OWNER',
      params: {
        storePublicId: storeId,
        tablePublicId: tableId,
        ownerId: client.id,
      },
      orderPublicId: orderId,
    });
  }
}
