import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import useOwnerOrder from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
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
  const [isError, setIsError] = React.useState(false);
  const { updateOwnerOrder } = useOwnerOrder();

  const acceptEveryPendingOrders = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    if (isError) {
      setIsError(false);
    }
    const filterPendingStatusInOrders = orders?.filter(
      (order): order is FilteredPendingStatus =>
        order.status === OrderStatus.PENDING
    );

    try {
      if (!filterPendingStatusInOrders?.length) {
        throw new Error("수락할 보류 중인 주문이 없습니다.");
      }

      await Promise.all(
        filterPendingStatusInOrders.map((order) => {
          const nextStatus = nextStatusMap[order.status];
          const orderPayload: UpdateOwnerOrderPayload = {
            status: nextStatus,
          };

          return updateOwnerOrder.mutateAsync({
            params: {
              storeId: params.storeId,
              tableId,
              orderId: order.publicId,
            },
            updateOrderPayload: orderPayload,
          });
        })
      );
    } catch {
      setIsError(true);
    }
  };

  const contentOrError = isError
    ? "주문 수락 일부 실패, 다시 시도"
    : "모든 주문 수락";
  const buttonVariant = isError ? "destructive" : "default";

  return (
    <Button
      onClick={acceptEveryPendingOrders}
      variant={buttonVariant}
      className="w-full"
    >
      {contentOrError}
    </Button>
  );
}
