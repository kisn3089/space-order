import { CardContent } from "@spaceorder/ui/components/card";
import { OrderStatus, ResponseOrderWithItem } from "@spaceorder/db";
import { Badge } from "@spaceorder/ui/components/badge";
import {
  FetchOrderUniqueParams,
  UpdateOwnerOrderPayload,
} from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { BADGE_BY_ORDER_STATUS } from "@spaceorder/ui/constants/badgeByOrderStatus.const";
import useOwnerOrder from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.ACCEPTED,
  [OrderStatus.ACCEPTED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null, // 완료 상태는 다음 상태 없음
  [OrderStatus.CANCELLED]: null, // 취소 상태는 다음 상태 없음
} as const;

export default function TableOrder({
  orderId,
  storeId,
  tableId,
}: FetchOrderUniqueParams) {
  const { data: order } = useSuspenseWithAuth<ResponseOrderWithItem>(
    `/owner/stores/${storeId}/tables/${tableId}/orders/${orderId}`
  );
  const { updateOwnerOrder } = useOwnerOrder();

  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  const orderClickEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    pushNextOrderStatus();
  };

  const pushNextOrderStatus = async () => {
    // 상태 전이 맵: 현재 상태 -> 다음 상태
    if (order.status) {
      const nextStatus = nextStatusMap[order.status];
      if (!nextStatus) {
        console.log("더 이상 전이할 상태가 없습니다.");
        return;
      }
      const orderPayload: UpdateOwnerOrderPayload = {
        // orderItems: orderList.orderItems.map((orderItem) => ({
        //   menuName: orderItem.menuName,
        //   options: orderItem.options,
        //   quantity: orderItem.quantity,
        //   menuPublicId: "emhvr5chzxzwa8vd98j0uuds",
        // })),
        // memo: "time",
        status: nextStatus,
        // totalPrice: orderList?.totalPrice,
      };
      /** 다음 주문 상태로 전이 */
      const result = await updateOwnerOrder.mutateAsync({
        params: {
          storeId: storeId,
          tableId,
          orderId,
        },
        updateOrderPayload: orderPayload,
      });
      console.log("결과: ", result);
    }
  };

  return (
    <CardContent
      key={order.publicId}
      className={`rounded-lg bg-accent ${!isFinishStatus ? "hover:bg-background" : ""} border p-2 font-semibold flex flex-col justify-center`}
      onClick={orderClickEvent}
    >
      <div className="flex justify-center">
        <Badge
          variant={BADGE_BY_ORDER_STATUS[order.status].badgeVariant}
          className="w-fit text-xs"
        >
          {BADGE_BY_ORDER_STATUS[order.status].label}
        </Badge>
      </div>
      {order.orderItems.map((orderItem, i) => (
        <div
          className="flex justify-between text-sm/5"
          key={`${orderItem.menuName}-${i}`}
        >
          <p>{orderItem.menuName}</p>
          <p>{orderItem.quantity}</p>
        </div>
      ))}
    </CardContent>
  );
}
