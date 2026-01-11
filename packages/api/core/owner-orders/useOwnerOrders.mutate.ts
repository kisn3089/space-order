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
    onSuccess: (data, variables) => {
      const { storeId, tableId } = variables.params;
      queryClient.invalidateQueries({
        queryKey: [
          "owner",
          "orders",
          {
            storeId,
            tableId,
          },
        ],
      });
      console.log("주문 업데이트 성공: ", data);
      console.log("업데이트: ", variables);
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
