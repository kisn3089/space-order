"use client";

import { PublicMenu } from "@spaceorder/db/types";
import { Button } from "@spaceorder/ui/components/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@spaceorder/ui/components/item";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuImage from "../[qrCode]/menu/[menuId]/components/menu-info/MenuImage";
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";

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
          <ItemDescription className="leading-4 pt-2">
            {menu.description}
          </ItemDescription>
        </ItemContent>
        <div className="flex items-center">
          <MenuImage src={menu.imageUrl} alt={menu.name} size="item">
            <Button
              size={"sm"}
              variant={"secondary"}
              className="absolute bottom-1 right-1 rounded-sm"
              aria-label={`${menu.name} 장바구니에 추가`}
            >
              <ShoppingCart strokeWidth={2.5} />
            </Button>
          </MenuImage>
        </div>
      </Item>
    </Link>
  );
}
