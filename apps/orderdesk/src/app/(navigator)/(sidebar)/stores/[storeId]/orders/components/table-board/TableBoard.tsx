"use client";

import TableOrderList from "../table-order-list/TableOrderList";
import { SummarizedOrdersByStore } from "@spaceorder/db";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import TableBoardLayout from "../table-order-list/TableOrderListLayout";
import { useSetCacheByStoreBoard } from "../../hooks/useSetCacheByStoreBoard";
import { GlobalTimerProvider } from "@/app/common/orders/GlobalTimerContext";
import { useParams } from "next/dist/client/components/navigation";

export default function TableBoard() {
  const params = useParams<{ storeId: string }>();
  const { setCache } = useSetCacheByStoreBoard();

  const { data: tables } = useSuspenseWithAuth<SummarizedOrdersByStore>(
    `/orders/v1/stores/${params.storeId}/orders/summary`,
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
