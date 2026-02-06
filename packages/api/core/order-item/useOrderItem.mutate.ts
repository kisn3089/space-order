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
import { PublicOrderItem } from "@spaceorder/db/types/publicModel.type";

type UseOrderItemParams = { storeId: string; tableId: string };
type UseOrderItemReturn = {
  updateOrderItem: UseMutationResult<
    PublicOrderItem,
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
        queryKey: [`/owner/v1/stores/${storeId}/orders/board`],
      });

      queryClient.invalidateQueries({
        queryKey: [
          `/owner/v1/stores/${storeId}/tables/${tableId}/sessions/alive/orders`,
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
        queryKey: [`/owner/v1/stores/${storeId}/orders/board`],
      });
      queryClient.invalidateQueries({
        queryKey: [
          `/owner/v1/stores/${storeId}/tables/${tableId}/sessions/alive/orders`,
        ],
      });
    },
  });

  return { updateOrderItem, removeOrderItem };
}
