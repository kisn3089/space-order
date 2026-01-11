import { CardContent } from "@spaceorder/ui/components/card";
import { OrderStatus, PublicOrderWithItem } from "@spaceorder/db";
import { Badge } from "@spaceorder/ui/components/badge";
import { meQuery, ORDER_STATUS, orderQuery } from "@spaceorder/api";
import useOwnerOrders from "@spaceorder/api/core/owner-orders/useOwnerOrders.mutate";
import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-orders/httpOwnerOrders";

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  [OrderStatus.PENDING]: OrderStatus.ACCEPTED,
  [OrderStatus.ACCEPTED]: OrderStatus.PREPARING,
  [OrderStatus.PREPARING]: OrderStatus.COMPLETED,
  [OrderStatus.COMPLETED]: null, // 완료 상태는 다음 상태 없음
  [OrderStatus.CANCELLED]: null, // 취소 상태는 다음 상태 없음
} as const;

type TableOrderProps = { order: PublicOrderWithItem; tableId: string };
export default function TableOrder({ order, tableId }: TableOrderProps) {
  const { updateOwnerOrder } = useOwnerOrders();
  const { data: stores, isSuccess } = meQuery.fetchMyOrderListAllinclusive({});

  if (!isSuccess) return null;
  const { data: orderList, isSuccess: isOrderListSuccess } =
    orderQuery.fetchOrderUnique({
      enabled: isSuccess,
      fetchParams: {
        storeId: stores?.publicId,
        tableId: tableId,
        orderId: order.publicId,
      },
    });

  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  const orderClickEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    pushNextOrderStatus();
  };

  const pushNextOrderStatus = async () => {
    if (isOrderListSuccess) {
      // 상태 전이 맵: 현재 상태 -> 다음 상태

      const nextStatus = nextStatusMap[orderList.status];
      if (!nextStatus) {
        console.log("더 이상 전이할 상태가 없습니다.");
        return;
      }
      console.log(
        "next status로 전이합니다: ",
        nextStatus || "전이할 상태 없음"
      );
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
        params: { storeId: stores.publicId, tableId, orderId: order.publicId },
        updateOrderPayload: orderPayload,
      });
      console.log("결과: ", result);
    }
  };

  return (
    <CardContent
      key={order.publicId}
      className={`rounded-lg bg-accent ${!isFinishStatus ? "hover:bg-background" : ""} border p-2 mx-2 font-semibold flex flex-col justify-center`}
      onClick={orderClickEvent}
    >
      <div className="flex justify-center">
        <Badge
          variant={ORDER_STATUS[order.status].badgeVariant}
          className="w-fit text-xs"
        >
          {ORDER_STATUS[order.status].label}
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
