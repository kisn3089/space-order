import { OrderStatus } from "@prisma/client";

export const nextStatusMap = {
  [OrderStatus.PENDING]: OrderStatus.ACCEPTED,
  [OrderStatus.ACCEPTED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null, // 완료 상태는 다음 상태 없음
  [OrderStatus.CANCELLED]: null, // 취소 상태는 다음 상태 없음
} as const;
