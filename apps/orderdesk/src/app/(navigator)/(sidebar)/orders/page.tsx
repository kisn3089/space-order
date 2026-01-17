"use client";

import React, { Suspense } from "react";
// import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrderList from "./components/table-order-list/TableOrderList";
import { Skeleton } from "@spaceorder/ui/components/skeleton";
import TableBoardLayout from "./components/table-order-list/TableOrderListLayout";
// import { ErrorBoundary } from "react-error-boundary";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      {/* <ErrorBoundary fallback={<div>Something went wrong loading orders.</div>}> */}
      <Suspense
        fallback={
          <TableBoardLayout count={8}>
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} />
            ))}
          </TableBoardLayout>
        }
      >
        <TableOrderList />
      </Suspense>
      {/* </ErrorBoundary> */}
      {/* <TableOrderDetail /> */}
      <div className="p-2"></div>
    </div>
  );
}
