"use client";

import React from "react";
import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrders from "./components/table-orders/TableOrders";
import TableOrderProvider from "./store/useTableOrderContext";

export default function OrdersPage() {
  return (
    <TableOrderProvider>
      <TableOrders />
      <TableOrderDetail />
    </TableOrderProvider>
  );
}
