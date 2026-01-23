"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import { SummarizedOrdersFromStore } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";

export default function TableBoard({ storeId }: { storeId: string }) {
  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<SummarizedOrdersFromStore>(
    `/stores/order-summary`,
    { onSuccess: setCache }
  );

  const tableCount = store.tableCount ?? 0;
  return (
    <TableBoardLayout count={tableCount}>
      {store.tables.map((table) => {
        return (
          <TableOrderList
            key={table.publicId}
            storeId={storeId}
            tableId={table.publicId}
          />
        );
      })}
    </TableBoardLayout>
  );
}
