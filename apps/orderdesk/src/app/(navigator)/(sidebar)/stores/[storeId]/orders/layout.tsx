import { Metadata } from "next";
import { Suspense } from "react";
import TableBoard from "./components/table-board/TableBoard";
import TableBoardLayout from "./components/table-order-list/TableOrderListLayout";
import { Skeleton } from "@spaceorder/ui/components/skeleton";
import { ClientPreventUntilFetch } from "@/components/PreventUntilFetch";

export const metadata: Metadata = {
  title: "Orders",
  description: "orders page",
};

export default function OrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="antialiased h-full grid place-items-center gap-2 grid-cols-[2fr_minmax(380px,1fr)] px-6 pb-4">
      <Suspense fallback={<LoadingSkeleton />}>
        <ClientPreventUntilFetch>
          <div className="flex flex-col h-full">
            <Suspense fallback={<LoadingSkeleton />}>
              <TableBoard />
            </Suspense>
          </div>
          {children}
        </ClientPreventUntilFetch>
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
