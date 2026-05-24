"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Card } from "@spaceorder/ui/components/card";
import { Button } from "@spaceorder/ui/components/button";
import CartMenu from "./CartMenu";
import { useCart } from "./CartProvider";
import { useParams } from "next/navigation";

export default function CartMenuList() {
  const { storeId } = useParams<{ storeId: string }>();
  const { state } = useCart();

  return (
    <section className="p-4 flex flex-col gap-y-2 bg-white">
      <Card className="divide-y divide-accent shadow-lg rounded-3xl">
        {state.menus.map((menu) => (
          <CartMenu key={`${menu.menuPublicId}${menu.id}`} menu={menu} />
        ))}
        <div className="p-4 grid place-content-center">
          <Button className="w-full rounded-3xl" asChild>
            <Link href={`/stores/${storeId}/menus`}>
              <PlusIcon strokeWidth={2.5} />
              메뉴 추가
            </Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
