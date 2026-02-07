import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { SessionAuth } from 'src/utils/guards/table-session-auth.guard';
import type { PublicOrderWithItem, TableSession } from '@spaceorder/db';
import {
  createOrderPayloadSchema,
  sessionAndOrderIdParamsSchema,
  sessionTokenParamsSchema,
} from '@spaceorder/api/schemas';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { Session } from 'src/decorators/session.decorator';
import { PublicOrderWithItemsDto } from '../../dto/public/order.dto';
import { orderDocs } from 'src/docs/order.docs';
import { paramsDocs } from 'src/docs/params.docs';
import { CreateOrderPayloadDto } from 'src/dto/order.dto';

@ApiTags('Customer Orders')
@Controller('sessions/:sessionToken/orders')
@UseGuards(SessionAuth)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(
    ZodValidation({
      params: sessionTokenParamsSchema,
      body: createOrderPayloadSchema,
    }),
  )
  @ApiOperation({ summary: orderDocs.create.summary })
  @ApiBody({ type: CreateOrderPayloadDto })
  @ApiResponse({
    ...orderDocs.create.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(orderDocs.badRequestResponse)
  @ApiResponse(orderDocs.unauthorizedResponse)
  async create(
    @Session() tableSession: TableSession,
    @Body() createOrderPayload: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.createOrder(
      tableSession,
      createOrderPayload,
    );
  }

  @Get()
  @UseGuards(ZodValidation({ params: sessionTokenParamsSchema }))
  @ApiOperation({ summary: orderDocs.getList.summary })
  @ApiResponse({
    ...orderDocs.getList.successResponse,
    type: [PublicOrderWithItemsDto],
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  async list(
    @Session() tableSession: TableSession,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderList(tableSession);
  }

  @Get(':orderId')
  @UseGuards(ZodValidation({ params: sessionAndOrderIdParamsSchema }))
  @ApiOperation({ summary: orderDocs.getUnique.summary })
  @ApiResponse({
    ...orderDocs.getUnique.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  async unique(
    @Session() tableSession: TableSession,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.getOrderUnique({ tableSession, orderId });
  }

  @Delete(':orderId')
  @UseGuards(ZodValidation({ params: sessionAndOrderIdParamsSchema }))
  @ApiOperation({ summary: orderDocs.delete.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...orderDocs.delete.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(orderDocs.unauthorizedResponse)
  @ApiResponse(orderDocs.notFoundResponse)
  async delete(
    @Session() tableSession: TableSession,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.cancelOrder({
      tableSession,
      orderId: orderId,
    });
  }
}
