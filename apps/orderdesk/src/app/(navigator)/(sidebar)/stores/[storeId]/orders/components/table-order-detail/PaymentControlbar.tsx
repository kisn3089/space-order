"use client";

import { Button } from "@spaceorder/ui/components/button";

export default function PaymentControlbar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button
          disabled
          className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
          variant={"secondary"}
        >
          할인
        </Button>
        <Button
          disabled
          className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
        >
          메뉴 추가
        </Button>
      </div>
      {children}
    </>
  );
}
