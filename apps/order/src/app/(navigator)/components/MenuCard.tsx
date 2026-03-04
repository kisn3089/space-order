"use client";

import { PublicMenu } from "@spaceorder/db/types";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@spaceorder/ui/components/item";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuImage from "./MenuImage";
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";

type MenuCardProps = {
  menu: PublicMenu;
};

export default function MenuCard({ menu }: MenuCardProps) {
  const currentPath = usePathname();

  return (
    <Link href={`${currentPath}/menu/${menu.publicId}`}>
      <Item className={`cursor-pointer items-start`}>
        <ItemContent className="gap-0">
          <ItemTitle className="font-bold text-lg">{menu.name}</ItemTitle>
          <ItemFooter className="text-base font-semibold text-primary">
            {transCurrencyFormat(menu.price)}
          </ItemFooter>
          <ActivityRender mode={menu.description ? "visible" : "hidden"}>
            <ItemDescription className="leading-4 pt-2">
              {menu.description}
            </ItemDescription>
          </ActivityRender>
        </ItemContent>
        <div className="flex items-center">
          <MenuImage src={menu.imageUrl} alt={menu.name} size="item" />
        </div>
      </Item>
    </Link>
  );
}
