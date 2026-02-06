"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import {
  LAST_ACCESSED_STORE_ID,
  SummarizedOrdersByStore,
} from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";
import { useSetCacheByStoreBoard } from "../../hooks/useSetCacheByStoreBoard";
import { GlobalTimerProvider } from "@/app/common/orders/GlobalTimerContext";
import { useEffect } from "react";
import { useRouter } from "next/dist/client/components/navigation";

export default function TableBoard() {
  const router = useRouter();
  const { setCache } = useSetCacheByStoreBoard();
  const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);

  useEffect(() => {
    if (!lastAccessedStoreId) {
      router.replace("/stores");
    }
  }, [lastAccessedStoreId, router]);

  const { data: tables } = useSuspenseWithAuth<SummarizedOrdersByStore>(
    `/owner/v1/stores/${lastAccessedStoreId}/orders/board`,
    { onSuccess: setCache }
  );

  const tableCount = tables.length ?? 0;
  return (
    <GlobalTimerProvider>
      <TableBoardLayout count={tableCount}>
        {tables.map((sanitizedTable) => (
          <TableOrderList
            key={sanitizedTable.publicId}
            sanitizedTable={sanitizedTable}
          />
        ))}
      </TableBoardLayout>
    </GlobalTimerProvider>
  );
}
