"use client";

import { useParams } from "next/navigation";
import { OrderItemWithSummarizedOrder } from "../components/table-order-detail/order-detail/OrderDetailTable";
import useOrderItem from "@spaceorder/api/core/order/order-item/useOrderItem.mutate";

export default function useOrderItemTable() {
  const { storeId, tableId } = useParams<{
    storeId: string;
    tableId: string;
  }>();

  const { updateOrderItem, removeOrderItem } = useOrderItem({
    storeId,
    tableId,
  });

  const update = async (orderItem: OrderItemWithSummarizedOrder | null) => {
    if (!orderItem) return;

    return await updateOrderItem.mutateAsync({
      orderItemId: orderItem.publicId,
      updateOrderItemPayload: { quantity: orderItem.quantity },
    });
  };

  const removeById = async (orderItem: OrderItemWithSummarizedOrder | null) => {
    if (!orderItem) return;

    return await removeOrderItem.mutateAsync({
      orderItemId: orderItem.publicId,
    });
  };

  return { update, removeById };
}
