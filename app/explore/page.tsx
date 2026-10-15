"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import ExploreSearch from "@/components/explore/ExploreSearch";
import ExploreResults from "@/components/explore/ExploreResults";
import PageLoading from "@/components/layout/PageLoading";

import { destinations } from "@/lib/data/destination";

const categories = [
  "All",
  "City",
  "Beach",
  "Mountain",
  "Nature",
  "Culture",
  "Adventure",
  "Shopping",
  "Food",
];

export default function ExplorePage() {
  return (
    <Suspense fallback={<PageLoading label="Finding places to explore" />}>
      <ExplorePageContent />
    </Suspense>
  );
}

function ExplorePageContent() {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDestinations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return destinations.filter((destination) => {
      const matchesSearch =
        !normalizedSearch ||
        destination.name.toLowerCase().includes(normalizedSearch) ||
        destination.country.toLowerCase().includes(normalizedSearch) ||
        destination.city?.toLowerCase().includes(normalizedSearch) ||
        destination.description.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        activeCategory === "All" ||
        destination.category.some(
          (category) =>
            category.toLowerCase() === activeCategory.toLowerCase(),
        );

      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  function clearFilters() {
    setSearch("");
    setActiveCategory("All");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Explore the world
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
            Find somewhere worth
            <span className="text-primary"> going.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Discover countries, cities, and remarkable places around the world.
            Then let TISA help you understand how to actually get there.
          </p>

          <ExploreSearch value={search} onChange={setSearch} />
        </div>
      </section>

      {/* Results */}
      <ExploreResults
        destinations={filteredDestinations}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onClearFilters={clearFilters}
      />
    </main>
  );
}