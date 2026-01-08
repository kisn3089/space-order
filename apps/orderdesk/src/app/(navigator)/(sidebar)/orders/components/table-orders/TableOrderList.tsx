"use client";

import { meQuery } from "@spaceorder/api";
import TableBoard from "../table-board/TableBoard";

export default function TableOrderList() {
  const { data: stores, isSuccess } = meQuery.fetchMyOrderListAllinclusive({});

  if (!isSuccess) {
    return <div></div>;
  }

  const tableCount = stores.tables?.length ?? 0;
  const tableBoardMaxHeight =
    tableCount < 3 ? "grid-rows-[max(50%)]" : "auto-rows-fr";

  return (
    <div
      className={`w-full h-full grid grid-cols-[minmax(200px,_300px)_minmax(200px,_300px)] ${tableBoardMaxHeight} gap-3 min-w-[410px]`}
    >
      {stores.tables?.map((table) => {
        return <TableBoard key={table.publicId} table={table} />;
      })}
    </div>
  );
}
