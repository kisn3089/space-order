import { useEffect, useRef } from "react";

export default function useScrollCategory({
  setCategory,
}: {
  setCategory: (category: string) => void;
}) {
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const checkCategoryPosition = () => {
      let inRangeCategory: string | null = null;
      let aboveCategory: string | null = null;

      categoryRefs.current.forEach((element, category) => {
        const top = element.getBoundingClientRect().top;

        if (top >= 0 && top < 116) {
          inRangeCategory = category;
        } else if (top < 0) {
          aboveCategory = category;
        }
      });

      const selectedCategory = inRangeCategory || aboveCategory;
      if (selectedCategory) {
        setCategory(selectedCategory);
      }
    };

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(checkCategoryPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    checkCategoryPosition();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setCategory]);

  return categoryRefs;
}
