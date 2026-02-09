"use client";

import useQueryWithAuth from "@spaceorder/api/hooks/useQueryWithAuth";
import { useSetCacheByStoreBoard } from "./[storeId]/orders/hooks/useSetCacheByStoreBoard";
import { PublicStore, SummarizedOrdersByStore } from "@spaceorder/db";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";

export default function StoresPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FetchToRedirect />
    </ErrorBoundary>
  );
}

function FetchToRedirect() {
  const router = useRouter();
  const { setCache, setStoreInLocalStorage } = useSetCacheByStoreBoard();

  const {
    data: stores,
    isSuccess: isStoresSuccess,
    isError: isStoresError,
  } = useSuspenseWithAuth<PublicStore[]>(`/stores/v1`);

  /** TODO: store가 2개 이상일 경우 선택할 수 있도록 분기 필요 */
  const { isSuccess, isError } = useQueryWithAuth<SummarizedOrdersByStore>(
    `/orders/v1/stores/${stores[0].publicId}/orders/summary`,
    {
      onSuccess: (tableBoard) => setCache(tableBoard, stores[0].publicId),
      enabled: isStoresSuccess,
    }
  );

  useEffect(() => {
    if (isSuccess) {
      setStoreInLocalStorage(stores[0].publicId);
      router.replace(`/stores/${stores[0].publicId}/orders`);
    }
    if (isError || isStoresError) {
      throw new Error("매장 정보를 불러오는 중 오류가 발생했습니다.");
    }
  }, [isSuccess, isError, stores, isStoresError]);

  return null;
}
