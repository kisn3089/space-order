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
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import {
  type SessionWithTable,
  type ResponseOrderWithItem,
} from '@spaceorder/db';
import { createZodDto } from 'nestjs-zod';
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { Session } from 'src/decorators/tableSession.decorator';
import { responseCookie } from 'src/utils/cookies';
import { COOKIE_TABLE } from '@spaceorder/db/constants';
import { OrderWithItemsResponseDto } from './dto/orderResponse.dto';
import { orderDocs } from 'src/docs/order.docs';
import { paramsDocs } from 'src/docs/params.docs';

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class UpdateOrderDto extends createZodDto(updateOrderSchema) {}

@ApiTags('Customer Orders')
@ApiCookieAuth()
@Controller('customer/orders')
@UseGuards(SessionAuth)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(ZodValidation({ body: createOrderSchema }))
  @ApiOperation({ summary: orderDocs.create.summary })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    ...orderDocs.create.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(orderDocs.badRequestResponse)
  @ApiResponse(orderDocs.unauthorizedResponse)
  async create(
    @Session() tableSession: SessionWithTable,
    @Body() createOrderDto: CreateOrderDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
    const { createdOrder, updatedTableSession } =
      await this.orderService.createOrder({ tableSession }, createOrderDto);

    responseCookie.set(
      response,
      COOKIE_TABLE.TABLE_SESSION,
      updatedTableSession.sessionToken,
      { expires: updatedTableSession.expiresAt },
    );

    return createdOrder;
  }

  @Get()
  @ApiOperation({ summary: orderDocs.getList.summary })
  @ApiResponse({
    ...orderDocs.getList.successResponse,
    type: [OrderWithItemsResponseDto],
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  async getList(
    @Session() tableSession: SessionWithTable,
  ): Promise<ResponseOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderList({
      type: 'CUSTOMER',
      params: { tableSession },
    });
  }

  @Get(':orderId')
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  @ApiOperation({ summary: orderDocs.getUnique.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...orderDocs.getUnique.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  @ApiResponse(orderDocs.notFoundResponse)
  async getUnique(
    @Session() tableSession: SessionWithTable,
    @Param('orderId') orderId: string,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
    return await this.orderService.getOrderUnique({
      type: 'CUSTOMER',
      params: { tableSession },
      orderPublicId: orderId,
    });
  }

  @Patch(':orderId')
  @UseGuards(
    ZodValidation({ params: orderIdParamsSchema, body: updateOrderSchema }),
  )
  @ApiOperation({ summary: orderDocs.update.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    ...orderDocs.update.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(orderDocs.badRequestResponse)
  @ApiResponse(orderDocs.unauthorizedResponse)
  @ApiResponse(orderDocs.notFoundResponse)
  async partialUpdate(
    @Session() tableSession: SessionWithTable,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
    return await this.orderService.partialUpdateOrder(
      { type: 'CUSTOMER', params: { tableSession }, orderPublicId: orderId },
      updateOrderDto,
    );
  }

  @Delete(':orderId')
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  @ApiOperation({ summary: orderDocs.delete.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...orderDocs.delete.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  @ApiResponse(orderDocs.notFoundResponse)
  async cancel(
    @Session() tableSession: SessionWithTable,
    @Param('orderId') orderId: string,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
    return await this.orderService.cancelOrder({
      type: 'CUSTOMER',
      params: { tableSession },
      orderPublicId: orderId,
    });
  }
}
