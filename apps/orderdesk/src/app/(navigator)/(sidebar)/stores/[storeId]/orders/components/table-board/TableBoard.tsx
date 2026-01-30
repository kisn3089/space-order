"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import { SummarizedOrdersFromStore } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";
import { GlobalTimerProvider } from "@/app/common/orders/GlobalTimerContext";

export default function TableBoard() {
  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<SummarizedOrdersFromStore>(
    `/stores/order-summary`,
    { onSuccess: setCache }
  );

  const tableCount = store.tables.length ?? 0;
  return (
    <GlobalTimerProvider>
      <TableBoardLayout count={tableCount}>
        {store.tables.map((sanitizedTable) => (
          <TableOrderList
            key={sanitizedTable.publicId}
            sanitizedTable={sanitizedTable}
          />
        ))}
      </TableBoardLayout>
    </GlobalTimerProvider>
  );
}
