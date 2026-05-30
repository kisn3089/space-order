"use client";

import { Exception } from "@spaceorder/api/types";
import { AxiosError } from "axios";
import ErrorFallbackView from "../common/ErrorFallbackView";

export default function CartError({
  error: _,
  reset,
}: {
  error: Error | AxiosError<Exception>;
  reset: () => void;
}) {
  return (
    <ErrorFallbackView
      errorTitle={"장바구니 정보를 불러오는 중 오류가 발생했습니다."}
      reset={reset}
    ></ErrorFallbackView>
  );
}
