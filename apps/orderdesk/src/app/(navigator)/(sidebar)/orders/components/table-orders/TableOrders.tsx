"use client";

import { orderData } from "./orderData";
import TableOrder from "./TableOrder";

export default function TableOrders() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-3">
      {orderData.map((order) => {
        return <TableOrder key={order.id} order={order} />;
      })}
    </div>
  );
}
