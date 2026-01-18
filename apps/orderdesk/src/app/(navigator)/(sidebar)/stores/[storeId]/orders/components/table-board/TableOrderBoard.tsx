"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import { ResponseStoreWithTables } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";

export default function TableBoard({ storeId }: { storeId: string }) {
  console.log("board", storeId);

  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<ResponseStoreWithTables>(
    `/stores/alive-orders`,
    { onSuccess: setCache }
  );

  const tableCount = store.tableCount ?? 0;
  return (
    <TableBoardLayout count={tableCount}>
      {store.tables.map((table) => {
        return (
          <TableOrderList
            key={table.publicId}
            storeId={store.publicId}
            tableId={table.publicId}
          />
        );
      })}
    </TableBoardLayout>
  );
}
