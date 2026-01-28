"use client";

import { CardContent } from "@spaceorder/ui/components/card";
import { Badge } from "@spaceorder/ui/components/badge";
import { BADGE_BY_ORDER_STATUS } from "@spaceorder/ui/constants/badgeByOrderStatus.const";
import { OrderStatus, SummarizedOrderWithItem } from "@spaceorder/db";
import { useTableOrderContext } from "./TableOrderContext";

interface TableOrderItemProps {
  order: SummarizedOrderWithItem;
}

export function TableOrderItem({ order }: TableOrderItemProps) {
  const {
    actions: { updateOrderStatus },
  } = useTableOrderContext();

  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateOrderStatus(order.publicId, order.status);
  };

  return (
    <CardContent
      className={`rounded-lg bg-accent ${!isFinishStatus ? "hover:bg-background" : ""} border p-2 font-semibold flex flex-col justify-center`}
      onClick={handleClick}
    >
      <div className="flex justify-center">
        <Badge
          variant={BADGE_BY_ORDER_STATUS[order.status].badgeVariant}
          className="w-fit text-xs"
        >
          {BADGE_BY_ORDER_STATUS[order.status].label}
        </Badge>
      </div>
      {order.orderItems.map((orderItem) => (
        <div
          className="flex justify-between text-sm/5"
          key={orderItem.publicId}
        >
          <p>{orderItem.menuName}</p>
          <p>{orderItem.quantity}</p>
        </div>
      ))}
    </CardContent>
  );
}
