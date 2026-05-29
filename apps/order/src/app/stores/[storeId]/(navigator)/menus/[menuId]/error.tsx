"use client";

import ErrorFallbackView from "../../common/ErrorFallbackView";

export default function MenuError({
  error: _,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorFallbackView
      errorTitle="메뉴를 불러오는 중 오류가 발생했습니다."
      reset={reset}
    ></ErrorFallbackView>
  );
}
