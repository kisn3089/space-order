import { Metadata } from "next";
import { Suspense } from "react";
import TableBoard from "./components/table-board/TableOrderBoard";
import TableBoardLayout from "./components/table-order-list/TableOrderListLayout";
import { Skeleton } from "@spaceorder/ui/components/skeleton";

export const metadata: Metadata = {
  title: "Orders",
  description: "orders page",
};

export default function OrdersLayout({
  children,
  params,
}: Readonly<{
  params: { storeId: string };
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased h-full grid place-items-center gap-2 grid-cols-[2fr_minmax(380px,1fr)] px-6">
      <div className="flex flex-col h-full">
        <Suspense fallback={<LoadingSkeleton />}>
          <TableBoard storeId={params.storeId} />
        </Suspense>
      </div>
      {children}
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
