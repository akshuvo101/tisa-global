"use client";

type ExploreSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function ExploreSearch({
  value,
  onChange,
}: ExploreSearchProps) {
  return (
    <div className="mt-9 max-w-2xl">
      <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface px-5 transition-colors focus-within:border-primary/30">
        <span className="text-lg text-muted">⌕</span>

        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search destinations..."
          aria-label="Search destinations"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="shrink-0 text-sm text-muted transition-colors hover:text-white"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}