"use client";

import { Item } from "@spaceorder/ui/components/item";
import MenuImage from "./MenuImage";
import MenuContent from "./MenuContent";
import { PublicMenu } from "@spaceorder/db/types";

export default function MenuInfo({
  menu,
  children,
}: {
  menu: PublicMenu;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white">
      <Item className="flex flex-col items-center p-0">
        <MenuImage src={menu.imageUrl} alt={menu.name} size="cover" />
        <MenuContent menu={menu}>{children}</MenuContent>
      </Item>
    </section>
  );
}
