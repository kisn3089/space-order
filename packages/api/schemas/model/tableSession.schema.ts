import z from "zod";
import {
  SESSION_QUERY_FILTER_CONST,
  SESSION_QUERY_INCLUDE_CONST,
  TableSessionStatus,
} from "../../../db";
import { commonSchema } from "../common";

// 32 bytes base64url encoding = 43 characters
export const sessionTokenSchema = z.string().length(43);

export const updateReactivateSchema = z
  .object({ status: z.literal("REACTIVATE") })
  .strict();

export const updateDeactivateSchema = z
  .object({ status: z.literal(TableSessionStatus.CLOSED) })
  .strict();

export const updateActivateSchema = z
  .object({
    status: z.literal(TableSessionStatus.ACTIVE),
    totalAmount: z
      .number()
      .min(0, "총 가격은 0원 이상이어야 합니다.")
      .optional(),
  })
  .strict();

export const updateExtendsExpireAtSchema = z
  .object({ status: z.literal("EXTEND_EXPIRES_AT") })
  .strict();

export const updateSessionPaymentSchema = z
  .object({ status: z.literal(TableSessionStatus.PAYMENT_PENDING) })
  .strict();

export const updateSessionSchema = z.discriminatedUnion("status", [
  updateReactivateSchema,
  updateDeactivateSchema,
  updateActivateSchema,
  updateExtendsExpireAtSchema,
  updateSessionPaymentSchema,
]);

const sessionIdSchema = z
  .object({ sessionId: commonSchema.cuid2("TableSession") })
  .strict();

// table.schema.ts와의 순환 참조를 피하기 위해 직접 정의
const tableIdParamsSchema = z
  .object({ tableId: commonSchema.cuid2("Table") })
  .strict();
export const sessionParamsSchema = tableIdParamsSchema.merge(sessionIdSchema);

/** -------- Query --------- */
const sessionFilterEnumSchema = z.enum([
  SESSION_QUERY_FILTER_CONST.ALIVE_SESSION,
  SESSION_QUERY_FILTER_CONST.ENDED_SESSION,
]);

const sessionIncludeEnumSchema = z.enum([
  SESSION_QUERY_INCLUDE_CONST.ORDERS,
  SESSION_QUERY_INCLUDE_CONST.ORDER_ITEMS,
]);

export const sessionIncludeQuerySchema = {
  include: sessionIncludeEnumSchema,
  filter: sessionFilterEnumSchema,
};

export const sessionListQuerySchema = z.object({
  include: sessionIncludeEnumSchema.optional(),
  filter: sessionFilterEnumSchema.optional(),
});

export const sessionUniqueQuerySchema = z
  .object({ include: sessionIncludeEnumSchema.optional() })
  .optional();
