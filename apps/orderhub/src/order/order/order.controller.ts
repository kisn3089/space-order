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
  createOrderPayloadSchema,
  storeIdParamsSchema,
  updateOrderPayloadSchema,
  tableIdParamsSchema,
  orderIdParamsSchema,
} from '@spaceorder/api/schemas';
import { ownerOrderDocs } from 'src/docs/ownerOrder.docs';
import { paramsDocs } from 'src/docs/params.docs';
import type {
  Owner,
  PublicOrderWithItem,
  SummarizedOrdersByStore,
} from '@spaceorder/db';
import { Client } from 'src/decorators/client.decorator';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { PublicOrderWithItemsDto } from 'src/dto/public/order.dto';
import { OrderService } from './order.service';
import { StoreAccessGuard } from 'src/utils/guards/store-access.guard';
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from 'src/dto/order.dto';
import { SummarizedTableDto } from 'src/dto/public/table.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrderAccessGuard } from 'src/utils/guards/order-access.guard';
import { TableAccessGuard } from 'src/utils/guards/table-access.guard';
import { ORDER_ITEMS_WITH_OMIT_PRIVATE } from 'src/common/query/order-item-query.const';

@ApiTags('Owner Orders')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ============================================================
  // Store Orders
  // ============================================================

  /** store에 속한 테이블별로 활성화된 세션의 요약된 주문 조회 */
  @Get('stores/:storeId/orders/summary')
  @UseGuards(StoreAccessGuard, ZodValidation({ params: storeIdParamsSchema }))
  @ApiOperation({ summary: '매장 주문 요약 조회' })
  @ApiResponse({
    status: 200,
    description: '테이블별 주문 요약 정보 반환',
    type: [SummarizedTableDto],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  async listOrdersSummary(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<SummarizedOrdersByStore> {
    return await this.orderService.getOrdersSummary(client, storeId);
  }

  /** store에 속한 모든 주문 조회 */
  @Get('stores/:storeId/orders')
  @UseGuards(StoreAccessGuard, ZodValidation({ params: storeIdParamsSchema }))
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async listByStore(
    @Param('storeId') storeId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderList({
      where: { store: { publicId: storeId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  /** 특정 주문 조회 */
  @Get(':orderId')
  @UseGuards(OrderAccessGuard, ZodValidation({ params: orderIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getUnique.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...ownerOrderDocs.getUnique.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async unique(
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.getOrderUnique({
      where: { publicId: orderId },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  /** 특정 주문 부분 수정 */
  @Patch(':orderId')
  @UseGuards(
    OrderAccessGuard,
    ZodValidation({
      params: orderIdParamsSchema,
      body: updateOrderPayloadSchema,
    }),
  )
  @ApiOperation({ summary: ownerOrderDocs.update.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiBody({ type: UpdateOrderPayloadDto })
  @ApiResponse({
    ...ownerOrderDocs.update.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(ownerOrderDocs.badRequestResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async partialUpdate(
    @Param('orderId') orderId: string,
    @Body() updatePayload: UpdateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.partialUpdateOrder(orderId, updatePayload);
  }

  /** 특정 주문 삭제(소프트) */
  @Delete(':orderId')
  @UseGuards(OrderAccessGuard, ZodValidation({ params: orderIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.cancel.summary })
  @ApiParam(paramsDocs.orderId)
  @ApiResponse(ownerOrderDocs.cancel.successResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async cancel(
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.cancelOrder({ orderId });
  }

  // ============================================================
  // Table Orders
  // ============================================================

  /** 테이블의 활성 세션에 속한 주문 목록 조회 */
  @Get('tables/:tableId/active-session/orders')
  @UseGuards(TableAccessGuard, ZodValidation({ params: tableIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getActiveSessionOrders.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...ownerOrderDocs.getActiveSessionOrders.successResponse,
    type: [PublicOrderWithItemsDto],
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async listOrdersByAliveSession(
    @Param('tableId') tableId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrdersByAliveSession(tableId);
  }

  /** table에 속한 주문 생성 */
  @Post('tables/:tableId/orders')
  @UseGuards(
    TableAccessGuard,
    ZodValidation({
      params: tableIdParamsSchema,
      body: createOrderPayloadSchema,
    }),
  )
  @ApiOperation({ summary: ownerOrderDocs.create.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiBody({ type: CreateOrderPayloadDto })
  @ApiResponse({
    ...ownerOrderDocs.create.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(ownerOrderDocs.badRequestResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async create(
    @Param('tableId') tableId: string,
    @Body() createPayload: CreateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.createOrder(
      { publicId: tableId },
      createPayload,
    );
  }

  /** table에 속한 주문 조회 */
  @Get('tables/:tableId/orders')
  @UseGuards(TableAccessGuard, ZodValidation({ params: tableIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getList.summary })
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...ownerOrderDocs.getList.successResponse,
    type: [PublicOrderWithItemsDto],
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async listByTable(
    @Param('tableId') tableId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderList({
      where: { table: { publicId: tableId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
