"use client";

import React, { Suspense } from "react";
// import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrderList from "./components/table-order-list/TableOrderList";
// import { ErrorBoundary } from "react-error-boundary";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      {/* <ErrorBoundary fallback={<div>Something went wrong loading orders.</div>}> */}
      <Suspense fallback={<div>Loading orders...</div>}>
        <TableOrderList />
      </Suspense>
      {/* </ErrorBoundary> */}
      {/* <TableOrderDetail /> */}
      <div className="p-2"></div>
    </div>
  );
}
