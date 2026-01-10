import { CardContent } from "@spaceorder/ui/components/card";
import { OrderStatus, PublicOrderWithItem } from "@spaceorder/db";
import { Badge } from "@spaceorder/ui/components/badge";
import { meQuery, ORDER_STATUS, orderQuery } from "@spaceorder/api";

type TableOrderProps = { order: PublicOrderWithItem; tableId: string };
export default function TableOrder({ order, tableId }: TableOrderProps) {
  const { data: stores, isSuccess } = meQuery.fetchMyOrderListAllinclusive({});
  if (!isSuccess) return null;
  const { data: orderList, refetch } = orderQuery.fetchOrderUnique({
    enabled: false,
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
    console.log("next status로 전이합니다: ", stores);
    /** 다음 주문 상태로 전이 */
    await refetch();
  };
  console.log("orderList: ", orderList);

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
