import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOrderByTablePayload,
  httpOrder,
  UpdateOrderByTablePayload,
} from "./httpOrder";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db";

type CreateOrderByTable = {
  tableId: string;
  createOrderPayload: CreateOrderByTablePayload;
};
export type UpdateOrderByTable = {
  orderId: string;
  updateOrderPayload: UpdateOrderByTablePayload;
};

export default function useOrderByTable() {
  const queryClient = useQueryClient();

  const createOrderByTable = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: ({ tableId, createOrderPayload }: CreateOrderByTable) =>
      httpOrder.createOrderByTable(tableId, createOrderPayload),
  });

  const updateOrderByTable = useMutation({
    mutationKey: ["owner", "order", "update"],
    mutationFn: ({ orderId, updateOrderPayload }: UpdateOrderByTable) =>
      httpOrder.updateOrderByTable(orderId, updateOrderPayload),
    onSuccess: () => {
      const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${lastAccessedStoreId}/orders/summary`],
      });
    },
  });

  return { createOrderByTable, updateOrderByTable };
}
