"use client";

import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { SummarizedOrdersByStore } from "@spaceorder/db";

export default function AwaitFetch({
  url,
  children,
  onSuccess,
}: {
  url: string;
  children: React.ReactNode;
  onSuccess?: (data: SummarizedOrdersByStore) => void;
}) {
  const { isSuccess } = useSuspenseWithAuth<SummarizedOrdersByStore>(url, {
    onSuccess,
  });

  if (!isSuccess) {
    return null;
  }

  return <>{children}</>;
}
