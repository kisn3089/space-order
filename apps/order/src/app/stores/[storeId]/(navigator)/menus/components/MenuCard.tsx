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
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import MenuImage from "./MenuImage";

type MenuCardProps = {
  menu: PublicMenu;
  priority?: boolean;
};

export default function MenuCard({ menu, priority = false }: MenuCardProps) {
  const currentPath = usePathname();

  return (
    <Link href={`${currentPath}/${menu.publicId}`}>
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
          <MenuImage
            src={menu.imageUrl}
            alt={menu.name}
            size="item"
            priority={priority}
            className="rounded-xl"
          />
        </div>
      </Item>
    </Link>
  );
}
