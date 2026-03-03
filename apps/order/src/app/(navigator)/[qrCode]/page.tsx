"use client";

import { forwardRef, Fragment, use, useEffect, useRef, useState } from "react";
import { MOCK_MENUS } from "../components/MENU_DATA";
import MenuCard from "../components/MenuCard";
import MenuCategory from "../components/MenuCategory";
import useScrollCategory from "./menu/[menuId]/hooks/useScrollCategory";

const menuCategorieSet = new Set(
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
  const [touched, setTouched] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState(
    menuCategorieSet.values().next().value
  );

  const categoryRefs = useScrollCategory({ setCategory: setSelectedCategory });

  if (menuCategorieSet.size === 0) {
    return <div className="text-center py-10">No menu available</div>;
  }

  if (!selectedCategory) {
    return <div className="text-center py-10">No category selected</div>;
  }

  const groupedCategories = Object.entries(
    Object.groupBy(MOCK_MENUS, ({ category }) => category ?? "기타")
  );

  return (
    <>
      <MenuCategory
        menuCategories={menuCategorieSet}
        selectedCategory={selectedCategory}
      />
      <section>
        {groupedCategories.map(([category, menus], i) => (
          <Fragment key={category + i}>
            <CategoryLine
              category={category}
              ref={(el) => {
                if (el) {
                  categoryRefs.current.set(category, el);
                } else {
                  categoryRefs.current.delete(category);
                }
              }}
            />
            {menus
              ?.sort((a, b) => a.sortOrder - b.sortOrder)
              .map((menu) => (
                <div
                  key={menu.publicId}
                  className={`rounded-md hover:bg-accent transition-all duration-200 ${touched === menu.publicId ? "bg-accent scale-98 " : "hover:bg-accent hover:scale-98"} ${!menu.isAvailable ? "opacity-50" : ""}`}
                  onTouchStart={() => setTouched(menu.publicId)}
                  onTouchEnd={() => setTouched(null)}
                  onTouchCancel={() => setTouched(null)}
                >
                  <MenuCard menu={menu} />
                </div>
              ))}
          </Fragment>
        ))}
      </section>
    </>
  );
}

const CategoryLine = forwardRef<HTMLDivElement, { category: string }>(
  ({ category }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full h-px bg-accent my-4 scroll-m-24"
        data-category={category}
      />
    );
  }
);

CategoryLine.displayName = "CategoryLine";
