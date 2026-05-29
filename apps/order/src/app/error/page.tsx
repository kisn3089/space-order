"use client";

import ErrorFallbackView from "../stores/[storeId]/(navigator)/common/ErrorFallbackView";

export default function RootErrorPage() {
  return (
    <ErrorFallbackView
      errorTitle={"서버가 불안정합니다. 다시 스캔해주세요."}
    ></ErrorFallbackView>
  );
}
