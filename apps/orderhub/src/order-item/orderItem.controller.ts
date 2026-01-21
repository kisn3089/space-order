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
import { ResponseOrderItem } from '@spaceorder/db';
import { createZodDto } from 'nestjs-zod';
import {
  createOrderItemSchema,
  partialUpdateOrderItemSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import { OrderItemPermission } from 'src/utils/guards/model-permissions/order-item-permission.guard';
import { BuildIncludeService } from 'src/utils/query-params/build-include';
import { ORDER_ITEM_FILTER_RECORD } from './order-item-query.const';

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
    private readonly buildInclude: BuildIncludeService,
  ) {}

  @Post()
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  async create(
    @Param('orderId') orderPublicId: string,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ): Promise<ResponseOrderItem> {
    return await this.orderItemService.createOrderItem(
      orderPublicId,
      createOrderItemDto,
    );
  }

  @Get()
  @UseGuards(ZodValidation({ params: orderIdParamsSchema }))
  async getList(
    @Param('orderId') orderPublicId: string,
  ): Promise<ResponseOrderItem[]> {
    return await this.orderItemService.getOrderItemList({
      where: { order: { publicId: orderPublicId } },
      omit: this.orderItemService.orderItemOmit,
    });
  }
  @Get(':orderItemId')
  @UseGuards(ZodValidation({ params: orderItemParamsSchema }))
  async getUnique(
    @Param('orderId') orderPublicId: string,
    @Param('orderItemId') orderItemPublicId: string,
    @Query() query?: OrderItemQueryParams,
  ): Promise<ResponseOrderItem> {
    const { filter } = this.buildInclude.build({
      query,
      filterRecord: ORDER_ITEM_FILTER_RECORD,
    });

    return await this.orderItemService.getOrderItemUnique({
      where: {
        order: { publicId: orderPublicId, ...filter },
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
    OrderItemPermission,
  )
  async partialUpdate(
    @Param('orderItemId') orderItemPublicId: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<ResponseOrderItem> {
    return await this.orderItemService.partialUpdateOrderItem(
      orderItemPublicId,
      updateOrderItemDto,
    );
  }

  @Delete(':orderItemId')
  @UseGuards(
    ZodValidation({ params: orderItemParamsSchema }),
    OrderItemPermission,
  )
  async delete(@Param('orderItemId') orderItemPublicId: string): Promise<void> {
    return await this.orderItemService.deleteOrderItem(orderItemPublicId);
  }
}
