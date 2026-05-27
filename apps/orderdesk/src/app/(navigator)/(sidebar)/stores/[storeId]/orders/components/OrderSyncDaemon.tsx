"use client";

import { useStoreOrderSyncDaemon } from "@/lib/realtime/useStoreOrderSyncDaemon";
import { pathToQueryKey } from "@spaceorder/api/utils/pathToQueryKey";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function OrderSyncDaemon() {
  const params = useParams<{ storeId: string; tableId?: string }>();
  const queryClient = useQueryClient();

  const synchronize = () => {
    queryClient.invalidateQueries({
      queryKey: pathToQueryKey(
        `/orders/v1/stores/${params.storeId}/orders/summary`
      ),
    });
    if (params.tableId) {
      queryClient.invalidateQueries({
        queryKey: pathToQueryKey(
          `/orders/v1/tables/${params.tableId}/active-session/orders`
        ),
      });
    }
  };

  useStoreOrderSyncDaemon(params.storeId, {
    onCreatedAction: synchronize,
    onUpdatedAction: synchronize,
    onCancelledAction: synchronize,
  });

  return null;
}
