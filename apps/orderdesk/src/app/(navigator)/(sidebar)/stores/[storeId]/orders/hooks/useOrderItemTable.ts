"use client";

import useOrderItem from "@spaceorder/api/core/order-item/useOrderItem.mutate";
import { useParams } from "next/navigation";
import { ResponseOrderItemWithOrderId } from "../components/table-order-detail/order-table/OrderTable";

export default function useOrderItemTable() {
  const { storeId, tableId } = useParams<{
    storeId: string;
    tableId: string;
  }>();

  const { updateOrderItem, removeOrderItem } = useOrderItem({
    storeId,
    tableId,
  });

  const update = async (orderItem: ResponseOrderItemWithOrderId | null) => {
    if (!orderItem) return;

    return await updateOrderItem.mutateAsync({
      params: {
        orderId: orderItem.orderId,
        orderItemId: orderItem.publicId,
      },
      updateOrderItemPayload: { quantity: orderItem.quantity },
    });
  };

  const removeById = async (orderItem: ResponseOrderItemWithOrderId | null) => {
    if (!orderItem) return;

    return await removeOrderItem.mutateAsync({
      params: {
        orderId: orderItem.orderId,
        orderItemId: orderItem.publicId,
      },
    });
  };

  return { update, removeById };
}
