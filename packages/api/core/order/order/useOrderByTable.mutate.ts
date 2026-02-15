import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOrderByTablePayload,
  httpOrder,
  UpdateOrderByTablePayload,
} from "./httpOrder";

type CreateOrderByTable = {
  tableId: string;
  createOrderPayload: CreateOrderByTablePayload;
};
export type UpdateOrderByTable = {
  orderId: string;
  updateOrderPayload: UpdateOrderByTablePayload;
};

export default function useOrderByTable(storeId: string, tableId?: string) {
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
    onSuccess: (data) => {
      if (
        (tableId && data.status === "COMPLETED") ||
        data.status === "CANCELLED"
      ) {
        queryClient.invalidateQueries({
          queryKey: [`/orders/v1/tables/${tableId}/active-session/orders`],
        });
      }

      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${storeId}/orders/summary`],
      });
    },
  });

  return { createOrderByTable, updateOrderByTable };
}
