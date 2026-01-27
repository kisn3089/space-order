import z from "zod";
import { commonSchema } from "../common";
import { storeIdParamsSchema } from "./store.schema";
import {
  MenuCustomOption,
  MenuCustomOptions,
  MenuOption,
  MenuRequiredOptions,
  OptionsSnapshot,
} from "@spaceorder/db/types/menuOptions.type";

const menuIdParamsSchema = z
  .object({ menuId: commonSchema.cuid2("Menu") })
  .strict();

const optionSchema = z
  .object({
    key: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })
  .strict() satisfies z.ZodType<MenuOption>;

const requiredOptionsSchema = z.record(
  z.string(),
  z.array(optionSchema)
) satisfies z.ZodType<MenuRequiredOptions>;

const triggerSchema = z
  .object({
    group: z.string(),
    in: z.array(z.string()),
  })
  .strict();

const customOptionValueSchema = z
  .object({
    options: z.array(optionSchema),
    trigger: z.array(triggerSchema).optional(),
  })
  .strict() satisfies z.ZodType<MenuCustomOption>;

const customOptionsSchema = z.record(
  z.string(),
  customOptionValueSchema
) satisfies z.ZodType<MenuCustomOptions>;

export const menuOptionsSchema = z.object({
  requiredOptions: requiredOptionsSchema.nullable(),
  customOptions: customOptionsSchema.nullable(),
}) satisfies z.ZodType<OptionsSnapshot>;

export const mergedStoreIdAndMenuIdParamsSchema =
  storeIdParamsSchema.merge(menuIdParamsSchema);

export const createMenuSchema = z
  .object({
    name: z
      .string()
      .min(1, "메뉴 이름은 필수입니다.")
      .max(30, "메뉴 이름은 최대 30자까지 가능합니다."),
    price: z.number().min(0, "메뉴 가격은 0원 이상이어야 합니다."),
    description: z
      .string()
      .max(100, "메뉴 설명은 최대 100자까지 가능합니다.")
      .optional(),
    imageUrl: z.string().url("유효한 이미지 URL이어야 합니다.").optional(),
    category: z
      .string()
      .max(20, "카테고리 이름은 최대 20자까지 가능합니다.")
      .optional(),
    sortOrder: z.number().min(0, "정렬 순서는 0 이상이어야 합니다.").optional(),
    requiredOptions: requiredOptionsSchema.optional(),
    customOptions: customOptionsSchema.optional(),
  })
  .strict();

export const updateMenuSchema = createMenuSchema
  .extend({ isAvailable: z.boolean(), deletedAt: z.date().nullable() })
  .partial();
