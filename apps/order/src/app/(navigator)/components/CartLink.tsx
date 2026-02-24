"use client";

import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { ConciergeBell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CartLink({ itemCount }: { itemCount: number }) {
  const pathname = usePathname();

  return (
    <Button variant={"secondary"} className="relative" asChild>
      <Link href={`${pathname}/cart`}>
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
