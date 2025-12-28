import z from "zod";

export const storeParamsSchema = z.object({
  storeId: z.string().cuid2("유효하지 않은 매장 ID입니다."),
});
