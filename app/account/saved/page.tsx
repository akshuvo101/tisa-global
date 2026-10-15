"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import SavedDestinationCard from "@/components/account/SavedDestinationCard";
import { destinations } from "@/lib/data/destination";
import { getSavedDestinationIds } from "@/lib/saved-destinations";

export default function SavedDestinationsPage() {
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
    <main className="min-h-screen bg-background text-foreground">
      

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/account"
              className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Back to Account
            </Link>

            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-300">
                  Your collection
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Saved Destinations
                </h1>
              </div>

              {!isLoading && (
                <span className="mt-7 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-xs font-medium text-slate-300">
                  {savedDestinations.length}
                </span>
              )}
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Keep the places you want to explore later in one place.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Explore Destinations
          </Link>
        </div>

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
          <div className="mt-10 flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-2xl text-slate-400">
                ☆
              </div>

              <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em] text-white">
                No saved destinations yet
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Start exploring destinations and save the places you would
                like to visit later.
              </p>

              <Link
                href="/explore"
                className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Explore Destinations
              </Link>
            </div>
          </div>
        )}

        {/* Saved destinations */}
        {!isLoading && !error && savedDestinations.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Your saved places
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Destinations you may want to explore next.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedDestinations.map((destination) => (
                <SavedDestinationCard
                  key={destination.id}
                  destination={destination}
                  onRemoved={handleDestinationRemoved}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}