import z from "zod";
import { commonSchema } from "../common";

export const storeIdParamsSchema = z
  .object({
    storeId: commonSchema.cuid2("Store"),
  })
  .strict();
