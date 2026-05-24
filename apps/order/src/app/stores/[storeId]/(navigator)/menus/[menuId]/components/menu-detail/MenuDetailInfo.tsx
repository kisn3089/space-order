"use client";

import { Item } from "@spaceorder/ui/components/item";
import MenuContent from "./MenuContent";
import { useMenuDetailContext } from "./MenuDetailContext";
import MenuImage from "../../../components/MenuImage";

export default function MenuDetailInfo({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    state: { menu },
  } = useMenuDetailContext();
  return (
    <section className="bg-white">
      <Item className="flex flex-col items-center p-0">
        <MenuImage
          src={menu.imageUrl}
          priority={true}
          alt={menu.name}
          size="cover"
          className="rounded-3xl"
        />
        <MenuContent menu={menu}>{children}</MenuContent>
      </Item>
    </section>
  );
}
