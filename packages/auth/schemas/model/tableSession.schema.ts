import z from "zod";

export const extendsTableSessionSchema = z.object({
  expiresAt: z.date(),
});

/** TODO: 임시로 생성 - 주문 항목 */
const OrdersSchema = z.object({
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

// export const closeTableSessionSchema = z.object({
//   status: z.literal(TableSessionStatus.CLOSED),
// });

export const updatePaymentSessionSchema = z.object({
  totalAmount: z.number().min(0, "총 금액은 0 이상이어야 합니다."),
  paidAmount: z.number().min(0, "지불 금액은 0 이상이어야 합니다."),
  orders: OrdersSchema.array().nonempty("주문 항목은 하나 이상이어야 합니다."),
});
