import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOrderByTablePayload,
  httpOrder,
  UpdateOrderByTablePayload,
} from "./httpOrder";
import { pathToQueryKey } from "../../../utils/pathToQueryKey";
import { PublicOrderWithItem } from "@spaceorder/db";

type CreateOrderByTable = {
  tableId: string;
  createOrderPayload: CreateOrderByTablePayload;
};
export type UpdateOrderByTable = {
  orderId: string;
  updateOrderPayload: UpdateOrderByTablePayload;
};

type Params = { storeId?: string; tableId?: string };

export default function useOrderByTable({ storeId, tableId }: Params = {}) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (storeId) {
      queryClient.invalidateQueries({
        queryKey: pathToQueryKey(`/orders/v1/stores/${storeId}/orders/summary`),
      });
    }
    if (tableId) {
      queryClient.invalidateQueries({
        queryKey: pathToQueryKey(
          `/orders/v1/tables/${tableId}/active-session/orders`
        ),
      });
    }
  };

  const createOrderByTable = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: ({ tableId, createOrderPayload }: CreateOrderByTable) =>
      httpOrder.createOrderByTable(tableId, createOrderPayload),
    onSuccess: invalidate,
  });

  const updateOrderByTable = useMutation({
    mutationKey: ["owner", "order", "update"],
    mutationFn: ({ orderId, updateOrderPayload }: UpdateOrderByTable) =>
      httpOrder.updateOrderByTable(orderId, updateOrderPayload),
    onSuccess: (serverOrder) => {
      if (tableId) {
        queryClient.setQueryData<PublicOrderWithItem[]>(
          pathToQueryKey(`/orders/v1/tables/${tableId}/active-session/orders`),
          (old) =>
            old?.map((o) =>
              o.publicId === serverOrder.publicId ? serverOrder : o
            )
        );
      }
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: pathToQueryKey(
            `/orders/v1/stores/${storeId}/orders/summary`
          ),
        });
      }
    },
  });

  return { createOrderByTable, updateOrderByTable };
}
