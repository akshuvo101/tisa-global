import DestinationCard from "@/components/explore/DestinationCard";
import CategoryFilters from "@/components/explore/CategoryFilters";

import type { Destination } from "@/types/destination";

type ExploreResultsProps = {
  destinations: Destination[];
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
};

export default function ExploreResults({
  destinations,
  categories,
  activeCategory,
  onCategoryChange,
  onClearFilters,
}: ExploreResultsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Filters */}
        <CategoryFilters
          categories={categories}
          activeCategory={activeCategory}
          onChange={onCategoryChange}
        />

        {/* Heading */}
        <div className="mt-12">
          <p className="text-sm text-muted">
            {destinations.length}{" "}
            {destinations.length === 1 ? "destination" : "destinations"}
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-white">
            {activeCategory === "All"
              ? "Explore destinations"
              : `${activeCategory} destinations`}
          </h2>
        </div>

        {/* Results */}
        {destinations.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-xl text-primary">
              ⌕
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No destinations found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Try a different destination name, country, city, or category.
            </p>

            <button
              type="button"
              onClick={onClearFilters}
              className="mt-6 rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-primary/30 hover:text-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}