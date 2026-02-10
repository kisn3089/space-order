import z from "zod";
import { commonSchema } from "../common";

const optionItemSchema = z.record(z.string(), z.string());

export const createOrderItemPayloadSchema = z
  .object({
    menuPublicId: commonSchema.cuid2("Menu"),
    quantity: z.number().min(1, "수량은 최소 1 이상이어야 합니다."),
    menuName: z.string().optional(),
    requiredOptions: optionItemSchema.optional(),
    customOptions: optionItemSchema.optional(),
  })
  .strict();

export const partialUpdateOrderItemPayloadSchema = createOrderItemPayloadSchema
  .omit({ menuName: true })
  .partial()
  .strict();
