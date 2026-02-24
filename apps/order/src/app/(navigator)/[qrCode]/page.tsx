"use client";

import { use, useState } from "react";
import { MOCK_MENUS } from "../components/MENU_DATA";
import MenuCard from "../components/MenuCard";
import MenuCategory from "../components/MenuCategory";

const menuCategories = new Set(
  MOCK_MENUS.map((menu) => menu.category).filter(
    (category): category is string => category !== null
  )
);

export default function OrdersPage({
  params,
}: {
  params: Promise<{ qrCode: string }>;
}) {
  const { qrCode: _ } = use(params);

  const [selectedCategory, setSelectedCategory] = useState(
    menuCategories.values().next().value
  );

  if (menuCategories.size === 0) {
    return <div className="text-center py-10">No menu available</div>;
  }

  if (!selectedCategory) {
    return <div className="text-center py-10">No category selected</div>;
  }

  return (
    <>
      <MenuCategory
        menuCategories={menuCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <section>
        {MOCK_MENUS.filter((menu) => menu.category === selectedCategory)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((menu, index, array) => (
            <MenuCard
              key={menu.publicId}
              menu={menu}
              isLastElement={index === array.length - 1}
            />
          ))}
      </section>
    </>
  );
}
