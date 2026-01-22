"use client";

import ErrorFallback from "@/components/ErrorFallback";

export default function NavigatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorFallback error={error} resetErrorBoundary={reset} />;
}
