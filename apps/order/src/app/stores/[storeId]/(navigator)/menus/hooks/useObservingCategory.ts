import { useEffect, useRef } from "react";

export default function useObservingCategory(
  setCategory: (category: string) => void
) {
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const visibleCategories = new Set<string>();

    const findCategory = (target: Element): string | null => {
      for (const [category, element] of categoryRefs.current) {
        if (element === target) return category;
      }
      return null;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const category = findCategory(entry.target);
          if (!category) continue;

          if (entry.isIntersecting) {
            visibleCategories.add(category);
          } else {
            visibleCategories.delete(category);
          }
        }

        for (const category of categoryRefs.current.keys()) {
          if (visibleCategories.has(category)) {
            setCategory(category);
            break;
          }
        }
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    categoryRefs.current.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [setCategory]);

  return categoryRefs;
}
