"use client";

import useSuspenseWithSession from "@spaceorder/api/hooks/useSuspenseWithSession";
import { PublicOrderWithItem } from "@spaceorder/db/types";
import { Badge } from "@spaceorder/ui/components/badge";
import { BADGE_BY_ORDER_STATUS } from "@spaceorder/ui/constants/badgeByOrderStatus.const";
import OrderItemThumbnail from "./OrderItemThumbnail";

export default function OrderHistory() {
  const { data: orders } = useSuspenseWithSession<
    PublicOrderWithItem<"Wide">[]
  >("/orders/v1/sessions/orders");

  if (orders.length === 0) {
    return <div className="font-bold text-center">주문 내역이 없습니다!</div>;
  }

  return (
    <div className="flex gap-x-4 overflow-x-scroll [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {orders.map((order) => (
        <div key={order.publicId} className="flex rounded-2xl bg-accent p-4">
          <div className="flex flex-col gap-y-2 items-center w-fit">
            <Badge
              className="font-semibold text-center text-xs"
              variant={BADGE_BY_ORDER_STATUS[order.status].badgeVariant}
            >
              {BADGE_BY_ORDER_STATUS[order.status].label}
            </Badge>
            <div className="flex gap-x-2">
              {order.orderItems.map((orderItem) => (
                <OrderItemThumbnail
                  key={orderItem.publicId}
                  menuImageUrl={orderItem.menuImageUrl}
                  menuName={orderItem.menuName}
                  quantity={orderItem.quantity}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
