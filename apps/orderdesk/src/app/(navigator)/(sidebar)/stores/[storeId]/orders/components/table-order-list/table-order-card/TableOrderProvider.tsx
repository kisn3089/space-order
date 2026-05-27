"use client";

import { useParams } from "next/navigation";
import type { SummarizedTableWithSessions } from "@spaceorder/db";
import { nextStatusMap, OrderStatus } from "@spaceorder/db";
import {
  TableOrderContext,
  type TableOrderContextValue,
} from "./TableOrderContext";
import useOrderByTable from "@spaceorder/api/core/order/order/useOrderByTable.mutate";

interface TableOrderProviderProps {
  summarizedTable: SummarizedTableWithSessions;
  children: React.ReactNode;
}

export function TableOrderProvider({
  summarizedTable,
  children,
}: TableOrderProviderProps) {
  const params = useParams<{ storeId: string; tableId: string }>();

  const { updateOrderByTable } = useOrderByTable({
    storeId: params.storeId,
    tableId: params.tableId,
  });

  const session = summarizedTable.tableSessions?.[0] ?? null;
  const isActivatedTable = summarizedTable.isActive === true;
  const isSelected = params.tableId === summarizedTable.publicId;

  const updateOrderStatus = async (
    orderId: string,
    currentStatus: OrderStatus
  ) => {
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) {
      return;
    }

    await updateOrderByTable.mutateAsync({
      orderId,
      updateOrderPayload: { status: nextStatus },
    });
  };

  const contextValue: TableOrderContextValue = {
    state: {
      summarizedTable,
      session,
      isActivatedTable,
      isSelected,
    },
    actions: { updateOrderStatus },
    meta: { tableId: summarizedTable.publicId },
  };

  return (
    <TableOrderContext.Provider value={contextValue}>
      {children}
    </TableOrderContext.Provider>
  );
}
