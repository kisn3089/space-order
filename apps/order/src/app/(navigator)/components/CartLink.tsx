"use client";

import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { ConciergeBell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CartLink() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const itemCount = 3; // TODO: 장바구니 아이템 수 가져오기

  return (
    <Button variant={"secondary"} className="relative" asChild>
      <Link href={`/${qrCode}/cart`}>
        <ConciergeBell />
        <ActivityRender mode={itemCount > 0 ? "visible" : "hidden"}>
          <div className="absolute top-0 right-0 w-4 h-4 grid place-content-center bg-black text-white rounded-full text-[0.6rem] font-semibold">
            {itemCount}
          </div>
        </ActivityRender>
      </Link>
    </Button>
  );
}
