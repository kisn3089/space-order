import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { httpOrderItems, UpdateOrderItemPayload } from "./httpOrderItem";
import { PublicOrderItem } from "@spaceorder/db/types/publicModel.type";

type UseOrderItemParams = { storeId: string; tableId: string };
type UseOrderItemReturn = {
  updateOrderItem: UseMutationResult<
    PublicOrderItem,
    Error,
    {
      orderItemId: string;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }
  >;
  removeOrderItem: UseMutationResult<void, Error, { orderItemId: string }>;
};
export default function useOrderItem({
  storeId,
  tableId,
}: UseOrderItemParams): UseOrderItemReturn {
  const queryClient = useQueryClient();

  const updateOrderItem = useMutation({
    mutationKey: ["order-item", "update"],
    mutationFn: ({
      orderItemId,
      updateOrderItemPayload,
    }: {
      orderItemId: string;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }) => httpOrderItems.updateOrderItem(orderItemId, updateOrderItemPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${storeId}/orders/summary`],
      });

      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/tables/${tableId}/active-session/orders`],
      });
    },
  });

  const removeOrderItem = useMutation({
    mutationKey: ["order-item", "remove"],
    mutationFn: ({ orderItemId }: { orderItemId: string }) =>
      httpOrderItems.removeOrderItem(orderItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/stores/${storeId}/orders/summary`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/orders/v1/tables/${tableId}/active-session/orders`],
      });
    },
  });

  return { updateOrderItem, removeOrderItem };
}
