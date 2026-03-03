import { Button } from "@spaceorder/ui/components/button";

export default function MenuCategory({
  menuCategories,
  selectedCategory,
}: {
  menuCategories: Set<string>;
  selectedCategory: string;
}) {
  const moveScrollAtCategory = (category: string) => {
    const categoryElement = document.querySelector(
      `[data-category="${CSS.escape(category)}"]`
    );
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 sticky bg-white top-12 z-10">
      {[...menuCategories].map((category) => (
        <Button
          key={category}
          className={`h-9 font-semibold text-sm rounded-3xl`}
          variant={selectedCategory === category ? "default" : "secondary"}
          onClick={() => {
            moveScrollAtCategory(category);
          }}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
