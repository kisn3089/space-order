import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateOwnerOrderPayload,
  FetchOrderParams,
  FetchOrderUniqueParams,
  httpOrder,
  UpdateOwnerOrderPayload,
} from "./httpOwnerOrder";
import {
  SESSION_QUERY_FILTER_KEYS,
  SESSION_QUERY_INCLUDE_KEYS,
} from "@spaceorder/db";

const { ALIVE_SESSION } = SESSION_QUERY_FILTER_KEYS;
const { ORDER_ITEMS } = SESSION_QUERY_INCLUDE_KEYS;

type CreateOwnerOrderParams = {
  params: FetchOrderParams;
  createOrderData: CreateOwnerOrderPayload;
};
type UpdateOwnerOrderParams = {
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
    onError: (error) => {
      alert("이미 완료되었거나 취소된 주문은 수정할 수 없습니다.");
    },
  });

  return { createOwnerOrder, updateOwnerOrder };
}
