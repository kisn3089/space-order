"use client";

import TableBoard from "../table-board/TableBoard";
import { ResponseStoreWithTables } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";
import TableBoardLayout from "./TableOrderListLayout";

export default function TableOrderList() {
  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<ResponseStoreWithTables>(
    `/stores/alive-orders`,
    {
      onSuccess: setCache,
    }
  );

  const tableCount = store.tableCount ?? 0;
  return (
    <TableBoardLayout count={tableCount}>
      {store.tables.map((table) => {
        return (
          <TableBoard
            key={table.publicId}
            storeId={store.publicId}
            tableId={table.publicId}
          />
        );
      })}
    </TableBoardLayout>
  );
}
