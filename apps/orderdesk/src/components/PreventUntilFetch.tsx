"use client";

import { useSetCacheFromStoreWithOrders } from "@/app/(navigator)/(sidebar)/stores/[storeId]/orders/hooks/useSetCacheFromStoreWithOrders";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { SummarizedOrdersFromStore } from "@spaceorder/db";

export function PreventUntilFetch({
  url,
  children,
  onSuccess,
}: {
  url: string;
  children: React.ReactNode;
  onSuccess?: (data: SummarizedOrdersFromStore) => void;
}) {
  const { isSuccess } = useSuspenseWithAuth<SummarizedOrdersFromStore>(url, {
    onSuccess,
  });

  if (!isSuccess) {
    return null;
  }

  return <>{children}</>;
}

export function ClientPreventUntilFetch({
  children,
}: {
  children: React.ReactNode;
}) {
  const setCache = useSetCacheFromStoreWithOrders();
  return (
    <PreventUntilFetch url={`/stores/order-summary`} onSuccess={setCache}>
      {children}
    </PreventUntilFetch>
  );
}
