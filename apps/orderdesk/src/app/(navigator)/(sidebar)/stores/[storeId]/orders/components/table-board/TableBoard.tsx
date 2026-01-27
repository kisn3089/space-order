"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import { SummarizedOrdersFromStore } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";

export default function TableBoard() {
  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<SummarizedOrdersFromStore>(
    `/stores/order-summary`,
    { onSuccess: setCache }
  );

  const tableCount = store.tables.length ?? 0;
  return (
    <TableBoardLayout count={tableCount}>
      {store.tables.map((sanitizedTable) => {
        return (
          <TableOrderList
            key={sanitizedTable.publicId}
            sanitizedTable={sanitizedTable}
          />
        );
      })}
    </TableBoardLayout>
  );
}
