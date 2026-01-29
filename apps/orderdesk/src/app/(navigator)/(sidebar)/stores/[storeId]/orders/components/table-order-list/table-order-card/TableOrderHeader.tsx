"use client";

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { useTableOrderContext } from "./TableOrderContext";

export function TableOrderHeader() {
  const {
    state: { table },
  } = useTableOrderContext();

  const { tableNumber, section } = table;

  return (
    <CardHeader className="flex flex-row justify-between gap-1 p-2">
      <CardTitle>{tableNumber}</CardTitle>
      <ActivityRender mode={section ? "visible" : "hidden"}>
        <CardDescription className="text-sm">{section}</CardDescription>
      </ActivityRender>
    </CardHeader>
  );
}
