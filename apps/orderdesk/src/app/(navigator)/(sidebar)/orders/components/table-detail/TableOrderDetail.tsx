import { DataTable } from "./data-table";
import { columns } from "./columns";
import { OrderItem } from "../table-orders/TableOrder";
import { orderData } from "../table-orders/orderData";
import { Button } from "@spaceorder/ui/components/button";

const data = orderData[0];
const orderItems: OrderItem[] = data.orderItem;

// utils 분리 필요
const transCurrencyFormat = (price: number) =>
  new Intl.NumberFormat("ko-KR", {
    currency: "KRW",
  }).format(price);

export default function TableOrderDetail() {
  return (
    <div className="overflow-hidden rounded-md border w-full h-full flex flex-col justify-between">
      <DataTable columns={columns} data={orderItems} />
      <footer className="flex flex-col gap-2 p-2">
        <Button
          className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
          variant={"secondary"}
        >
          할인
        </Button>
        <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${transCurrencyFormat(data.totalPrice)}원 결제`}</Button>
      </footer>
    </div>
  );
}
