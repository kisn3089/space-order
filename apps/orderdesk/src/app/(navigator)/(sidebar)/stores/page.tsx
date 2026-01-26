"use client";

import useQueryWithAuth from "@spaceorder/api/hooks/useQueryWithAuth";
import { useSetCacheFromStoreWithOrders } from "./[storeId]/orders/hooks/useSetCacheFromStoreWithOrders";
import { SummarizedOrdersFromStore } from "@spaceorder/db";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";

export default function StoresPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FetchToRedirect />
    </ErrorBoundary>
  );
}

function FetchToRedirect() {
  const router = useRouter();

  const setCache = useSetCacheFromStoreWithOrders();
  const {
    data: store,
    isSuccess,
    isError,
  } = useQueryWithAuth<SummarizedOrdersFromStore>(`/stores/order-summary`, {
    onSuccess: setCache,
  });

  useEffect(() => {
    if (isSuccess) {
      router.replace(`/stores/${store.publicId}/orders`);
    }
    if (isError) {
      throw new Error("매장 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }, [isSuccess, isError]);

  return null;
}
