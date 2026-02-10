"use client";

import { useState, useTransition } from "react";
import { Button } from "@spaceorder/ui/components/button";
import {
  nextStatusMap,
  OrderStatus,
  SummarizedOrderWithItem,
} from "@spaceorder/db";

import { useTableOrderContext } from "./TableOrderContext";
import { Spinner } from "@spaceorder/ui/components/spinner";
import useOrderByTable, {
  UpdateOrderByTable,
} from "@spaceorder/api/core/order/order/useOrderByTable.mutate";
import { UpdateOrderByTablePayload } from "@spaceorder/api/core/order/order/httpOrder";
import { useParams } from "next/navigation";

type FilteredPendingStatus = Omit<SummarizedOrderWithItem, "status"> & {
  status: typeof OrderStatus.PENDING;
};

export function TableOrderAcceptAllButton() {
  const params = useParams<{ storeId: string }>();
  const {
    state: { session },
  } = useTableOrderContext();

  const [isPending, startTransition] = useTransition();
  const [failedUpdateItems, setFailedUpdateItems] = useState<
    UpdateOrderByTable[]
  >([]);
  const { updateOrderByTable } = useOrderByTable(params.storeId);

  const pendingOrders = session?.orders?.filter(
    (order): order is FilteredPendingStatus =>
      order.status === OrderStatus.PENDING
  );

  if (!pendingOrders?.length) {
    return null;
  }

  const acceptAllPendingOrders = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    if (failedUpdateItems.length > 0) {
      setFailedUpdateItems([]);
    }

    const updateOrderItems = pendingOrders.map((order) => {
      const nextStatus = nextStatusMap[order.status];
      const orderPayload: UpdateOrderByTablePayload = {
        status: nextStatus,
      };

      return {
        orderId: order.publicId,
        updateOrderPayload: orderPayload,
      };
    });

    const failedOrderItems: UpdateOrderByTable[] = [];
    startTransition(async () => {
      await Promise.all(
        updateOrderItems.map((updateItem) =>
          updateOrderByTable.mutateAsync(updateItem).catch(() => {
            failedOrderItems.push(updateItem);
          })
        )
      );

      if (failedOrderItems.length > 0) {
        setFailedUpdateItems(failedOrderItems);
      }
    });
  };

  const contentOrError =
    failedUpdateItems.length > 0
      ? `${failedUpdateItems.length}개 실패, 다시 시도`
      : "모든 주문 수락";
  const buttonVariant =
    failedUpdateItems.length > 0 ? "destructive" : "default";

  return (
    <div className="px-2 pt-1">
      <Button
        disabled={isPending}
        onClick={acceptAllPendingOrders}
        variant={buttonVariant}
        className="w-full font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-live="polite"
      >
        {isPending ? <Spinner /> : contentOrError}
      </Button>
    </div>
  );
}
