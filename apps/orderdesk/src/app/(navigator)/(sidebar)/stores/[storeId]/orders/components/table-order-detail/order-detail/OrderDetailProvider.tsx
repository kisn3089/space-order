"use client";

import { useState } from "react";
import { sumFromObjects } from "@spaceorder/api";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import {
  OrderDetailContext,
  type OrderDetailContextValue,
} from "./OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "./OrderDetailTable";
import { PublicOrderWithItem } from "@spaceorder/db/types";
import useOrderItem from "@spaceorder/api/core/order/order-item/useOrderItem.mutate";

interface OrderDetailProviderProps {
  params: { storeId: string; tableId: string };
  children: React.ReactNode;
}

export function OrderDetailProvider({
  params,
  children,
}: OrderDetailProviderProps) {
  const { storeId, tableId } = params;
  const fetchUrl = `/orders/v1/tables/${tableId}/active-session/orders`;

  const { data: orders, isRefetching } = useSuspenseWithAuth<
    PublicOrderWithItem[]
  >(fetchUrl, {
    queryOptions: { refetchOnMount: true, queryKey: [fetchUrl] },
  });

  const { updateOrderItem, removeOrderItem } = useOrderItem({
    storeId,
    tableId,
  });

  const [editingItem, setEditingItem] =
    useState<OrderItemWithSummarizedOrder | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const orderItems: OrderItemWithSummarizedOrder[] = orders.flatMap((order) =>
    order.orderItems.map((item) => ({
      ...item,
      totalPrice: item.unitPrice * item.quantity,
      orderId: order.publicId,
      orderStatus: order.status,
    }))
  );

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
      orderItemId: editingItem.publicId,
      updateOrderItemPayload: { quantity: editingItem.quantity },
    });
    resetSelection();
  };

  const handleRemoveOrderItem = async () => {
    if (!editingItem) return;

    await removeOrderItem.mutateAsync({
      orderItemId: editingItem.publicId,
    });
    resetSelection();
  };

  const contextValue: OrderDetailContextValue = {
    state: {
      orders,
      orderItems,
      totalPrice,
      editingItem,
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
