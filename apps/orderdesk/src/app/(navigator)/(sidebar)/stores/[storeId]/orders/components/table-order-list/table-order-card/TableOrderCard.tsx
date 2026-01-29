"use client";

import { Card } from "@spaceorder/ui/components/card";
import { useTableOrderContext } from "./TableOrderContext";
import ConditionalLink from "@/components/ConditionalLink";

interface TableOrderCardProps {
  children: React.ReactNode;
}

export function TableOrderCard({ children }: TableOrderCardProps) {
  const {
    state: { isActivatedTable, isSelected, session },
    meta: { storeId, tableId },
  } = useTableOrderContext();

  const inactiveStyle = !isActivatedTable
    ? "opacity-20 cursor-not-allowed"
    : "";
  const sessionActiveStyle = session ? "hover:bg-accent" : "";
  const selectedStyle = isSelected ? "shadow-lg shadow-destructive/50" : "";

  return (
    <ConditionalLink
      condition={isActivatedTable}
      href={`/stores/${storeId}/orders/${tableId}`}
      shallow={true}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
    >
      <Card
        className={`w-full h-full min-h-[200px] flex flex-col transition-shadow duration-300 ${sessionActiveStyle} ${inactiveStyle} ${selectedStyle}`}
      >
        {children}
      </Card>
    </ConditionalLink>
  );
}
