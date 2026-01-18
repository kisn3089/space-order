"use client";

import { useSetCacheFromStoreWithOrders } from "@/app/(navigator)/(sidebar)/stores/[storeId]/orders/hooks/useSetCacheFromStoreWithOrders";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { ResponseStoreWithTables } from "@spaceorder/db";

export default function PreventUntilFetch({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const setCache = useSetCacheFromStoreWithOrders();
  useSuspenseWithAuth<ResponseStoreWithTables>(url, {
    onSuccess: setCache,
  });

  return <>{children}</>;
}
