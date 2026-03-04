"use client";

import { useState } from "react";
import AddCart from "./components/AddCart";
import MenuInfo from "./components/menu-info/MenuInfo";
import Options from "./components/options/Options";
import {
  MenuOptionEntry,
  MOCK_MENUS,
} from "@/app/(navigator)/components/MENU_DATA";
import { useParams } from "next/navigation";
import { PublicMenu } from "@spaceorder/db/types";
import MenuCounter from "../../../components/MenuCounter";

export default function MenuDetailPage() {
  const params = useParams<{ menuId: string }>();
  const [quantity, setQuantity] = useState(1);

  /** TODO: 추후 API 호출로 변경 필요 */
  const menu = MOCK_MENUS.find((menu) => menu.publicId === params.menuId);

  if (!menu) {
    // 추후 router not found 페이지로 변경
    throw new Error("Menu not found");
  }

  const options = Object.assign({}, menu.requiredOptions, menu.customOptions);
  const [selectedOptions, setSelectedOptions] = useState(
    new Map(
      toOptionEntries(options).map((option) => [
        option.key,
        option.value.defaultKey,
      ])
    )
  );

  return (
    <div className="bg-accent flex flex-col gap-y-2">
      <MenuInfo menu={menu}>
        <MenuCounter
          isAvailable={menu.isAvailable}
          quantity={quantity}
          changeQuantity={(newQuantity) => setQuantity(newQuantity)}
        />
      </MenuInfo>
      <Options
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        options={toOptionEntries(options)}
      />
      <AddCart
        menu={menu}
        quantity={quantity}
        options={toOptionEntries(options)}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}

function toOptionEntries(
  options: PublicMenu["requiredOptions"] | PublicMenu["customOptions"]
): MenuOptionEntry[] {
  const result: MenuOptionEntry[] = [];
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      result.push({ key, value });
    }
  }

  return result;
}
