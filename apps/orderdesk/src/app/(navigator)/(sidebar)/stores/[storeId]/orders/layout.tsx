import type { Metadata } from "next";
import { Suspense } from "react";
import TableBoard from "./components/table-board/TableBoard";
import TableBoardLayout from "./components/table-order-list/TableOrderListLayout";
import { Skeleton } from "@spaceorder/ui/components/skeleton";
import AwaitOrdersSummary from "./components/AwaitOrdersSummary";

export const metadata: Metadata = {
  title: "주문 관리",
  description: "주문 목록을 확인하고 관리하세요.",
};

export default function OrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="antialiased h-full grid place-items-center gap-2 grid-cols-[2fr_minmax(380px,1fr)] px-6 pb-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <AwaitOrdersSummary>
          <div className="flex flex-col h-full w-full">
            <Suspense fallback={<LoadingSkeleton />}>
              <TableBoard />
            </Suspense>
          </div>
          {children}
        </AwaitOrdersSummary>
      </Suspense>
    </section>
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
