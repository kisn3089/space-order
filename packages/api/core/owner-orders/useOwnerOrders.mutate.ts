import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOwnerOrderPayload,
  FetchOrderParams,
  FetchOrderUniqueParams,
  httpOrders,
  UpdateOwnerOrderPayload,
} from "./httpOwnerOrders";
import {
  SESSION_QUERY_FILTER_CONST,
  SESSION_QUERY_INCLUDE_CONST,
} from "@spaceorder/db";

const { ALIVE_SESSION } = SESSION_QUERY_FILTER_CONST;
const { ORDER_ITEMS } = SESSION_QUERY_INCLUDE_CONST;

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
          `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/owner/stores/${storeId}/tables/${tableId}/orders/${orderId}`,
        ],
      });
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
