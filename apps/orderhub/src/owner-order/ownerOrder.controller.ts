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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  createOrderSchema,
  mergedStoreAndTableParamsSchema,
  orderParamsSchema,
  updateOrderSchema,
} from '@spaceorder/api/schemas';
import { ownerOrderDocs } from 'src/docs/ownerOrder.docs';
import { paramsDocs } from 'src/docs/params.docs';
import type { Owner, ResponseOrderWithItem } from '@spaceorder/db';
import { CachedOrderByGuard } from 'src/decorators/cache/order.decorator';
import { Client } from 'src/decorators/client.decorator';
import { CreateOrderDto, UpdateOrderDto } from 'src/order/order.controller';
import { OrderService } from 'src/order/order.service';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import {
  OwnerOrderPermission,
  OwnerOrderWritePermission,
} from 'src/utils/guards/model-permissions/owner-order-permission.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { OrderWithItemsResponseDto } from 'src/order/dto/orderResponse.dto';

@ApiTags('Owner Orders')
@ApiBearerAuth()
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
  @ApiOperation({ summary: ownerOrderDocs.create.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiParam(paramsDocs.storeId)
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    ...ownerOrderDocs.create.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(ownerOrderDocs.badRequestResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async create(
    @Param('tableId') tableId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
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
  @ApiOperation({ summary: ownerOrderDocs.getList.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({
    ...ownerOrderDocs.getList.successResponse,
    type: [OrderWithItemsResponseDto],
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async getList(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<ResponseOrderWithItem<'Wide'>[]> {
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
  @ApiOperation({ summary: ownerOrderDocs.getUnique.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiParam(paramsDocs.tableId)
  @ApiParam(paramsDocs.storeId)
  @ApiResponse({
    ...ownerOrderDocs.getUnique.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  getUnique(
    @CachedOrderByGuard() cachedOrder: ResponseOrderWithItem<'Wide'>,
  ): ResponseOrderWithItem<'Wide'> {
    return cachedOrder;
  }

  @Patch(':orderId')
  @UseGuards(
    ZodValidation({ params: orderParamsSchema, body: updateOrderSchema }),
    OwnerOrderWritePermission,
  )
  @ApiOperation({ summary: ownerOrderDocs.update.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiParam(paramsDocs.tableId)
  @ApiParam(paramsDocs.storeId)
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    ...ownerOrderDocs.update.successResponse,
    type: OrderWithItemsResponseDto,
  })
  @ApiResponse(ownerOrderDocs.badRequestResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async partialUpdate(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
    return await this.orderService.partialUpdateOrder(
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
  @UseGuards(
    ZodValidation({ params: orderParamsSchema }),
    OwnerOrderWritePermission,
  )
  @ApiOperation({ summary: ownerOrderDocs.cancel.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiParam(paramsDocs.tableId)
  @ApiParam(paramsDocs.storeId)
  @ApiResponse(ownerOrderDocs.cancel.successResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async cancel(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
  ): Promise<ResponseOrderWithItem<'Wide'>> {
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
