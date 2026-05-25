"use client";

import { useStoreOrderRealtimeDaemon } from "@/lib/realtime/useStoreOrderRealtimeDaemon";
import { pathToQueryKey } from "@spaceorder/api/utils/pathToQueryKey";
import { OrderRealtimeEvent } from "@spaceorder/db/types";
import { toast, toastByLevel } from "@spaceorder/ui/components/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/dist/client/components/navigation";

export default function OrderRealtimeDaemon({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ storeId: string; tableId?: string }>();

  const queryClient = useQueryClient();

  const invalidateOrdersSummary = () => {
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

  const handleRealtimeEvent = ({ notice }: OrderRealtimeEvent) => {
    invalidateOrdersSummary();

    const { level, message } = notice || {};
    if (level && message?.owner)
      toastByLevel(level, message.owner, {
        duration: Infinity,
        closeButton: true,
      });
  };

  useStoreOrderRealtimeDaemon(params.storeId, {
    onCreatedAction: handleRealtimeEvent,
    onUpdatedAction: handleRealtimeEvent,
    onCancelledAction: handleRealtimeEvent,
  });

  return children;
}
