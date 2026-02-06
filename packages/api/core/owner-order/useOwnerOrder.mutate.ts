import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOwnerOrderPayload,
  CreateOwnerOrderParams,
  httpOrder,
  UpdateOwnerOrderPayload,
  UpdateOwnerOrderParams,
} from "./httpOwnerOrder";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db";

type CreateOwnerOrder = {
  params: CreateOwnerOrderParams;
  createOrderPayload: CreateOwnerOrderPayload;
};
export type UpdateOwnerOrder = {
  params: UpdateOwnerOrderParams;
  updateOrderPayload: UpdateOwnerOrderPayload;
};

export default function useOwnerOrder() {
  const queryClient = useQueryClient();

  const createOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: ({ params, createOrderPayload }: CreateOwnerOrder) =>
      httpOrder.createOwnerOrder(params, createOrderPayload),
  });

  const updateOwnerOrder = useMutation({
    mutationKey: ["owner", "order", "update"],
    mutationFn: ({ params, updateOrderPayload }: UpdateOwnerOrder) =>
      httpOrder.updateOwnerOrder(params, updateOrderPayload),
    onSuccess: () => {
      const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);
      queryClient.invalidateQueries({
        queryKey: [`/owner/v1/stores/${lastAccessedStoreId}/orders/board`],
      });
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
