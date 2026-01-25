import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOwnerOrderPayload,
  FetchOrderParams,
  FetchOrderUniqueParams,
  httpOrder,
  UpdateOwnerOrderPayload,
} from "./httpOwnerOrder";

type CreateOwnerOrderParams = {
  params: FetchOrderParams;
  createOrderData: CreateOwnerOrderPayload;
};
export type UpdateOwnerOrderParams = {
  params: FetchOrderUniqueParams;
  updateOrderPayload: UpdateOwnerOrderPayload;
};

export default function useOwnerOrder() {
  const queryClient = useQueryClient();

  const createOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: ({ params, createOrderData }: CreateOwnerOrderParams) =>
      httpOrder.createOwnerOrder(params, createOrderData),
  });

  const updateOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "update"],
    mutationFn: ({ params, updateOrderPayload }: UpdateOwnerOrderParams) =>
      httpOrder.updateOwnerOrder(params, updateOrderPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/stores/order-summary`],
      });
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
