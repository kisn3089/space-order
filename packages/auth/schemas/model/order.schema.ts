import z from "zod";

export const orderParamsSchema = z.object({
  orderId: z.string().cuid2("유효하지 않은 주문 ID입니다."),
});

/** TODO: 임시로 생성 - 주문 항목 */
export const OrdersSchema = z.object({
  totalPrice: z.number().min(0, "총 가격은 0 이상이어야 합니다."),
  memo: z.string().max(50, "메모는 최대 50자까지 가능합니다.").optional(),
  cancelledReason: z
    .string()
    .max(50, "취소 사유는 최대 50자까지 가능합니다.")
    .optional(),
  acceptedAt: z.date().optional(),
  completedAt: z.date().optional(),
  // orderItems 필요할지에 대한 판단 필요
});
