"use client";

import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
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
          <TableOrderItem key={order.publicId} order={order} />
        ))}
      </ActivityRender>
    </div>
  );
}
