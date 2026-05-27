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
import { toast } from "@spaceorder/ui/components/sonner";

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
    queryOptions: { refetchOnMount: true },
  });

  const { update, remove } = useOrderItem({ storeId, tableId });

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

  const updateOrderItem = async () => {
    if (!editingItem) return;

    try {
      await update.mutateAsync({
        orderItemId: editingItem.publicId,
        updateOrderItemPayload: { quantity: editingItem.quantity },
      });
      toast.success(
        `${editingItem.menuName} 수량을 ${editingItem.quantity}개로 변경했습니다.`
      );
      resetSelection();
    } catch {
      toast.error(`${editingItem.menuName} 수량을 변경하는데 실패했습니다.`);
    }
  };

  const removeOrderItem = async () => {
    if (!editingItem) return;
    try {
      await remove.mutateAsync({ orderItemId: editingItem.publicId });
      toast.success(`${editingItem.menuName} 메뉴를 주문에서 제외했습니다.`);
      resetSelection();
    } catch {
      toast.error(
        `${editingItem.menuName} 메뉴를 주문에서 제외하는데 실패했습니다.`
      );
    }
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
      updateOrderItem,
      removeOrderItem,
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
