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
  storeIdAndTableIdParamsSchema,
  storeIdAndOrderIdParamsSchema,
  storeIdParamsSchema,
  updateOrderPayloadSchema,
  storeIdAndOrderIdAndTableIdParamsSchema,
} from '@spaceorder/api/schemas';
import { ownerOrderDocs } from 'src/docs/ownerOrder.docs';
import { paramsDocs } from 'src/docs/params.docs';
import type {
  Owner,
  PublicOrderWithItem,
  SummarizedOrdersByStore,
} from '@spaceorder/db';
import { Client } from 'src/decorators/client.decorator';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { PublicOrderWithItemsDto } from 'src/dto/public/order.dto';
import { OwnerOrderService } from './owner-order.service';
import { OwnerStoreGuard } from 'src/utils/guards/model-permissions/owner-store.guard';
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from 'src/dto/order.dto';
import { SummarizedTableDto } from 'src/dto/public/table.dto';

// /owner/v1 /stores/:storeId/orders/:orderId/order-items/:orderItemId
@ApiTags('Owner Orders')
@ApiBearerAuth()
@Controller('stores/:storeId')
@UseGuards(JwtAuthGuard, OwnerStoreGuard)
export class OwnerOrderController {
  constructor(private readonly orderService: OwnerOrderService) {}

  // ============================================================
  // Store Orders
  // ============================================================

  /** store에 속한 테이블별로 활성화된 세션의 요약된 주문 조회 */
  @Get('orders/board')
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }))
  @ApiOperation({ summary: '매장 주문 요약 조회' })
  @ApiResponse({
    status: 200,
    description: '테이블별 주문 요약 정보 반환',
    type: [SummarizedTableDto],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  async listOrdersBoard(
    @Client() client: Owner,
    @Param('storeId') storeId: string,
  ): Promise<SummarizedOrdersByStore> {
    return await this.orderService.getOrdersBoard(client, storeId);
  }

  /** store에 속한 모든 주문 조회 */
  @Get('orders')
  @UseGuards(ZodValidation({ params: storeIdParamsSchema }))
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async listByStore(
    @Param('storeId') storeId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderListByStore(storeId);
  }

  /** 특정 주문 조회 */
  @Get('orders/:orderId')
  @UseGuards(ZodValidation({ params: storeIdAndOrderIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getUnique.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderId)
  @ApiResponse({
    ...ownerOrderDocs.getUnique.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async unique(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.getOrderUnique({ storeId, orderId });
  }

  /** 특정 주문 부분 수정 */
  @Patch('orders/:orderId')
  @UseGuards(
    ZodValidation({
      params: storeIdAndOrderIdParamsSchema,
      body: updateOrderPayloadSchema,
    }),
  )
  @ApiOperation({ summary: ownerOrderDocs.update.summary })
  @ApiParam(paramsDocs.storeId)
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
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
    @Body() updatePayload: UpdateOrderPayloadDto,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.partialUpdateOrder(
      { storeId, orderId },
      updatePayload,
    );
  }

  /** 특정 주문 삭제(소프트) */
  @Delete('orders/:orderId')
  @UseGuards(ZodValidation({ params: storeIdAndOrderIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.cancel.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.orderId)
  @ApiResponse(ownerOrderDocs.cancel.successResponse)
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  @ApiResponse(ownerOrderDocs.notFoundResponse)
  async cancel(
    @Param('storeId') storeId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.cancelOrder({ storeId, orderId });
  }

  // ============================================================
  // Table Orders - 정적 경로(sessions/active)가 동적 경로보다 먼저 정의
  // ============================================================

  /** 테이블의 활성 세션에 속한 주문 목록 조회 */
  @Get('tables/:tableId/sessions/alive/orders')
  @UseGuards(ZodValidation({ params: storeIdAndTableIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getActiveSessionOrders.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...ownerOrderDocs.getActiveSessionOrders.successResponse,
    type: [PublicOrderWithItemsDto],
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async listOrdersByAliveSession(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrdersByAliveSession({
      storeId,
      tableId,
    });
  }

  /** table에 속한 주문 생성 */
  @Post('tables/:tableId/orders')
  @UseGuards(
    ZodValidation({
      params: storeIdAndTableIdParamsSchema,
      body: createOrderPayloadSchema,
    }),
  )
  @ApiOperation({ summary: ownerOrderDocs.create.summary })
  @ApiParam(paramsDocs.storeId)
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
    return await this.orderService.createOrder({ tableId }, createPayload);
  }

  /** table에 속한 주문 조회 */
  @Get('tables/:tableId/orders')
  @UseGuards(ZodValidation({ params: storeIdAndTableIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...ownerOrderDocs.getList.successResponse,
    type: [PublicOrderWithItemsDto],
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async listByTable(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
  ): Promise<PublicOrderWithItem<'Wide'>[]> {
    return await this.orderService.getOrderListByTable({ storeId, tableId });
  }

  @Get('tables/:tableId/orders/:orderId')
  @UseGuards(ZodValidation({ params: storeIdAndOrderIdAndTableIdParamsSchema }))
  @ApiOperation({ summary: ownerOrderDocs.getList.summary })
  @ApiParam(paramsDocs.storeId)
  @ApiParam(paramsDocs.tableId)
  @ApiResponse({
    ...ownerOrderDocs.getList.successResponse,
    type: PublicOrderWithItemsDto,
  })
  @ApiResponse(ownerOrderDocs.unauthorizedResponse)
  async uniqueByTable(
    @Param('storeId') storeId: string,
    @Param('tableId') tableId: string,
    @Param('orderId') orderId: string,
  ): Promise<PublicOrderWithItem<'Wide'>> {
    return await this.orderService.getOrderUniqueByTable({
      storeId,
      tableId,
      orderId,
    });
  }
}
