"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Compass, Sparkles } from "lucide-react";

import SavedDestinationCard from "@/components/account/SavedDestinationCard";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import { destinations } from "@/lib/data/destination";
import { getSavedDestinationIds } from "@/lib/saved-destinations";

export default function SavedDestinationsPage() {
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const savedDestinations = useMemo(() => {
    const destinationMap = new Map(
      destinations.map((destination) => [destination.id, destination]),
    );

    return savedDestinationIds
      .map((id) => destinationMap.get(id))
      .filter((destination): destination is (typeof destinations)[number] =>
        Boolean(destination),
      );
  }, [savedDestinationIds]);
  const categories = useMemo(
    () => ["All", ...new Set(savedDestinations.flatMap((destination) => destination.category))],
    [savedDestinations],
  );
  const visibleDestinations = useMemo(
    () =>
      activeCategory === "All"
        ? savedDestinations
        : savedDestinations.filter((destination) => destination.category.some((category) => category === activeCategory)),
    [activeCategory, savedDestinations],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSavedDestinations() {
      try {
        setIsLoading(true);
        setError("");

        const ids = await getSavedDestinationIds();

        if (isMounted) {
          setSavedDestinationIds(ids);
        }
      } catch (error) {
        console.error("Failed to load saved destinations:", error);

        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load saved destinations.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSavedDestinations();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleDestinationRemoved(destinationId: string) {
    setSavedDestinationIds((current) =>
      current.filter((id) => id !== destinationId),
    );
  }

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-12 sm:px-6 lg:px-8">
        <PortalPageHeader
          eyebrow="YOUR COLLECTION"
          title="Saved destinations"
          description="Keep the places you are curious about close by. Filter your collection or explore somewhere new."
        >
          {!isLoading && <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3.5 text-xs font-semibold text-violet-800 dark:text-violet-200"><Bookmark aria-hidden="true" className="h-4 w-4" />{savedDestinations.length} saved</span>}
          <Link href="/explore" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:brightness-105">
            <Compass aria-hidden="true" className="h-4 w-4" />Explore destinations
          </Link>
        </PortalPageHeader>

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-5 py-4">
            <p className="text-sm font-medium text-red-300">
              Something went wrong
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 text-sm font-medium text-red-300 transition hover:text-red-200"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]"
              >
                <div className="aspect-[16/9] animate-pulse bg-white/[0.05]" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.04]" />

                  <div className="h-10 w-full animate-pulse rounded-xl bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && savedDestinations.length === 0 && (
          <div className="mt-8">
            <PortalEmptyState icon={Compass} emoji="🌍" title="Your map is waiting" description="Save a destination from Explore and it will be ready for you here whenever inspiration strikes." action={{ label: "Explore destinations", href: "/explore" }} />
          </div>
        )}

        {/* Saved destinations */}
        {!isLoading && !error && savedDestinations.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Your saved places</h2>
                <p className="mt-1 text-xs text-muted">A collection of destinations to revisit.</p>
              </div>
              <p className="inline-flex items-center gap-1.5 text-xs text-muted"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-amber-500" />{visibleDestinations.length} shown</p>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filter saved destinations">
              {categories.map((category) => (
                <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs capitalize transition ${activeCategory === category ? "border-primary/25 bg-primary-soft text-primary" : "border-border bg-surface/70 text-muted hover:text-foreground"}`}>{category}</button>
              ))}
            </div>

            {visibleDestinations.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDestinations.map((destination) => (
                <SavedDestinationCard
                  key={destination.id}
                  destination={destination}
                  onRemoved={handleDestinationRemoved}
                />
              ))}
            </div> : <PortalEmptyState icon={Compass} title={`No ${activeCategory.toLowerCase()} destinations saved`} description="Try a different collection filter or explore new places to add to your list." action={{ label: "Explore destinations", href: "/explore" }} />}
          </div>
        )}
      </section>
    </main>
  );
}