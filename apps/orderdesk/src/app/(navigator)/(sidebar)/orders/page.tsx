"use client";

import React from "react";
// import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrderList from "./components/table-orders/TableOrderList";
import TableOrderProvider from "./store/useTableOrderContext";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      <TableOrderProvider>
        <TableOrderList />
        {/* <TableOrderDetail /> */}
      </TableOrderProvider>
      <div className="p-2"></div>
    </div>
  );
}
