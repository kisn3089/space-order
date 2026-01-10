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
} from '@spaceorder/auth';
import type { Owner, PublicOrderWithItem } from '@spaceorder/db';
import { CachedOrder } from 'src/decorators/cache/order.cache';
import { Client } from 'src/decorators/client.decorator';
import { CreateOrderDto, UpdateOrderDto } from 'src/order/order.controller';
import { OrderService } from 'src/order/order.service';
import { TableSessionService } from 'src/table-session/tableSession.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { OwnerOrderPermission } from 'src/utils/guards/model-auth/owner-order-permission.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';

@Controller('owner/stores/:storeId/tables/:tableId/orders')
@UseGuards(JwtAuthGuard)
export class OwnerOrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly tableSessionService: TableSessionService,
  ) {}

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
    const tableSession =
      await this.tableSessionService.findActivatedSessionOrCreate(tableId);

    const { createdOrder } = await this.orderService.createOrder(
      tableSession,
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
  async getOrderById(
    @CachedOrder() cachedOrder: PublicOrderWithItem,
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem> {
    if (cachedOrder) {
      return cachedOrder;
    }
    return await this.orderService.getOrderById({
      type: 'OWNER',
      params: {
        orderPublicId: orderId,
        storePublicId: storeId,
        tablePublicId: tableId,
        ownerId: client.id,
      },
    });
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
          orderPublicId: orderId,
          storePublicId: storeId,
          tablePublicId: tableId,
          ownerId: client.id,
        },
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
        orderPublicId: orderId,
        storePublicId: storeId,
        tablePublicId: tableId,
        ownerId: client.id,
      },
    });
  }
}
