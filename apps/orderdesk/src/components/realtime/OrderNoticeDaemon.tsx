"use client";

import { useStoreOrderSyncDaemon } from "@/lib/realtime/useStoreOrderSyncDaemon";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db";
import { OrderSyncEvent } from "@spaceorder/db/types";
import { toastByLevel } from "@spaceorder/ui/components/sonner";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Notice와 Orders InvalidateQuery를 온전히 분리하기 위해서는 서버에서 event 명을 세분화해야 합니다.
 * @example "notice:stores:${storeId}"
 * @see order-events.service.ts
 */
export default function OrderNoticeDaemon() {
  const params = useParams<{ storeId?: string }>();
  const pathname = usePathname();
  const [fallbackStoreId, setFallbackStoreId] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (params.storeId) return;
    const id = localStorage.getItem(LAST_ACCESSED_STORE_ID);
    setFallbackStoreId(id ?? undefined);
  }, [pathname, params.storeId]);

  const storeId = params.storeId ?? fallbackStoreId;

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
