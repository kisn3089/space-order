"use client";

import { useState } from "react";
import { sumFromObjects } from "@spaceorder/api";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import useOrderItem from "@spaceorder/api/core/order-item/useOrderItem.mutate";
import {
  OrderDetailContext,
  type OrderDetailContextValue,
} from "./OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "./OrderDetailTable";
import { PublicTableWithSessions } from "@spaceorder/db/types";

interface OrderDetailProviderProps {
  params: { storeId: string; tableId: string };
  children: React.ReactNode;
}

export function OrderDetailProvider({
  params,
  children,
}: OrderDetailProviderProps) {
  const { storeId, tableId } = params;
  const fetchUrl = `/owner/v1/stores/${storeId}/tables/${tableId}/sessions/alive/orders`;

  const { data: tableWithSessions, isRefetching } =
    useSuspenseWithAuth<PublicTableWithSessions>(fetchUrl);

  const { updateOrderItem, removeOrderItem } = useOrderItem({
    storeId,
    tableId,
  });

  const [editingItem, setEditingItem] =
    useState<OrderItemWithSummarizedOrder | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // 주문 아이템 데이터 가공
  const { tableSessions } = tableWithSessions;
  const tableSession = tableSessions ? tableSessions[0] : null;
  const orders = tableSession?.orders ?? [];

  const orderItems: OrderItemWithSummarizedOrder[] = orders.flatMap((order) =>
    order.orderItems.map((item) => ({
      ...item,
      totalPrice: item.unitPrice * item.quantity,
      orderId: order.publicId,
      orderStatus: order.status,
    }))
  );

  const isEditingFinalizedOrder =
    editingItem?.orderStatus === "COMPLETED" ||
    editingItem?.orderStatus === "CANCELLED";
  const totalPrice = sumFromObjects(orderItems, (item) => item.totalPrice);

  // Actions
  const updateEditingQuantity = (delta: number) => {
    setEditingItem((prev) =>
      prev ? { ...prev, quantity: Math.max(1, prev.quantity + delta) } : null
    );
  };

  const resetSelection = () => {
    setRowSelection({});
    setEditingItem(null);
  };

  const handleUpdateOrderItem = async () => {
    if (!editingItem) return;

    await updateOrderItem.mutateAsync({
      params: {
        orderId: editingItem.orderId,
        orderItemId: editingItem.publicId,
      },
      updateOrderItemPayload: { quantity: editingItem.quantity },
    });
    resetSelection();
  };

  const handleRemoveOrderItem = async () => {
    if (!editingItem) return;

    await removeOrderItem.mutateAsync({
      params: {
        orderId: editingItem.orderId,
        orderItemId: editingItem.publicId,
      },
    });
    resetSelection();
  };

  const contextValue: OrderDetailContextValue = {
    state: {
      tableWithSessions,
      orderItems,
      totalPrice,
      editingItem,
      isEditingFinalizedOrder,
      rowSelection,
    },
    actions: {
      setEditingItem,
      setRowSelection,
      updateEditingQuantity,
      resetSelection,
      updateOrderItem: handleUpdateOrderItem,
      removeOrderItem: handleRemoveOrderItem,
    },
    meta: {
      storeId,
      tableId,
      isRefetching,
    },
  };

  return (
    <OrderDetailContext.Provider value={contextValue}>
      {children}
    </OrderDetailContext.Provider>
  );
}
