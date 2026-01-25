import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FetchOrderItemUnique,
  httpOrderItems,
  UpdateOrderItemPayload,
} from "./httpOrderItem";
import {
  ALIVE_SESSION,
  ORDER_ITEMS,
} from "@spaceorder/db/constants/model-query-key/sessionQueryKey.const";

type UseOrderItemParams = { storeId: string; tableId: string };
export default function useOrderItem({ storeId, tableId }: UseOrderItemParams) {
  const queryClient = useQueryClient();

  const updateOrderItem = useMutation({
    mutationKey: ["order-item", "update"],
    mutationFn: ({
      params,
      updateOrderItemPayload,
    }: {
      params: FetchOrderItemUnique;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }) => httpOrderItems.updateOrderItem(params, updateOrderItemPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/stores/order-summary`],
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
        ],
      });
    },
  });

  const removeOrderItem = useMutation({
    mutationKey: ["order-item", "remove"],
    mutationFn: ({ params }: { params: FetchOrderItemUnique }) =>
      httpOrderItems.removeOrderItem(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/stores/order-summary`],
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`,
        ],
      });
    },
  });

  return { updateOrderItem, removeOrderItem };
}
