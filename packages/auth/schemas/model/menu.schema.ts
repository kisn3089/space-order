import z from "zod";
import { commonSchema } from "../common";
import { storeIdParamsSchema } from "./store.schema";

const menuIdParamsSchema = z
  .object({ menuId: commonSchema.cuid2("Menu") })
  .strict();

export const mergedStoreIdAndMenuIdParamsSchema =
  storeIdParamsSchema.merge(menuIdParamsSchema);

export const createMenuSchema = z
  .object({
    name: z
      .string()
      .min(1, "메뉴 이름은 필수입니다.")
      .max(30, "메뉴 이름은 최대 30자까지 가능합니다."),
    price: z.number(),
    description: z
      .string()
      .max(100, "메뉴 설명은 최대 100자까지 가능합니다.")
      .optional(),
    imageUrl: z.string().url("유효한 이미지 URL이어야 합니다.").optional(),
    category: z
      .string()
      .max(20, "카테고리 이름은 최대 20자까지 가능합니다.")
      .optional(),
    sortOrder: z.number().optional(),
    requiredOptions: z.record(z.string(), z.string().array()).optional(),
    customOptions: z
      .record(
        z.string(),
        z.object({
          trigger: z.string().array().optional(),
          options: z.string().array(),
        })
      )
      .optional(),
  })
  .strict();

export const updateMenuSchema = createMenuSchema
  .extend({ isAvailable: z.boolean() })
  .partial();
