"use client";

import { TravelPackage } from "@/types/packages";


type PackageFiltersProps = {
  packages: TravelPackage[];
  destination: string;
  budget: string;
  duration: string;
  departure: string;
  travelStyle: string;
  onDestinationChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onDepartureChange: (value: string) => void;
  onTravelStyleChange: (value: string) => void;
  onReset: () => void;
};

const selectClassName =
  "h-11 w-full rounded-xl border border-border bg-surface-light px-3 text-sm text-white outline-none transition focus:border-primary/50";

export default function PackageFilters({
  packages,
  destination,
  budget,
  duration,
  departure,
  travelStyle,
  onDestinationChange,
  onBudgetChange,
  onDurationChange,
  onDepartureChange,
  onTravelStyleChange,
  onReset,
}: PackageFiltersProps) {
  const destinations = Array.from(
    new Set(packages.map((item) => item.destination)),
  );

  const departureCities = Array.from(
    new Set(packages.map((item) => item.departureCity)),
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-4">
        {/* Filter heading */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Find your package
            </h2>

            <p className="mt-1 text-xs text-muted">
              Narrow down packages by destination, budget, duration, and
              travel style.
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="self-start rounded-lg px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/[0.04] hover:text-white sm:self-auto"
          >
            Reset filters
          </button>
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Destination */}
          <div>
            <label
              htmlFor="package-destination"
              className="mb-2 block text-xs font-medium text-white/70"
            >
              Destination
            </label>

            <select
              id="package-destination"
              value={destination}
              onChange={(event) =>
                onDestinationChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">All destinations</option>

              {destinations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="package-budget"
              className="mb-2 block text-xs font-medium text-white/70"
            >
              Budget
            </label>

            <select
              id="package-budget"
              value={budget}
              onChange={(event) =>
                onBudgetChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Any budget</option>
              <option value="under-100k">Under ৳100k</option>
              <option value="100k-150k">৳100k – ৳150k</option>
              <option value="150k-200k">৳150k – ৳200k</option>
              <option value="over-200k">Over ৳200k</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="package-duration"
              className="mb-2 block text-xs font-medium text-white/70"
            >
              Duration
            </label>

            <select
              id="package-duration"
              value={duration}
              onChange={(event) =>
                onDurationChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Any duration</option>
              <option value="1-4">1–4 days</option>
              <option value="5-6">5–6 days</option>
              <option value="7-9">7–9 days</option>
              <option value="10-plus">10+ days</option>
            </select>
          </div>

          {/* Departure */}
          <div>
            <label
              htmlFor="package-departure"
              className="mb-2 block text-xs font-medium text-white/70"
            >
              Departure
            </label>

            <select
              id="package-departure"
              value={departure}
              onChange={(event) =>
                onDepartureChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Any departure</option>

              {departureCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Travel style */}
          <div>
            <label
              htmlFor="package-style"
              className="mb-2 block text-xs font-medium text-white/70"
            >
              Travel style
            </label>

            <select
              id="package-style"
              value={travelStyle}
              onChange={(event) =>
                onTravelStyleChange(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">Any style</option>
              <option value="budget">Budget</option>
              <option value="balanced">Balanced</option>
              <option value="comfort">Comfort</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}