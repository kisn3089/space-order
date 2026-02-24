"use client";

import { PublicMenu } from "@spaceorder/db/types";
import { Button } from "@spaceorder/ui/components/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@spaceorder/ui/components/item";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuCardProps = {
  menu: PublicMenu;
  isLastElement: boolean;
};
export default function MenuCard({ menu, isLastElement }: MenuCardProps) {
  const currentPath = usePathname();

  const addToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Adding ${menu.name} to cart`);
  };

  return (
    <Link href={`${currentPath}/${menu.publicId}`} className="no-underline">
      <Item
        className={`rounded-none ${isLastElement ? "border-b-0" : "border-b-accent"} cursor-pointer`}
      >
        <ItemContent>
          <ItemTitle className="font-bold text-lg">{menu.name}</ItemTitle>
          <ItemDescription>{menu.description}</ItemDescription>
          <ItemFooter className="text-base font-semibold text-primary">
            {menu.price.toLocaleString()}원
          </ItemFooter>
        </ItemContent>
        <div className="flex items-center">
          <ItemMedia variant={"image"} className="size-30 relative">
            <Image
              src={menu.imageUrl || "/coffee_sample.jpg"}
              alt={menu.name}
              width={420}
              height={320}
            />
            <Button
              size={"sm"}
              variant={"secondary"}
              className="absolute bottom-1 right-1 rounded-sm"
              onClick={addToCart}
              aria-label={`${menu.name} 장바구니에 추가`}
            >
              <ShoppingCart strokeWidth={2.5} />
            </Button>
          </ItemMedia>
        </div>
      </Item>
    </Link>
  );
}
