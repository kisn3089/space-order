import { Button } from "@spaceorder/ui/components/button";

export default function MenuCategory({
  menuCategories,
  selectedCategory,
  setSelectedCategory,
}: {
  menuCategories: Set<string>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 sticky bg-white top-12 z-10">
      {[...menuCategories].map((category) => (
        <Button
          key={category}
          className={`h-9 font-semibold text-sm rounded-3xl`}
          variant={selectedCategory === category ? "default" : "secondary"}
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
