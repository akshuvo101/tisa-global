"use client";

type CategoryFiltersProps = {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
};

export default function CategoryFilters({
  categories,
  activeCategory,
  onChange,
}: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((category) => {
        const isActive = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
              isActive
                ? "border-primary/20 bg-primary-soft text-primary"
                : "border-border text-muted hover:border-primary/20 hover:text-white"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}