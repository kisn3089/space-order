"use client";

import AwaitFetch from "@/components/AwaitFetch";
import { useSetCacheByStoreBoard } from "../hooks/useSetCacheByStoreBoard";
import { LAST_ACCESSED_STORE_ID } from "@spaceorder/db/constants";

export default function AwaitOrdersSummary({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastAccessedStoreId = localStorage.getItem(LAST_ACCESSED_STORE_ID);
  const { setCache } = useSetCacheByStoreBoard();
  return (
    <AwaitFetch
      url={`/orders/v1/stores/${lastAccessedStoreId}/orders/summary`}
      onSuccess={setCache}
    >
      {children}
    </AwaitFetch>
  );
}
