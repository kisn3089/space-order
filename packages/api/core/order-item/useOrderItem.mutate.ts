import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import {
  FetchOrderItemUnique,
  httpOrderItems,
  UpdateOrderItemPayload,
} from "./httpOrderItem";
import {
  ALIVE_SESSION,
  ORDER_ITEMS,
} from "@spaceorder/db/constants/model-query-key/sessionQueryKey.const";
import { ResponseOrderItem } from "@spaceorder/db/types/responseModel.type";

type UseOrderItemParams = { storeId: string; tableId: string };
type UseOrderItemReturn = {
  updateOrderItem: UseMutationResult<
    ResponseOrderItem,
    Error,
    {
      params: FetchOrderItemUnique;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }
  >;
  removeOrderItem: UseMutationResult<
    void,
    Error,
    { params: FetchOrderItemUnique }
  >;
};
export default function useOrderItem({
  storeId,
  tableId,
}: UseOrderItemParams): UseOrderItemReturn {
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
