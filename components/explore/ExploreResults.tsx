
import { Compass, Search } from "lucide-react";

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
    <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Category filters */}
        <CategoryFilters
          categories={categories}
          activeCategory={activeCategory}
          onChange={onCategoryChange}
        />

        {/* Results heading */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm text-muted">
              <Compass size={15} className="text-primary" />
              Discover your next destination
            </p>

            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              {activeCategory === "All"
                ? "Explore destinations"
                : `${activeCategory} destinations`}
            </h2>
          </div>

          <p
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-white">{destinations.length}</span>{" "}
            {destinations.length === 1 ? "place" : "places"} found
          </p>
        </div>

        {/* Destination cards */}
        {destinations.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:py-16">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-light text-muted">
              <Search size={23} />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No destinations found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              We couldn&apos;t find any destinations matching your search.
              Try another place, country, city, or category.
            </p>

            <button
              type="button"
              onClick={onClearFilters}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
