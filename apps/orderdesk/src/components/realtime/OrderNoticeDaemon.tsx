"use client";

import { useStoreOrderSyncDaemon } from "@/lib/realtime/useStoreOrderSyncDaemon";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db";
import { OrderSyncEvent } from "@spaceorder/db/types";
import { toastByLevel } from "@spaceorder/ui/components/sonner";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Notice와 Orders InvalidateQuery를 온전히 분리하기 위해서는 서버에서 event 명을 세분화해야 합니다.
 * @example "notice:stores:${storeId}"
 * @see order-events.service.ts
 */
export default function OrderNoticeDaemon() {
  const pathname = usePathname();
  const [storeId, setStoreId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const id = localStorage.getItem(LAST_ACCESSED_STORE_ID);
    setStoreId(id ?? undefined);
  }, [pathname]);

  const triggerNotice = ({ notice }: OrderSyncEvent) => {
    const { level, message } = notice || {};
    if (level && message?.owner)
      toastByLevel(level, message.owner, {
        duration: Infinity,
        closeButton: true,
      });
  };

  useStoreOrderSyncDaemon(storeId, {
    onCreatedAction: triggerNotice,
    onUpdatedAction: triggerNotice,
    onCancelledAction: triggerNotice,
  });

  return null;
}
