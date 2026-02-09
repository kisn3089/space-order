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
  table: SummarizedTableWithSessions;
  children: React.ReactNode;
}

export function TableOrderProvider({
  table,
  children,
}: TableOrderProviderProps) {
  const params = useParams<{ storeId: string; tableId: string }>();
  const { updateOrderByTable } = useOrderByTable(params.storeId);

  const session = table.tableSessions?.[0] ?? null;
  const isActivatedTable = table.isActive === true;
  const isSelected = params.tableId === table.publicId;

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
      table,
      session,
      isActivatedTable,
      isSelected,
    },
    actions: { updateOrderStatus },
    meta: { tableId: table.publicId },
  };

  return (
    <TableOrderContext.Provider value={contextValue}>
      {children}
    </TableOrderContext.Provider>
  );
}
