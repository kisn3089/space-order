import z from "zod";
import { commonSchema } from "../common";
import { OrderStatus } from "../../../db";
import { mergedStoreAndTableParamsSchema } from "./table.schema";

/**
 * orderItem은 order에 종속되므로 orderItem 관련 스키마는 order 스키마에 포함되어 정의됨
 * Params Schema
 */
export const orderIdParamsSchema = z
  .object({
    orderId: commonSchema.cuid2("Order"),
  })
  .strict();

const orderItemIdParamsSchema = z
  .object({
    orderItemId: commonSchema.cuid2("OrderItem"),
  })
  .strict();

export const orderParamsSchema =
  mergedStoreAndTableParamsSchema.merge(orderIdParamsSchema);

export const orderItemParamsSchema = orderIdParamsSchema.merge(
  orderItemIdParamsSchema
);

/**
 * Body Schema
 */
const orderItemSchema = z
  .object({
    menuPublicId: commonSchema.cuid2("Menu"),
    quantity: z.number().min(1, "수량은 최소 1 이상이어야 합니다."),
    menuName: z.string().optional(),
    options: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const createOrderSchema = z.object({
  orderItems: orderItemSchema.array(),
  memo: z.string().max(50, "메모는 최대 50자까지 가능합니다.").optional(),
  totalPrice: z.number().min(0, "총 가격은 0 이상이어야 합니다.").optional(),
});

export const updateOrderSchema = createOrderSchema
  // .omit({ menuPublicId: true, totalPrice: true })
  .extend({
    status: z.nativeEnum(OrderStatus),
    cancelledReason: z
      .string()
      .max(50, "취소 사유는 최대 50자까지 가능합니다."),
  })
  .partial();
