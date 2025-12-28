import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  // Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { TableSessionGuard } from 'src/utils/guards/table-session.guard';
import type { TableSession } from '@spaceorder/db';

interface RequestWithTableSession {
  tableSession: TableSession;
}

@Controller('stores/:storeId/tables/:tableId/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** 쿠키의 table session 토큰값을 검증하는 Guard 적용 */
  @Post()
  @UseGuards(TableSessionGuard)
  async create(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
    @Req() request: RequestWithTableSession,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const sessionToken = request.tableSession.sessionToken; // 토큰 값 추출
    return await this.orderService.create(
      storePublicId,
      tablePublicId,
      sessionToken,
      createOrderDto,
    );
  }

  @Get()
  async retrieveOrderList(
    @Param('storeId') storePublicId: string,
    @Param('tableId') tablePublicId: string,
  ) {
    return await this.orderService.retrieveOrderList(
      storePublicId,
      tablePublicId,
    );
  }

  // @Patch('order/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateOrderDto: UpdateOrderDto,
  // ) {
  //   return await this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete('order/:id')
  // async remove(@Param('id') id: string) {
  //   return await this.orderService.remove(+id);
  // }
}
