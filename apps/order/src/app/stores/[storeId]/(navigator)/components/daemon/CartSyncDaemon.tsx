"use client";

import { useCartSyncDaemon } from "@/lib/realtime/useCartSyncDaemon";
import { pathToQueryKey } from "@spaceorder/api/utils";
import { CartSyncEvent } from "@spaceorder/db/types";
import { toastByLevel } from "@spaceorder/ui/components/sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function CartSyncDaemon() {
  const queryClient = useQueryClient();

  const synchronize = ({ notice }: CartSyncEvent) => {
    void queryClient.invalidateQueries({
      queryKey: pathToQueryKey("/carts/v1/sessions/carts"),
    });

    const { level, message } = notice || {};
    if (level && message?.customer) {
      toastByLevel(level, message.customer);
    }
  };

  useCartSyncDaemon({
    onCreated: synchronize,
    onUpdated: synchronize,
    onDeleted: synchronize,
    onCleared: synchronize,
  });

  return null;
}
