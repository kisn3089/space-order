"use client";

import { Card } from "@spaceorder/ui/components/card";
import { useTableOrderContext } from "./TableOrderContext";

interface TableOrderCardProps {
  children: React.ReactNode;
}

export function TableOrderCard({ children }: TableOrderCardProps) {
  const {
    state: { isActive, isSelected, session },
    actions: { navigateToTable },
  } = useTableOrderContext();

  const inactiveStyle = !isActive ? "opacity-20 cursor-not-allowed" : "";
  const sessionActiveStyle = session ? "hover:bg-accent" : "";
  const selectedStyle = isSelected ? "shadow-lg shadow-destructive/50" : "";

  return (
    <Card
      className={`w-full min-h-[200px] flex flex-col cursor-pointer transition-shadow duration-300 ${sessionActiveStyle} ${inactiveStyle} ${selectedStyle} max-h-[300px]`}
      onClick={() => (isActive ? navigateToTable() : null)}
    >
      {children}
    </Card>
  );
}
