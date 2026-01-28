"use client";

interface TableOrderContentProps {
  children: React.ReactNode;
}

export function TableOrderContent({ children }: TableOrderContentProps) {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide">{children}</div>
  );
}
