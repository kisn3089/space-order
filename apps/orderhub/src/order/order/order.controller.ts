import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  createOrderPayloadSchema,
  storeIdParamsSchema,
  updateOrderPayloadSchema,
  tableIdParamsSchema,
  orderIdParamsSchema,
} from "@spaceorder/api/schemas";
import {
  DocsOwnerOrderCancel,
  DocsOwnerOrderCreate,
  DocsOwnerOrderGetActiveSessionOrders,
  DocsOwnerOrderGetList,
  DocsOwnerOrderGetListByStore,
  DocsOwnerOrderGetSummary,
  DocsOwnerOrderGetUnique,
  DocsOwnerOrderUpdate,
} from "src/docs/ownerOrder.docs";
import type {
  Owner,
  PublicOrderWithItem,
  SummarizedOrdersByStore,
} from "@spaceorder/db";
import { Client } from "src/decorators/client.decorator";
import { ZodValidation } from "src/utils/guards/zod-validation.guard";
import { OrderService } from "./order.service";
import { StoreAccessGuard } from "src/utils/guards/store-access.guard";
import {
  CreateOrderPayloadDto,
  UpdateOrderPayloadDto,
} from "src/dto/order.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { OrderAccessGuard } from "src/utils/guards/order-access.guard";
import { TableAccessGuard } from "src/utils/guards/table-access.guard";
import { ORDER_ITEMS_WITH_OMIT_PRIVATE } from "src/common/query/order-item-query.const";

@ApiTags("Order")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ============================================================
  // Store Orders
  // ============================================================

  /** store에 속한 테이블별로 활성화된 세션의 요약된 주문 조회 */
  @Get("stores/:storeId/orders/summary")
  @UseGuards(StoreAccessGuard, ZodValidation({ params: storeIdParamsSchema }))
  @DocsOwnerOrderGetSummary()
  async listOrdersSummary(
    @Client() client: Owner,
    @Param("storeId") storeId: string
  ): Promise<SummarizedOrdersByStore> {
    return await this.orderService.getOrdersSummary(client, storeId);
  }

  /** store에 속한 모든 주문 조회 */
  @Get("stores/:storeId/orders")
  @UseGuards(StoreAccessGuard, ZodValidation({ params: storeIdParamsSchema }))
  @DocsOwnerOrderGetListByStore()
  async listByStore(
    @Param("storeId") storeId: string
  ): Promise<PublicOrderWithItem<"Wide">[]> {
    return await this.orderService.getOrderList({
      where: { store: { publicId: storeId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  /** 특정 주문 조회 */
  @Get(":orderId")
  @UseGuards(OrderAccessGuard, ZodValidation({ params: orderIdParamsSchema }))
  @DocsOwnerOrderGetUnique()
  async unique(
    @Param("orderId") orderId: string
  ): Promise<PublicOrderWithItem<"Wide">> {
    return await this.orderService.getOrderUnique({
      where: { publicId: orderId },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }

  /** 특정 주문 부분 수정 */
  @Patch(":orderId")
  @UseGuards(
    OrderAccessGuard,
    ZodValidation({
      params: orderIdParamsSchema,
      body: updateOrderPayloadSchema,
    })
  )
  @DocsOwnerOrderUpdate()
  async partialUpdate(
    @Param("orderId") orderId: string,
    @Body() updatePayload: UpdateOrderPayloadDto
  ): Promise<PublicOrderWithItem<"Wide">> {
    return await this.orderService.partialUpdateOrder(orderId, updatePayload);
  }

  /** 특정 주문 삭제(소프트) */
  @Delete(":orderId")
  @UseGuards(OrderAccessGuard, ZodValidation({ params: orderIdParamsSchema }))
  @DocsOwnerOrderCancel()
  async cancel(
    @Param("orderId") orderId: string
  ): Promise<PublicOrderWithItem<"Wide">> {
    return await this.orderService.cancelOrder({ orderId });
  }

  // ============================================================
  // Table Orders
  // ============================================================

  /** 테이블의 활성 세션에 속한 주문 목록 조회 */
  @Get("tables/:tableId/active-session/orders")
  @UseGuards(TableAccessGuard, ZodValidation({ params: tableIdParamsSchema }))
  @DocsOwnerOrderGetActiveSessionOrders()
  async listOrdersByAliveSession(
    @Param("tableId") tableId: string
  ): Promise<PublicOrderWithItem<"Wide">[]> {
    return await this.orderService.getOrdersByAliveSession(tableId);
  }

  /** table에 속한 주문 생성 */
  @Post("tables/:tableId/orders")
  @UseGuards(
    TableAccessGuard,
    ZodValidation({
      params: tableIdParamsSchema,
      body: createOrderPayloadSchema,
    })
  )
  @DocsOwnerOrderCreate()
  async create(
    @Param("tableId") tableId: string,
    @Body() createPayload: CreateOrderPayloadDto
  ): Promise<PublicOrderWithItem<"Wide">> {
    return await this.orderService.createOrder(
      { publicId: tableId },
      createPayload
    );
  }

  /** table에 속한 주문 조회 */
  @Get("tables/:tableId/orders")
  @UseGuards(TableAccessGuard, ZodValidation({ params: tableIdParamsSchema }))
  @DocsOwnerOrderGetList()
  async listByTable(
    @Param("tableId") tableId: string
  ): Promise<PublicOrderWithItem<"Wide">[]> {
    return await this.orderService.getOrderList({
      where: { table: { publicId: tableId } },
      ...ORDER_ITEMS_WITH_OMIT_PRIVATE,
    });
  }
}
