import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { httpOrderItems, UpdateOrderItemPayload } from "./httpOrderItem";
import { PublicOrderItem } from "@spaceorder/db/types/publicModel.type";
import { pathToQueryKey } from "../../../utils/pathToQueryKey";

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

type Params = { storeId: string; tableId: string };

export default function useOrderItem({
  storeId,
  tableId,
}: Params): UseOrderItemReturn {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: pathToQueryKey(`/orders/v1/stores/${storeId}/orders/summary`),
    });
    queryClient.invalidateQueries({
      queryKey: pathToQueryKey(
        `/orders/v1/tables/${tableId}/active-session/orders`
      ),
    });
  };

  const update = useMutation({
    mutationKey: ["order-item", "update"],
    mutationFn: ({
      orderItemId,
      updateOrderItemPayload,
    }: {
      orderItemId: string;
      updateOrderItemPayload: UpdateOrderItemPayload;
    }) => httpOrderItems.updateOrderItem(orderItemId, updateOrderItemPayload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationKey: ["order-item", "remove"],
    mutationFn: ({ orderItemId }: { orderItemId: string }) =>
      httpOrderItems.removeOrderItem(orderItemId),
    onSuccess: invalidate,
  });

  return { update, remove };
}
