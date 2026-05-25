import type { Metadata } from "next";
import TableBoard from "./components/table-board/TableBoard";
import AwaitOrdersSummary from "./components/AwaitOrdersSummary";
import GridLayout from "./components/GridLayout";
import OrderRealtimeDaemon from "./components/OrderRealtimeDeamon";

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
        <OrderRealtimeDaemon>
          <div className="flex flex-col h-full w-full">
            <TableBoard />
          </div>
          {children}
        </OrderRealtimeDaemon>
      </AwaitOrdersSummary>
    </GridLayout>
  );
}
