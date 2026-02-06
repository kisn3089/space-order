import z from "zod";
import {
  SESSION_QUERY_FILTER_KEYS,
  SESSION_QUERY_INCLUDE_KEYS,
  TableSessionStatus,
} from "../../../db";
import { commonSchema } from "../common";
import { storeIdParamsSchema } from "./store.schema";

// 32 bytes base64url encoding = 43 characters
export const sessionTokenSchema = z.string().length(43);
export const sessionTokenParamsSchema = z
  .object({
    sessionToken: sessionTokenSchema,
  })
  .strict();

export const createSessionSchema = z
  .object({
    qrCode: commonSchema.cuid2("TableSession"),
  })
  .strict();

export const updateReactivateSchema = z
  .object({ status: z.literal("REACTIVATE") })
  .strict();

export const updateDeactivateSchema = z
  .object({ status: z.literal(TableSessionStatus.CLOSED) })
  .strict();

export const updateActivateSchema = z
  .object({
    status: z.literal(TableSessionStatus.ACTIVE),
    paidAmount: z
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

export const updateSessionPayloadSchema = z.discriminatedUnion("status", [
  updateReactivateSchema,
  updateDeactivateSchema,
  updateActivateSchema,
  updateExtendsExpireAtSchema,
  updateSessionPaymentSchema,
]);

export const updateCustomerSessionPayloadSchema = z.discriminatedUnion(
  "status",
  [
    updateActivateSchema,
    updateExtendsExpireAtSchema,
    updateSessionPaymentSchema,
  ]
);

export const sessionIdSchema = z
  .object({ sessionId: commonSchema.cuid2("TableSession") })
  .strict();

export const storeIdAndSessionIdSchema =
  storeIdParamsSchema.merge(sessionIdSchema);

/** -------- Query --------- */
const sessionFilterEnumSchema = z.enum([
  SESSION_QUERY_FILTER_KEYS.ALIVE_SESSION,
  SESSION_QUERY_FILTER_KEYS.ENDED_SESSION,
]);

const sessionIncludeEnumSchema = z.enum([
  SESSION_QUERY_INCLUDE_KEYS.ORDERS,
  SESSION_QUERY_INCLUDE_KEYS.ORDER_ITEMS,
]);

export const sessionIncludeQuerySchema = {
  include: sessionIncludeEnumSchema,
  filter: sessionFilterEnumSchema,
};

export const sessionListQuerySchema = z.object({
  include: sessionIncludeEnumSchema.optional(),
  filter: sessionFilterEnumSchema.optional(),
});
