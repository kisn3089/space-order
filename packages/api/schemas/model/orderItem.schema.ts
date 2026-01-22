import z from "zod";
import { commonSchema } from "../common";
import { ORDER_ITEM_QUERY_FILTER_CONST } from "@spaceorder/db/constants/model-query-key/orderItemQuery.const";

const createOptionsSchema = z.record(
  z.string(),
  z.union([
    z.string(),
    z
      .object({
        options: z.string(),
        trigger: z.string().optional(),
      })
      .strict(),
  ])
);

export const createOrderItemSchema = z
  .object({
    menuPublicId: commonSchema.cuid2("Menu"),
    quantity: z.number().min(1, "수량은 최소 1 이상이어야 합니다."),
    menuName: z.string().optional(),
    options: createOptionsSchema.optional(),
  })
  .strict();

export const partialUpdateOrderItemSchema = createOrderItemSchema.partial();

/** -------- Query --------- */
const orderItemFilterQuerySchema = z.object({
  filter: z.literal(ORDER_ITEM_QUERY_FILTER_CONST.ALIVE_SESSION),
});

export const orderItemQuerySchema = z.discriminatedUnion("filter", [
  orderItemFilterQuerySchema,
  z.object({ filter: z.undefined() }),
]);
