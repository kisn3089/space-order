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
  const isActive = table.isActive === true;
  const isSelected = params.tableId === table.publicId;

  const navigateToTable = useCallback(() => {
    if (isActive) {
      push(`/stores/${params.storeId}/orders/${table.publicId}`);
    }
  }, [isActive, push, params.storeId, table.publicId]);

  const updateOrderStatus = useCallback(
    async (orderId: string, currentStatus: OrderStatus) => {
      const nextStatus = nextStatusMap[currentStatus];
      if (!nextStatus) {
        console.log("더 이상 전이할 상태가 없습니다.");
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
        isActive,
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
      isActive,
      isSelected,
      navigateToTable,
      updateOrderStatus,
      params.storeId,
    ]
  );

  return (
    <TableOrderContext value={contextValue}>{children}</TableOrderContext>
  );
}
