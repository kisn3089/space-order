"use client";

import React, { Suspense } from "react";
// import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrderList from "./components/table-order-list/TableOrderList";
import { Skeleton } from "@spaceorder/ui/components/skeleton";
import TableBoardLayout from "./components/table-order-list/TableOrderListLayout";

export default function OrdersPage() {
  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<LoadingSkeleton />}>
        <TableOrderList />
      </Suspense>
      {/* <TableOrderDetail /> */}
      <div className="p-2"></div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <TableBoardLayout count={8}>
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton key={index} />
      ))}
    </TableBoardLayout>
  );
}
