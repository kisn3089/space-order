import z from "zod";
import { commonSchema } from "../common";
import { OrderStatus } from "../../../db";
import { tableParamsSchema } from "./table.schema";
import { createOrderItemPayloadSchema } from "./orderItem.schema";
import { storeIdParamsSchema } from "./store.schema";
import { sessionTokenParamsSchema } from "./tableSession.schema";

export const orderIdParamsSchema = z
  .object({
    orderId: commonSchema.cuid2("Order"),
  })
  .strict();

export const sessionAndOrderIdParamsSchema =
  sessionTokenParamsSchema.merge(orderIdParamsSchema);

const orderItemIdParamsSchema = z
  .object({
    orderItemId: commonSchema.cuid2("OrderItem"),
  })
  .strict();

export const storeIdAndOrderIdParamsSchema =
  storeIdParamsSchema.merge(orderIdParamsSchema);

export const storeIdAndOrderItemIdParamsSchema = storeIdParamsSchema.merge(
  orderItemIdParamsSchema
);

export const storeIdAndOrderIdAndTableIdParamsSchema =
  storeIdAndOrderIdParamsSchema.merge(tableParamsSchema);

/** Body Schema */
export const createOrderPayloadSchema = z.object({
  orderItems: createOrderItemPayloadSchema.array(),
  memo: z.string().max(50, "메모는 최대 50자까지 가능합니다.").optional(),
});

export const updateOrderPayloadSchema = createOrderPayloadSchema
  .omit({ orderItems: true })
  .extend({
    status: z.nativeEnum(OrderStatus),
    cancelledReason: z
      .string()
      .max(50, "취소 사유는 최대 50자까지 가능합니다."),
  })
  .partial()
  .strict();
