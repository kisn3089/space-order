"use client";

import { CardHeader } from "@spaceorder/ui/components/card";
import type { PublicCartItem } from "@spaceorder/db/types";
import MenuImage from "../../menus/components/MenuImage";
import MenuCounter from "../../menus/components/MenuCounter";
import { useCart } from "./CartProvider";
import CartMenuContent from "./CartMenuContent";
import DeleteMenuButton from "./DeleteMenuButton";

type CartMenuProps = {
  menu: PublicCartItem;
};

export default function CartMenu({ menu }: CartMenuProps) {
  const { actions } = useCart();

  return (
    <CardHeader className="flex flex-row gap-x-4 p-4">
      <MenuImage
        src={menu.menuImageUrl}
        alt={menu.menuName}
        size="item"
        className="rounded-xl"
      />
      <div className="w-full">
        <div className="flex justify-between w-full">
          <CartMenuContent menu={menu} />
          <DeleteMenuButton menuId={menu.id} />
        </div>
        <div className="flex justify-end pt-3">
          <MenuCounter
            quantity={menu.quantity}
            changeQuantity={(newQuantity) =>
              actions.changeQuantity(menu.id, newQuantity)
            }
          />
        </div>
      </div>
    </CardHeader>
  );
}
