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
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import {
  COOKIE_TABLE,
  type SessionWithSanitizeId,
  type PublicOrderWithItem,
} from '@spaceorder/db';
import { createZodDto } from 'nestjs-zod';
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderSchema,
} from '@spaceorder/auth';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import { responseCookie } from 'src/utils/cookies';

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class UpdateOrderDto extends createZodDto(updateOrderSchema) {}

@Controller('customer/orders')
@UseGuards(SessionAuth)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOrderSchema }))
  async createOrder(
    @Session() tableSession: SessionWithSanitizeId,
    @Body() createOrderDto: CreateOrderDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicOrderWithItem> {
    const { createdOrder, updatedTableSession } =
      await this.orderService.createOrder(tableSession, createOrderDto);

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      updatedTableSession.sessionToken,
      { expires: updatedTableSession.expiresAt },
    );

    return createdOrder;
  }

  @Get()
  async getOrderList(
    @Session() tableSession: SessionWithSanitizeId,
  ): Promise<PublicOrderWithItem[]> {
    return await this.orderService.getOrderList({
      type: 'CUSTOMER',
      params: { tableSession },
    });
  }

  @Get(':orderId')
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  async getOrderById(
    @Session() tableSession: SessionWithSanitizeId,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem> {
    return await this.orderService.getOrderById({
      type: 'CUSTOMER',
      params: { tableSession },
      orderPublicId: orderId,
    });
  }

  @Patch(':orderId')
  @UseGuards(
    ZodValidation({ params: orderIdParamsSchema, body: updateOrderSchema }),
  )
  async updateOrder(
    @Session() tableSession: SessionWithSanitizeId,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<PublicOrderWithItem> {
    return await this.orderService.updateOrder(
      { type: 'CUSTOMER', params: { tableSession }, orderPublicId: orderId },
      updateOrderDto,
    );
  }

  @Delete(':orderId')
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  async cancelOrder(
    @Session() tableSession: SessionWithSanitizeId,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem> {
    return await this.orderService.cancelOrder({
      type: 'CUSTOMER',
      params: { tableSession },
      orderPublicId: orderId,
    });
  }
}
