import { CardContent } from "@spaceorder/ui/components/card";
import {
  nextStatusMap,
  OrderStatus,
  SummarizedOrderWithItem,
} from "@spaceorder/db";
import { Badge } from "@spaceorder/ui/components/badge";
import { UpdateOwnerOrderPayload } from "@spaceorder/api/core/owner-order/httpOwnerOrder";
import { BADGE_BY_ORDER_STATUS } from "@spaceorder/ui/constants/badgeByOrderStatus.const";
import useOwnerOrder from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
import { useParams } from "next/navigation";

type TableOrderProps = { order: SummarizedOrderWithItem; tableId: string };
export default function TableOrder({ order, tableId }: TableOrderProps) {
  const params = useParams<{ storeId: string }>();
  const { updateOwnerOrder } = useOwnerOrder();

  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  const orderClickEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    pushNextOrderStatus();
  };

  const pushNextOrderStatus = async () => {
    if (order.status) {
      const nextStatus = nextStatusMap[order.status];
      if (!nextStatus) {
        console.log("더 이상 전이할 상태가 없습니다.");
        return;
      }
      const orderPayload: UpdateOwnerOrderPayload = {
        status: nextStatus,
      };
      return await updateOwnerOrder.mutateAsync({
        params: { storeId: params.storeId, tableId, orderId: order.publicId },
        updateOrderPayload: orderPayload,
      });
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
