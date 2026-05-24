"use client";

import useSuspenseWithSession from "@spaceorder/api/hooks/useSuspenseWithSession";
import { Cart } from "@spaceorder/db/types";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { ConciergeBell } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CountIcon from "../common/CountIcon";

export default function CartLink() {
  const { storeId } = useParams<{ storeId: string }>();

  const { data: cartMenuCount } = useSuspenseWithSession<Cart, number>(
    "/carts/v1/sessions/carts",
    {
      queryOptions: {
        select: (cart) => {
          return cart.menus.length;
        },
      },
    }
  );

  return (
    <Button variant={"outline"} className="relative" asChild>
      <Link href={`/stores/${storeId}/carts`}>
        <ConciergeBell />
        <ActivityRender mode={cartMenuCount > 0 ? "visible" : "hidden"}>
          <CountIcon count={cartMenuCount} className="-top-0.5 -right-0.5" />
        </ActivityRender>
      </Link>
    </Button>
  );
}
