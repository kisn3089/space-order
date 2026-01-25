import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import useOwnerOrder from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
import { nextStatusMap, OrderStatus } from "@spaceorder/db";
import { SummarizedOrderWithItem } from "@spaceorder/db/types/responseModel.type";
import { Button } from "@spaceorder/ui/components/button";
import React from "react";
import { TableBoardProps } from "./TableOrderList";

type FilteredPendingStatus = Omit<SummarizedOrderWithItem, "status"> & {
  status: typeof OrderStatus.PENDING;
};
type AcceptAllPendingOrdersProps = {
  orders?: SummarizedOrderWithItem[];
} & TableBoardProps;
export default function AcceptAllPendingOrders({
  orders,
  storeId,
  tableId,
}: AcceptAllPendingOrdersProps) {
  const [isError, setIsError] = React.useState(false);
  const { updateOwnerOrder } = useOwnerOrder();

  const acceptEveryPendingOrders = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
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
            params: { storeId, tableId, orderId: order.publicId },
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
