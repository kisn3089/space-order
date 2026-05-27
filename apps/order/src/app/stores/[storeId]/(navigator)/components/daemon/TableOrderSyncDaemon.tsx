"use client";

import { useTableOrderSyncDaemon } from "@/lib/realtime/useTableOrderSyncDaemon";
import { pathToQueryKey } from "@spaceorder/api/utils/pathToQueryKey";
import { OrderSyncEvent } from "@spaceorder/db/types";
import { toastByLevel } from "@spaceorder/ui/components/sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function TableOrderSyncDaemon() {
  const queryClient = useQueryClient();

  const synchronize = ({ notice }: OrderSyncEvent) => {
    void queryClient.invalidateQueries({
      queryKey: pathToQueryKey("/orders/v1/sessions/orders"),
    });

    const { level, message } = notice || {};
    if (level && message?.customer) {
      toastByLevel(level, message.customer);
    }
  };

  useTableOrderSyncDaemon({
    onCreatedAction: synchronize,
    onUpdatedAction: synchronize,
    onCancelledAction: synchronize,
  });

  return null;
}
