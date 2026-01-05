import type { Response } from 'express';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import {
  COOKIE_TABLE,
  type PublicOrder,
  type TableSession,
} from '@spaceorder/db';
import { createZodDto } from 'nestjs-zod';
import {
  createOrderSchema,
  mergedStoreAndTableParamsSchema,
  orderParamsSchema,
  updateOrderSchema,
} from '@spaceorder/auth';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import { responseCookie } from 'src/utils/cookies';
import { OrderPermission } from 'src/utils/guards/model-auth/order-permission.guard';

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class UpdateOrderDto extends createZodDto(updateOrderSchema) {}

@Controller('stores/:storeId/tables/:tableId/orders')
@UseGuards(SessionAuth)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(
    ZodValidation({
      params: mergedStoreAndTableParamsSchema,
      body: createOrderSchema,
    }),
    OrderPermission,
  )
  async createOrder(
    @Session() tableSession: TableSession,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Body() createOrderDto: CreateOrderDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicOrder> {
    const { createdOrder, updatedTableSession } =
      await this.orderService.createOrder(
        { storeId, tableId, tableSession },
        createOrderDto,
      );

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      updatedTableSession.sessionToken,
      { expires: updatedTableSession.expiresAt },
    );

    return createdOrder;
  }

  @Get()
  @HttpCode(200)
  @UseGuards(
    ZodValidation({ params: mergedStoreAndTableParamsSchema }),
    OrderPermission,
  )
  async getOrderList(
    @Session() tableSession: TableSession,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<PublicOrder[]> {
    return await this.orderService.getOrderList({
      storeId,
      tableId,
      tableSession,
    });
  }

  @Get(':orderId')
  @HttpCode(200)
  @UseGuards(ZodValidation({ params: orderParamsSchema }), OrderPermission)
  async getOrderById(
    @Session() tableSession: TableSession,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrder> {
    return await this.orderService.getOrderById({
      storeId,
      tableId,
      orderId,
      tableSession,
    });
  }

  @Patch(':orderId')
  @HttpCode(200)
  @UseGuards(
    ZodValidation({
      params: orderParamsSchema,
      body: updateOrderSchema,
    }),
    OrderPermission,
  )
  async updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<PublicOrder> {
    return await this.orderService.updateOrder(orderId, updateOrderDto);
  }

  @Delete(':orderId')
  @HttpCode(200)
  @UseGuards(ZodValidation({ params: orderParamsSchema }), OrderPermission)
  async cancelOrder(@Param('orderId') orderId: string): Promise<PublicOrder> {
    return await this.orderService.cancelOrder(orderId);
  }
}
