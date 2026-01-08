import { CardContent } from "@spaceorder/ui/components/card";
import { OrderStatus, PublicOrderWithItem } from "@spaceorder/db";
import { Badge } from "@spaceorder/ui/components/badge";
import { ORDER_STATUS } from "@spaceorder/api";

export default function TableOrder({ order }: { order: PublicOrderWithItem }) {
  const isFinishStatus =
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.CANCELLED;

  return (
    <CardContent
      key={order.publicId}
      className={`rounded-lg bg-accent ${!isFinishStatus ? "hover:bg-background" : ""} border p-2 mx-2 font-semibold flex flex-col justify-center`}
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
