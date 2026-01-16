import z from "zod";
import { storeIdParamsSchema } from "./store.schema";
import { commonSchema } from "../common";

export const createTableSchema = z
  .object({
    tableNumber: z.number().min(1, "테이블 번호는 1 이상이어야 합니다."),
    seats: z.number().min(1, "좌석 수는 1 이상이어야 합니다.").optional(),
    name: z
      .string()
      .max(20, "테이블 이름은 최대 20자까지 가능합니다.")
      .optional(),
    floor: z.number().optional(),
    section: z
      .string()
      .max(20, "구역 이름은 최대 20자까지 가능합니다.")
      .optional(),
    description: z
      .string()
      .max(50, "설명은 최대 50자까지 가능합니다.")
      .optional(),
  })
  .strict();

export const updateTableSchema = createTableSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateTable = z.infer<typeof updateTableSchema>;

export const tableParamsSchema = z
  .object({
    tableId: commonSchema.cuid2("Table"),
  })
  .strict();

export const mergedStoreAndTableParamsSchema =
  storeIdParamsSchema.merge(tableParamsSchema);

export const tableListQuerySchema = z.discriminatedUnion("include", [
  z.object({
    include: z.literal("orders"),
    filter: z.enum(["alive-session", "ended-session"]).optional(),
  }),
  z.object({
    include: z.literal("order-items"),
    filter: z.enum(["alive-session", "ended-session"]).optional(),
  }),
  z.object({
    include: z.undefined(),
    filter: z.literal("activated-table").optional(),
  }),
]);

export const tableQuerySchema = z.discriminatedUnion("include", [
  z.object({
    include: z.literal("orders"),
    filter: z.enum(["alive-session", "ended-session"]).optional(),
  }),
  z.object({
    include: z.literal("order-items"),
    filter: z.enum(["alive-session", "ended-session"]).optional(),
  }),
]);
