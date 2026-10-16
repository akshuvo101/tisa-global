
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Keep the search input in sync with URL query changes.
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  // Scroll after typing settles, or immediately after a category change.
  useEffect(() => {
    if (!shouldScrollToResults) return;

    const delay = search.trim() ? 250 : 0;

    const timeout = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setShouldScrollToResults(false);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [search, activeCategory, shouldScrollToResults]);

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

  function handleSearchChange(value: string) {
    setSearch(value);
    setShouldScrollToResults(true);
  }

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setShouldScrollToResults(true);
  }

  function clearFilters() {
    setSearch("");
    setActiveCategory("All");
    setShouldScrollToResults(true);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Compact Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12 lg:px-8 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Explore the world
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
            Find somewhere worth
            <span className="text-primary"> going.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
            Discover incredible destinations, explore new cultures, and find
            the information you need to plan your next journey.
          </p>

          <ExploreSearch
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </section>

      {/* Filters and results */}
      <div
        ref={resultsRef}
        id="explore-results"
        className="scroll-mt-24"
      >
        <ExploreResults
          destinations={filteredDestinations}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          onClearFilters={clearFilters}
        />
      </div>
    </main>
  );
}
