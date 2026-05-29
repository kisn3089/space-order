"use client";

import { Exception } from "@spaceorder/api/types";
import { AxiosError, isAxiosError } from "axios";
import ErrorFallbackView from "./stores/[storeId]/(navigator)/common/ErrorFallbackView";

export default function MenuErrorPage({
  error,
  reset,
}: {
  error: Error | AxiosError<Exception>;
  reset: () => void;
}) {
  return (
    <ErrorFallbackView
      errorTitle={
        isAxiosError(error)
          ? error.response?.data.message
          : "메뉴를 불러오는 중 오류가 발생했습니다."
      }
      reset={reset}
    />
  );
}
