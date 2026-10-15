"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import { travelPackages } from "@/lib/data/packages";
import PackageFilters from "@/components/packages/PackageFilters";
import PackageCard from "@/components/packages/PackageCard";

function matchesBudget(price: number, budget: string) {
  switch (budget) {
    case "under-100k":
      return price < 100000;

    case "100k-150k":
      return price >= 100000 && price <= 150000;

    case "150k-200k":
      return price > 150000 && price <= 200000;

    case "over-200k":
      return price > 200000;

    default:
      return true;
  }
}

function matchesDuration(days: number, duration: string) {
  switch (duration) {
    case "1-4":
      return days >= 1 && days <= 4;

    case "5-6":
      return days >= 5 && days <= 6;

    case "7-9":
      return days >= 7 && days <= 9;

    case "10-plus":
      return days >= 10;

    default:
      return true;
  }
}

export default function PackagesPage() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [departure, setDeparture] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  const filteredPackages = useMemo(() => {
    return travelPackages.filter((item) => {
      const destinationMatch =
        !destination || item.destination === destination;

      const budgetMatch = matchesBudget(item.price, budget);

      const durationMatch = matchesDuration(
        item.durationDays,
        duration,
      );

      const departureMatch =
        !departure || item.departureCity === departure;

      const styleMatch =
        !travelStyle || item.travelStyle === travelStyle;

      return (
        destinationMatch &&
        budgetMatch &&
        durationMatch &&
        departureMatch &&
        styleMatch
      );
    });
  }, [
    destination,
    budget,
    duration,
    departure,
    travelStyle,
  ]);

  const resetFilters = () => {
    setDestination("");
    setBudget("");
    setDuration("");
    setDeparture("");
    setTravelStyle("");
  };

  const hasFilters =
    Boolean(destination) ||
    Boolean(budget) ||
    Boolean(duration) ||
    Boolean(departure) ||
    Boolean(travelStyle);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary">
              <span aria-hidden="true">✦</span>
              Curated travel options
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Travel packages,
              <br />
              <span className="text-white/45">
                made easier to explore.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Explore ready-made travel packages and find an
              option that fits your destination, budget, duration,
              and travel style.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <PackageFilters
          packages={travelPackages}
          destination={destination}
          budget={budget}
          duration={duration}
          departure={departure}
          travelStyle={travelStyle}
          onDestinationChange={setDestination}
          onBudgetChange={setBudget}
          onDurationChange={setDuration}
          onDepartureChange={setDeparture}
          onTravelStyleChange={setTravelStyle}
          onReset={resetFilters}
        />

        {/* Results header */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted">
              {filteredPackages.length}{" "}
              {filteredPackages.length === 1
                ? "package"
                : "packages"}{" "}
              available
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              Explore travel options
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-start text-sm font-medium text-primary transition hover:text-white sm:self-auto"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Package grid */}
        {filteredPackages.length > 0 ? (
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((packageData) => (
              <PackageCard
                key={packageData.id}
                packageData={packageData}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-light text-lg text-muted">
              ✦
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No packages found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              We couldn't find a package matching all of your
              selected filters. Try changing your preferences or
              clearing the filters.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* AI CTA */}
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary-soft via-surface to-secondary-soft p-7 sm:p-10">
          <div className="relative max-w-2xl">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary-soft text-primary">
              ✦
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Not sure which package fits you?
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Tell TISA Global about your destination, budget, travel
              dates, and preferences. TISA AI can help you
              understand which kind of trip makes sense for you.
            </p>

            <Link
              href="/ai"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-background transition hover:bg-white/90"
            >
              Ask TISA AI
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace note */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-xs leading-5 text-muted">
            Package prices and availability shown here are
            planning/demo data for TISA Global. Actual prices,
            availability, inclusions, visa requirements, and
            cancellation terms should be confirmed with the
            relevant provider before booking.
          </p>
        </div>
      </section>
    </main>
  );
}