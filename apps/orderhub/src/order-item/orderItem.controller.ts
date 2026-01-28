import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderItemService } from './orderItem.service';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import {
  orderItemParamsSchema,
  orderIdParamsSchema,
} from '@spaceorder/api/schemas';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import type { OrderItem, Owner, ResponseOrderItem } from '@spaceorder/db';
import { createZodDto } from 'nestjs-zod';
import {
  createOrderItemSchema,
  orderItemQuerySchema,
  partialUpdateOrderItemSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import {
  OrderItemPermission,
  OrderItemWritePermission,
} from 'src/utils/guards/model-permissions/order-item-permission.guard';
import { QueryParamsBuilderService } from 'src/utils/query-params/query-builder';
import { ORDER_ITEM_FILTER_RECORD } from './order-item-query.const';
import { Client } from 'src/decorators/client.decorator';
import { CachedOrderItemByGuard } from 'src/decorators/cache/orderItem.decorator';

export class CreateOrderItemDto extends createZodDto(createOrderItemSchema) {}
export class UpdateOrderItemDto extends createZodDto(
  partialUpdateOrderItemSchema,
) {}

type OrderItemQueryParams = {
  filter?: keyof typeof ORDER_ITEM_FILTER_RECORD;
};

@Controller('orders/:orderId/order-items')
@UseGuards(JwtAuthGuard)
export class OrderItemController {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly queryParamsBuilder: QueryParamsBuilderService,
  ) {}

  @Post()
  @UseGuards(
    ZodValidation({ params: orderIdParamsSchema, body: createOrderItemSchema }),
    OrderItemWritePermission,
  )
  async create(
    @Client() client: Owner,
    @Param('orderId') orderPublicId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderItem<'Wide'>> {
    return await this.orderItemService.createOrderItem(
      orderPublicId,
      createOrderItemDto,
      client,
    );
  }

  @Get()
  @UseGuards(
    ZodValidation({ params: orderIdParamsSchema, query: orderItemQuerySchema }),
    OrderItemPermission,
  )
  async getList(
    @Param('orderId') orderPublicId: string,
    @Query() query?: OrderItemQueryParams,
  ): Promise<ResponseOrderItem<'Wide'>[]> {
    const { filter } = this.queryParamsBuilder.build({
      query,
      filterRecord: ORDER_ITEM_FILTER_RECORD,
    });

    return await this.orderItemService.getOrderItemList({
      where: { order: { publicId: orderPublicId, ...filter } },
      omit: this.orderItemService.orderItemOmit,
    });
  }

  @Get(':orderItemId')
  @UseGuards(
    ZodValidation({ params: orderItemParamsSchema }),
    OrderItemPermission,
  )
  async getUnique(
    @Param('orderId') orderPublicId: string,
    @Param('orderItemId') orderItemPublicId: string,
  ): Promise<ResponseOrderItem<'Wide'>> {
    return await this.orderItemService.getOrderItemUnique({
      where: {
        order: { publicId: orderPublicId },
        publicId: orderItemPublicId,
      },
      omit: this.orderItemService.orderItemOmit,
    });
  }

  @Patch(':orderItemId')
  @UseGuards(
    ZodValidation({
      params: orderItemParamsSchema,
      body: partialUpdateOrderItemSchema,
    }),
    OrderItemWritePermission,
  )
  async partialUpdate(
    @Client() client: Owner,
    @CachedOrderItemByGuard() cachedOrderItem: OrderItem,
    @Param('orderItemId') orderItemPublicId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ResponseOrderItem<'Wide'>> {
    return await this.orderItemService.partialUpdateOrderItem(
      orderItemPublicId,
      updateOrderItemDto,
      client,
      cachedOrderItem,
    );
  }

  @Delete(':orderItemId')
  @UseGuards(
    ZodValidation({ params: orderItemParamsSchema }),
    OrderItemWritePermission,
  )
  async delete(
    @CachedOrderItemByGuard() cachedOrderItem: OrderItem,
    @Param('orderItemId') orderItemPublicId: string,
  ): Promise<void> {
    return await this.orderItemService.deleteOrderItem(
      orderItemPublicId,
      cachedOrderItem,
    );
  }
}
