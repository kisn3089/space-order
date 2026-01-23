import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpOrderItems, UpdateOrderItemPayload } from "./httpOrderItem";

type UseOrderItemParams = { storeId: string; tableId: string };
export default function useOrderItem({ storeId, tableId }: UseOrderItemParams) {
  const queryClient = useQueryClient();

  const updateOrderItem = useMutation({
    mutationKey: ["order-item", "update"],
    mutationFn: ({
      params,
      updateOrderItemPayload,
    }: {
      params: { orderId: string; orderItemId: string };
      updateOrderItemPayload: UpdateOrderItemPayload;
    }) => httpOrderItems.updateOrderItem(params, updateOrderItemPayload),
    onSuccess: (_, variables) => {
      const { orderId } = variables.params;
      queryClient.invalidateQueries({
        queryKey: [
          `/owner/stores/${storeId}/tables/${tableId}/orders/${orderId}`,
        ],
      });
    },
  });

  return { updateOrderItem };
}
