"use client";

import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import ErrorFallback from "@/components/ErrorFallback";
import TableErrorFallback from "../TableErrorFallback";
import { useTableOrderContext } from "./TableOrderContext";
import { TableOrderItem } from "./TableOrderItem";

export function TableOrderOrderList() {
  const {
    state: { session },
  } = useTableOrderContext();

  return (
    <div className="flex flex-col gap-y-1 p-2">
      <ActivityRender mode={session ? "visible" : "hidden"}>
        {session?.orders?.map((order) => (
          <ErrorBoundary
            FallbackComponent={OrderItemFallbackRender}
            key={order.publicId}
          >
            <TableOrderItem key={order.publicId} order={order} />
          </ErrorBoundary>
        ))}
      </ActivityRender>
    </div>
  );
}

function OrderItemFallbackRender(args: FallbackProps) {
  return (
    <ErrorFallback {...args}>
      <TableErrorFallback />
    </ErrorFallback>
  );
}
