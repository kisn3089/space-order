import type { Metadata } from "next";
import TableBoard from "./components/table-board/TableBoard";
import AwaitOrdersSummary from "./components/AwaitOrdersSummary";
import GridLayout from "./components/GridLayout";
import OrderSyncDaemon from "./components/OrderSyncDaemon";

export const metadata: Metadata = {
  title: "주문 관리",
  description: "주문 목록을 확인하고 관리하세요.",
};

export default function OrdersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <GridLayout>
      <AwaitOrdersSummary>
        <OrderSyncDaemon />
        <div className="flex flex-col h-full w-full">
          <TableBoard />
        </div>
        {children}
      </AwaitOrdersSummary>
    </GridLayout>
  );
}
