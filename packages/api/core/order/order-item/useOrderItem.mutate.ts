import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { httpOrderItems, UpdateOrderItemPayload } from "./httpOrderItem";
import { PublicOrderItem } from "@spaceorder/db/types/publicModel.type";

type UseOrderItemReturn = {
  update: UseMutationResult<
    PublicOrderItem,
    Error,
    {
      orderItemId: string;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }
  >;
  remove: UseMutationResult<void, Error, { orderItemId: string }>;
};
export default function useOrderItem(): UseOrderItemReturn {
  const update = useMutation({
    mutationKey: ["order-item", "update"],
    mutationFn: ({
      orderItemId,
      updateOrderItemPayload,
    }: {
      orderItemId: string;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }) => httpOrderItems.updateOrderItem(orderItemId, updateOrderItemPayload),
  });

  const remove = useMutation({
    mutationKey: ["order-item", "remove"],
    mutationFn: ({ orderItemId }: { orderItemId: string }) =>
      httpOrderItems.removeOrderItem(orderItemId),
  });

  return { update, remove };
}
