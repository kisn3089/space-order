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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrderItemService } from './orderItem.service';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  storeIdAndOrderIdParamsSchema,
  storeIdAndOrderItemIdParamsSchema,
} from '@spaceorder/api/schemas';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import type { PublicOrderItem } from '@spaceorder/db';
import {
  createOrderItemPayloadSchema,
  partialUpdateOrderItemPayloadSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import { paramsDocs } from 'src/docs/params.docs';
import { orderItemDocs } from 'src/docs/orderItem.docs';
import { PublicOrderItemDto } from 'src/dto/public/order-item';
import {
  CreateOrderItemPayloadDto,
  UpdateOrderItemPayloadDto,
} from 'src/dto/order-item.dto';
import { OwnerStoreGuard } from 'src/utils/guards/model-permissions/owner-store.guard';

@ApiTags('Order Items')
@ApiBearerAuth()
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post('orders/:orderId/order-items')
  @UseGuards(
    ZodValidation({
      params: storeIdAndOrderIdParamsSchema,
      body: createOrderItemPayloadSchema,
    }),
  )
  @ApiOperation({ summary: orderItemDocs.create.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderId)
  @ApiBody({ type: CreateOrderItemPayloadDto })
  @ApiResponse({
    ...orderItemDocs.create.successResponse,
    type: PublicOrderItemDto,
  })
  @ApiResponse(orderItemDocs.badRequestResponse)
  @ApiResponse(orderItemDocs.unauthorizedResponse)
  async create(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
    @Body() createOrderItemPayload: CreateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.createOrderItem(
      { orderId, storeId },
      createOrderItemPayload,
    );
  }

  @Get('orders/:orderId/order-items')
  @UseGuards(ZodValidation({ params: storeIdAndOrderIdParamsSchema }))
  @ApiOperation({ summary: orderItemDocs.getList.summary })
  @ApiQuery(paramsDocs.query.filter.orderItem)
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...orderItemDocs.getList.successResponse,
    type: [PublicOrderItemDto],
  })
  @ApiResponse(orderItemDocs.unauthorizedResponse)
  async list(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderItem<'Wide'>[]> {
    return await this.orderItemService.getOrderItemList({
      where: {
        order: { publicId: orderId, store: { publicId: storeId } },
      },
      omit: this.orderItemService.omitPrivate,
    });
  }

  @Get('order-items/:orderItemId')
  @UseGuards(ZodValidation({ params: storeIdAndOrderItemIdParamsSchema }))
  @ApiOperation({ summary: orderItemDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderItemId)
  @ApiResponse({
    ...orderItemDocs.getUnique.successResponse,
    type: PublicOrderItemDto,
  })
  @ApiResponse(orderItemDocs.unauthorizedResponse)
  @ApiResponse(orderItemDocs.notFoundResponse)
  async getUnique(
    @Param('storeId') storeId: string,
    @Param('orderItemId') orderItemId: string,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.getOrderItemUnique({
      where: { publicId: orderItemId, order: { store: { publicId: storeId } } },
      omit: this.orderItemService.omitPrivate,
    });
  }

  @Patch('order-items/:orderItemId')
  @UseGuards(
    ZodValidation({
      params: storeIdAndOrderItemIdParamsSchema,
      body: partialUpdateOrderItemPayloadSchema,
    }),
  )
  @ApiOperation({ summary: orderItemDocs.update.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderItemId)
  @ApiBody({ type: UpdateOrderItemPayloadDto })
  @ApiResponse({
    ...orderItemDocs.update.successResponse,
    type: UpdateOrderItemPayloadDto,
  })
  @ApiResponse(orderItemDocs.badRequestResponse)
  @ApiResponse(orderItemDocs.unauthorizedResponse)
  @ApiResponse(orderItemDocs.notFoundResponse)
  async partialUpdate(
    @Param('storeId') storeId: string,
    @Param('orderItemId') orderItemId: string,
    @Body() updateOrderItemDto: UpdateOrderItemPayloadDto,
  ): Promise<PublicOrderItem<'Wide'>> {
    return await this.orderItemService.partialUpdateOrderItem(
      { orderItemId, storeId },
      updateOrderItemDto,
    );
  }

  @Delete('order-items/:orderItemId')
  @UseGuards(ZodValidation({ params: storeIdAndOrderItemIdParamsSchema }))
  @ApiOperation({ summary: orderItemDocs.delete.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderItemId)
  @ApiResponse(orderItemDocs.delete.successResponse)
  @ApiResponse(orderItemDocs.unauthorizedResponse)
  @ApiResponse(orderItemDocs.notFoundResponse)
  async delete(
    @Param('storeId') storeId: string,
    @Param('orderItemId') orderItemId: string,
  ): Promise<void> {
    return await this.orderItemService.deleteOrderItem({
      orderItemId,
      storeId,
    });
  }
}
