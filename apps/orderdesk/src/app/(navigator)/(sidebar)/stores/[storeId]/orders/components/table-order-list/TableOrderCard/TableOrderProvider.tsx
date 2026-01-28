"use client";

import { useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SummarizedTableWithSessions } from "@spaceorder/db";
import { nextStatusMap, OrderStatus } from "@spaceorder/db";
import useOwnerOrder from "@spaceorder/api/core/owner-order/useOwnerOrder.mutate";
import {
  TableOrderContext,
  type TableOrderContextValue,
} from "./TableOrderContext";

interface TableOrderProviderProps {
  table: SummarizedTableWithSessions;
  children: React.ReactNode;
}

export function TableOrderProvider({
  table,
  children,
}: TableOrderProviderProps) {
  const params = useParams<{ storeId: string; tableId: string }>();
  const { push } = useRouter();
  const { updateOwnerOrder } = useOwnerOrder();

  const session = table.tableSessions?.[0] ?? null;
  const isActivatedTable = table.isActive === true;
  const isSelected = params.tableId === table.publicId;

  const navigateToTable = useCallback(() => {
    if (isActivatedTable) {
      push(`/stores/${params.storeId}/orders/${table.publicId}`);
    }
  }, [isActivatedTable, push, params.storeId, table.publicId]);

  const updateOrderStatus = useCallback(
    async (orderId: string, currentStatus: OrderStatus) => {
      const nextStatus = nextStatusMap[currentStatus];
      if (!nextStatus) {
        return;
      }

      await updateOwnerOrder.mutateAsync({
        params: {
          storeId: params.storeId,
          tableId: table.publicId,
          orderId,
        },
        updateOrderPayload: { status: nextStatus },
      });
    },
    [updateOwnerOrder, params.storeId, table.publicId]
  );

  const contextValue = useMemo<TableOrderContextValue>(
    () => ({
      state: {
        table,
        session,
        isActivatedTable,
        isSelected,
      },
      actions: {
        navigateToTable,
        updateOrderStatus,
      },
      meta: {
        storeId: params.storeId,
        tableId: table.publicId,
      },
    }),
    [
      table,
      session,
      isActivatedTable,
      isSelected,
      navigateToTable,
      updateOrderStatus,
      params.storeId,
    ]
  );

  return (
    <TableOrderContext.Provider value={contextValue}>
      {children}
    </TableOrderContext.Provider>
  );
}
