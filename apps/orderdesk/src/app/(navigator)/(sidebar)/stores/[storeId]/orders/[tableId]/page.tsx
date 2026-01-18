"use client";

import { ErrorBoundary } from "react-error-boundary";
import TableOrderDetail from "../components/table-order-detail/TableOrderDetail";
import ErrorFallback from "@/components/ErrorFallback";
import { Suspense } from "react";

export default function TableOrderDetailPage({
  params,
}: {
  params?: { storeId: string; tableId: string };
}) {
  return (
    <div className="overflow-hidden rounded-md border w-full h-full flex flex-col justify-between shadow-sm">
      <ErrorBoundary
        FallbackComponent={(args) => (
          <ErrorFallback {...args}>
            <ErrorFallbackComponent />
          </ErrorFallback>
        )}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <TableOrderDetail params={params} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ErrorFallbackComponent() {
  return (
    <div className="h-full grid place-items-center">
      <p>해당 테이블의 주문 내역을 찾을 수 없습니다.</p>
    </div>
  );
}
