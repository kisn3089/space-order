"use client";

import { CardFooter } from "@spaceorder/ui/components/card";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import SessionExpireTime from "@/app/common/orders/SessionExpireTime";
import { useTableOrderContext } from "./TableOrderContext";

export function TableOrderFooter() {
  const {
    state: { session },
  } = useTableOrderContext();

  return (
    <ActivityRender mode={session?.expiresAt ? "visible" : "hidden"}>
      <CardFooter className="p-2">
        <SessionExpireTime expiresAt={session?.expiresAt} />
      </CardFooter>
    </ActivityRender>
  );
}
