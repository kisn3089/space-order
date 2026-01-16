"use client";

import TableBoard from "../table-board/TableBoard";
import { ResponseStoreWithTables } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { useSetCacheFromStoreWithOrders } from "../../hooks/useSetCacheFromStoreWithOrders";

export default function TableOrderList() {
  const setCache = useSetCacheFromStoreWithOrders();
  const { data: store } = useSuspenseWithAuth<ResponseStoreWithTables>(
    `/stores/alive-orders`,
    {
      onSuccess: setCache,
    }
  );

  const tableCount = store.tableCount ?? 0;
  const tableBoardMaxHeight =
    tableCount < 3 ? "grid-rows-[max(50%)]" : "auto-rows-fr";

  return (
    <div
      className={`w-full h-full grid grid-cols-[minmax(200px,_300px)_minmax(200px,_300px)] ${tableBoardMaxHeight} gap-3 min-w-[410px]`}
    >
      {store.tables.map((table) => {
        return (
          <TableBoard
            key={table.publicId}
            storeId={store.publicId}
            tableId={table.publicId}
          />
        );
      })}
    </div>
  );
}
