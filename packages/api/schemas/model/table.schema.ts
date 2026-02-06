import z from "zod";
import { storeIdParamsSchema } from "./store.schema";
import { commonSchema } from "../common";
import { sessionIncludeQuerySchema } from "./tableSession.schema";

export const createTablePayloadSchema = z
  .object({
    tableNumber: z.number().min(1, "테이블 번호는 1 이상이어야 합니다."),
    seats: z.number().min(1, "좌석 수는 1 이상이어야 합니다.").optional(),
    name: z
      .string()
      .max(20, "테이블 이름은 최대 20자까지 가능합니다.")
      .optional(),
    floor: z.number().optional(),
    isActive: z.boolean().optional(),
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

export const updateTablePayloadSchema = createTablePayloadSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type UpdateTablePayload = z.infer<typeof updateTablePayloadSchema>;

export const tableParamsSchema = z
  .object({ tableId: commonSchema.cuid2("Table") })
  .strict();

export const storeIdAndTableIdParamsSchema =
  storeIdParamsSchema.merge(tableParamsSchema);

/** -------- Query --------- */
// include가 있으면 filter는 session filter만 가능
const tableWithIncludeQuerySchema = z.object({
  include: sessionIncludeQuerySchema.include.optional(),
  filter: sessionIncludeQuerySchema.filter.optional(),
});

// include가 없으면 filter=activated-table 가능
const tableWithoutIncludeQuerySchema = z.object({
  include: z.undefined(),
  filter: z.literal("activated-table").optional(),
});

export const tableListQuerySchema = z.union([
  tableWithIncludeQuerySchema,
  tableWithoutIncludeQuerySchema,
]);
