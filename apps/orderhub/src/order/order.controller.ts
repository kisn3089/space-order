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
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { TableSessionGuard } from 'src/utils/guards/table-session.guard';
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
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import { responseCookie } from 'src/utils/cookies';

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class UpdateOrderDto extends createZodDto(updateOrderSchema) {}

@Controller('stores/:storeId/tables/:tableId/orders')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(TableSessionGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(
    ZodValidationGuard({
      params: mergedStoreAndTableParamsSchema,
      body: createOrderSchema,
    }),
  )
  async createOrder(
    @Session() tableSession: TableSession,
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Body() createOrderDto: CreateOrderDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PublicOrder> {
    const { createdOrder, updatedTableSession } =
      await this.orderService.createOrder(
        {
          storePublicId,
          tablePublicId,
          tableSession,
        },
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
  @UseGuards(ZodValidationGuard({ params: mergedStoreAndTableParamsSchema }))
  async getOrderList(
    @Session() tableSession: TableSession,
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
  ): Promise<PublicOrder[]> {
    return await this.orderService.getOrderList({
      storePublicId,
      tablePublicId,
      tableSession,
    });
  }

  @Get(':orderId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: orderParamsSchema }))
  async getOrderById(
    @Session() tableSession: TableSession,
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Param('orderId') orderPublicId: string,
  ): Promise<PublicOrder> {
    return await this.orderService.txableGetOrderById()({
      storePublicId,
      tablePublicId,
      orderPublicId,
      tableSession,
    });
  }

  @Patch(':orderId')
  @HttpCode(200)
  @UseGuards(
    ZodValidationGuard({
      params: orderParamsSchema,
      body: updateOrderSchema,
    }),
  )
  async updateOrder(
    @Session() tableSession: TableSession,
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Param('orderId') orderPublicId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<PublicOrder> {
    return await this.orderService.updateOrder(
      {
        storePublicId,
        tablePublicId,
        orderPublicId,
        tableSession,
      },
      updateOrderDto,
    );
  }

  @Delete(':orderId')
  @HttpCode(200)
  @UseGuards(ZodValidationGuard({ params: orderParamsSchema }))
  async cancelOrder(
    @Session() tableSession: TableSession,
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Param('orderId') orderPublicId: string,
  ): Promise<PublicOrder> {
    return await this.orderService.cancelOrder({
      storePublicId,
      tablePublicId,
      orderPublicId,
      tableSession,
    });
  }
}
