"use client";

interface OrderDetailFooterProps {
  children: React.ReactNode;
}

export function OrderDetailFooter({ children }: OrderDetailFooterProps) {
  return <footer className="flex flex-col gap-2 p-2">{children}</footer>;
}
