import React from "react";
import EmptyOrderDetail from "./components/table-order-detail/EmptyOrderDetail";

export default function OrdersPage() {
  return (
    <div className="overflow-hidden rounded-md border w-full h-full flex flex-col justify-between shadow-sm">
      <EmptyOrderDetail />
    </div>
  );
}
