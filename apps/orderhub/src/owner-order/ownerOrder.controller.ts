import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { createOrderSchema } from '@spaceorder/auth';
import { PublicOrderWithItem } from '@spaceorder/db';
import { CreateOrderDto } from 'src/order/order.controller';
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
  @UseGuards(ZodValidation({ body: createOrderSchema }), OwnerOrderPermission)
  async createOrder(
    @Param('storeId') storeId: string,
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
}
