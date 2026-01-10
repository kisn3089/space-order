import z from "zod";
import { TableSessionStatus } from "../../../db";

// 32 bytes base64url encoding = 43 characters
export const sessionTokenSchema = z.string().length(43);

export const updateReactivateSchema = z
  .object({
    status: z.literal("REACTIVATE"),
  })
  .strict();

export const updateDeactivateSchema = z
  .object({
    status: z.literal(TableSessionStatus.CLOSED),
  })
  .strict();

export const updateActivateSchema = z
  .object({
    status: z.literal(TableSessionStatus.ACTIVE),
  })
  .strict();

export const updateExtendsExpireAtSchema = z
  .object({
    status: z.literal("EXTEND_EXPIRES_AT"),
  })
  .strict();

export const updateSessionPaymentSchema = z
  .object({
    status: z.literal(TableSessionStatus.PAYMENT_PENDING),
  })
  .strict();

export const updateSessionSchema = z.discriminatedUnion("status", [
  updateReactivateSchema,
  updateDeactivateSchema,
  updateActivateSchema,
  updateExtendsExpireAtSchema,
  updateSessionPaymentSchema,
]);
