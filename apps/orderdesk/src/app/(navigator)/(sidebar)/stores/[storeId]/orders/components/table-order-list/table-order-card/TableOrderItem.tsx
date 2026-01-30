"use client";

import { CardContent } from "@spaceorder/ui/components/card";
import { Badge } from "@spaceorder/ui/components/badge";
import { BADGE_BY_ORDER_STATUS } from "@spaceorder/ui/constants/badgeByOrderStatus.const";
import { OrderStatus, SummarizedOrderWithItem } from "@spaceorder/db";
import { useTableOrderContext } from "./TableOrderContext";
import ButtonWrapper from "@spaceorder/ui/components/ButtonWrapper";
import { useState } from "react";
import { Button } from "@spaceorder/ui/components/button";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";

interface TableOrderItemProps {
  order: SummarizedOrderWithItem;
}

export function TableOrderItem({ order }: TableOrderItemProps) {
  const [isError, setIsError] = useState(false);
  const {
    actions: { updateOrderStatus },
  } = useTableOrderContext();

  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isError) setIsError(false);

    try {
      await updateOrderStatus(order.publicId, order.status);
    } catch {
      setIsError(true);
    }
  };

  return (
    <ButtonWrapper disabled={isFinishStatus} onClick={handleClick}>
      <CardContent
        className={`rounded-lg bg-accent ${!isFinishStatus ? "hover:bg-background" : ""} border p-2 font-semibold flex flex-col justify-center`}
      >
        <ActivityRender mode={isError ? "visible" : "hidden"}>
          <Button
            className="w-full mb-2"
            variant={"destructive"}
            onClick={handleClick}
          >
            다시 시도
          </Button>
        </ActivityRender>
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
            <p className="tabular-nums">{orderItem.quantity}</p>
          </div>
        ))}
      </CardContent>
    </ButtonWrapper>
  );
}
