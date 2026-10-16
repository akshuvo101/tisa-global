
"use client";

import { Search, X } from "lucide-react";

type ExploreSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ExploreSearch({
  value,
  onChange,
}: ExploreSearchProps) {
  return (
    <div className="mt-6 w-full max-w-xl">
      <label
        htmlFor="destination-search"
        className="sr-only"
      >
        Search destinations
      </label>

      <div className="group flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface px-4 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 sm:px-5">
        <Search
          size={19}
          aria-hidden="true"
          className="shrink-0 text-muted transition-colors group-focus-within:text-primary"
        />

        <input
          id="destination-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search destinations, countries, cities..."
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-muted"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-light hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <p className="mt-2 px-1 text-xs text-muted">
        Search by destination, country, city, or experience.
      </p>
    </div>
  );
}
