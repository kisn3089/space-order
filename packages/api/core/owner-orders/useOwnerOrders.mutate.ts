import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOwnerOrderPayload,
  FetchOrderParams,
  FetchOrderUniqueParams,
  httpOrders,
  UpdateOwnerOrderPayload,
} from "./httpOwnerOrders";

type CreateOwnerOrderParams = {
  params: FetchOrderParams;
  createOrderData: CreateOwnerOrderPayload;
};
type UpdateOwnerOrderParams = {
  params: FetchOrderUniqueParams;
  updateOrderPayload: UpdateOwnerOrderPayload;
};
export default function useOwnerOrders() {
  const queryClient = useQueryClient();

  const createOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: ({ params, createOrderData }: CreateOwnerOrderParams) =>
      httpOrders.createOwnerOrder(params, createOrderData),
  });

  const updateOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "update"],
    mutationFn: ({ params, updateOrderPayload }: UpdateOwnerOrderParams) =>
      httpOrders.updateOwnerOrder(params, updateOrderPayload),
    onSuccess: (_, variables) => {
      const { storeId, tableId, orderId } = variables.params;
      queryClient.invalidateQueries({
        queryKey: [
          `/owner/stores/${storeId}/tables/${tableId}/orders/${orderId}`,
        ],
      });
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
