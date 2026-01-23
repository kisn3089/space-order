import z from "zod";
import { commonSchema } from "../common";
import { OrderStatus } from "../../../db";
import { mergedStoreAndTableParamsSchema } from "./table.schema";
import { createOrderItemSchema } from "./orderItem.schema";

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

export const orderItemParamsSchema = orderIdParamsSchema.merge(
  orderItemIdParamsSchema
);

export const orderParamsSchema =
  mergedStoreAndTableParamsSchema.merge(orderIdParamsSchema);

/**
 * Body Schema
 */
export const createOrderSchema = z.object({
  orderItems: createOrderItemSchema.array(),
  memo: z.string().max(50, "메모는 최대 50자까지 가능합니다.").optional(),
});

export const updateOrderSchema = createOrderSchema
  .omit({ orderItems: true })
  .extend({
    status: z.nativeEnum(OrderStatus),
    cancelledReason: z
      .string()
      .max(50, "취소 사유는 최대 50자까지 가능합니다."),
  })
  .partial()
  .strict();
