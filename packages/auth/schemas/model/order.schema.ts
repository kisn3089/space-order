import z from "zod";

export const orderParamsSchema = z.object({
  orderId: z.string().cuid2("유효하지 않은 주문 ID입니다."),
});
