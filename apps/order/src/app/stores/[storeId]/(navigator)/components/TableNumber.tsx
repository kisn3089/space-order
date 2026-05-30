"use client";

import useSuspenseWithSession from "@spaceorder/api/hooks/useSuspenseWithSession";
import { StoreContext } from "@spaceorder/db/types/session.type";

export default function TableNumber() {
  const { data: tableNumber } = useSuspenseWithSession<StoreContext, number>(
    "/stores/v1/sessions/me/store-context",
    {
      queryOptions: {
        select: (storeContext) => storeContext.table.tableNumber,
      },
    }
  );

  return (
    <span className="font-semibold flex items-baseline gap-x-2">
      {tableNumber}
      <span className="text-xs text-muted-foreground">테이블</span>
    </span>
  );
}
