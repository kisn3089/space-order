"use client";

import React from "react";
import { Button } from "@spaceorder/ui/components/button";
import { nextStatusMap, OrderStatus, SummarizedOrderWithItem } from "@spaceorder/db";
import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import useOwnerOrder, {
  UpdateOwnerOrderParams,
} from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
import { useTableOrderContext } from "./TableOrderContext";

type FilteredPendingStatus = Omit<SummarizedOrderWithItem, "status"> & {
  status: typeof OrderStatus.PENDING;
};

export function TableOrderAcceptAllButton() {
  const {
    state: { session },
    meta: { storeId, tableId },
  } = useTableOrderContext();

  const [failedUpdateItems, setFailedUpdateItems] = React.useState<
    UpdateOwnerOrderParams[]
  >([]);
  const { updateOwnerOrder } = useOwnerOrder();

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
    e.stopPropagation();
    if (failedUpdateItems.length > 0) {
      setFailedUpdateItems([]);
    }

    const updateOrderItems = pendingOrders.map((order) => {
      const nextStatus = nextStatusMap[order.status];
      const orderPayload: UpdateOwnerOrderPayload = {
        status: nextStatus,
      };

      return {
        params: {
          storeId,
          tableId,
          orderId: order.publicId,
        },
        updateOrderPayload: orderPayload,
      };
    });

    const failedOrderItems: UpdateOwnerOrderParams[] = [];
    await Promise.all(
      updateOrderItems.map((updateItem) =>
        updateOwnerOrder.mutateAsync(updateItem).catch(() => {
          failedOrderItems.push(updateItem);
        })
      )
    );

    if (failedOrderItems.length > 0) {
      setFailedUpdateItems(failedOrderItems);
    }
  };

  const contentOrError =
    failedUpdateItems.length > 0
      ? `${failedUpdateItems.length}개 실패, 다시 시도`
      : "모든 주문 수락";
  const buttonVariant =
    failedUpdateItems.length > 0 ? "destructive" : "default";

  return (
    <div className="px-2">
      <Button
        onClick={acceptAllPendingOrders}
        variant={buttonVariant}
        className="w-full font-semibold"
      >
        {contentOrError}
      </Button>
    </div>
  );
}
