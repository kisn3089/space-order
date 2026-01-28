import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import useOwnerOrder, {
  UpdateOwnerOrderParams,
} from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
import {
  nextStatusMap,
  OrderStatus,
  SummarizedOrderWithItem,
} from "@spaceorder/db";
import { Button } from "@spaceorder/ui/components/button";
import { useParams } from "next/navigation";
import React from "react";

type FilteredPendingStatus = Omit<SummarizedOrderWithItem, "status"> & {
  status: typeof OrderStatus.PENDING;
};
type AcceptAllPendingOrdersProps = {
  orders?: SummarizedOrderWithItem[];
  tableId: string;
};
export default function AcceptAllPendingOrders({
  orders,
  tableId,
}: AcceptAllPendingOrdersProps) {
  const params = useParams<{ storeId: string }>();
  const [failedUpdateItems, setFailedUpdateItems] = React.useState<
    UpdateOwnerOrderParams[]
  >([]);
  const { updateOwnerOrder } = useOwnerOrder();

  const filterPendingStatusInOrders = orders?.filter(
    (order): order is FilteredPendingStatus =>
      order.status === OrderStatus.PENDING
  );

  if (!filterPendingStatusInOrders?.length) {
    return null;
  }

  const acceptEveryPendingOrders = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (failedUpdateItems.length > 0) {
      setFailedUpdateItems([]);
    }

    const updateOrderItems = filterPendingStatusInOrders.map((order) => {
      const nextStatus = nextStatusMap[order.status];
      const orderPayload: UpdateOwnerOrderPayload = {
        status: nextStatus,
      };

      return {
        params: {
          storeId: params.storeId,
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
    <Button
      onClick={acceptEveryPendingOrders}
      variant={buttonVariant}
      className="w-full font-semibold"
    >
      {contentOrError}
    </Button>
  );
}
