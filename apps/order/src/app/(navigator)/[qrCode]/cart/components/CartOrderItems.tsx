"use client";

import { Card } from "@spaceorder/ui/components/card";
import CartItem from "./CartItem";
import MenuCounter from "../../../components/MenuCounter";
import { Button } from "@spaceorder/ui/components/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { MOCK_MENUS } from "@/app/(navigator)/components/MENU_DATA";

const MOCK_MENU_DATA = MOCK_MENUS.slice(0, 3);

export interface CartOrderItem {
  menuPublicId: string;
  menuName: string;
  quantity: number;
  price: number;
  requiredOptions: Record<string, string> | null;
  customOptions: Record<string, string> | null;
  image: string | null;
  isAvailable: boolean;
}

const MOCK_ORDER_ITEMS: CartOrderItem[] = MOCK_MENU_DATA.map((menu) => {
  const requiredOptions = menu.requiredOptions
    ? Object.fromEntries(
        Object.entries(menu.requiredOptions).map(([key, value]) => [
          key,
          value.defaultKey,
        ])
      )
    : null;

  const customOptions = menu.customOptions
    ? Object.fromEntries(
        Object.entries(menu.customOptions).map(([key, value]) => [
          key,
          value.defaultKey,
        ])
      )
    : null;

  return {
    menuPublicId: menu.publicId,
    menuName: menu.name,
    image: menu.imageUrl,
    quantity: 1,
    price: menu.price, // option 가격을 포함한 가격으로 변경 필요
    isAvailable: menu.isAvailable,
    requiredOptions,
    customOptions,
  };
});

export default function CartOrderItems() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(
      MOCK_ORDER_ITEMS.map((item) => [item.menuPublicId, item.quantity])
    )
  );

  const changeQuantity = (menuPublicId: string, newQuantity: number) => {
    setQuantities((prev) => ({ ...prev, [menuPublicId]: newQuantity }));
  };

  return (
    <section className="p-4 flex flex-col gap-y-2 bg-white">
      <Card className="divide-y divide-accent">
        {MOCK_ORDER_ITEMS.map((menu) => (
          <CartItem key={menu.menuPublicId} cartItem={menu}>
            <MenuCounter
              isAvailable={menu.isAvailable}
              quantity={quantities[menu.menuPublicId] || 1}
              changeQuantity={(newQuantity) =>
                changeQuantity(menu.menuPublicId, newQuantity)
              }
            />
          </CartItem>
        ))}
        <div className="p-4 grid place-content-center">
          <Button className="w-full" asChild>
            <Link href={`/${qrCode}`}>
              <PlusIcon strokeWidth={2.5} />
              메뉴 추가
            </Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
