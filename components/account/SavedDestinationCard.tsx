"use client";

import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/types/destination";
import { removeSavedDestination } from "@/lib/saved-destinations";
import { useState } from "react";
import { ArrowUpRight, BookmarkX, Star } from "lucide-react";

type SavedDestinationCardProps = {
  destination: Destination;
  onRemoved?: (destinationId: string) => void;
};

export default function SavedDestinationCard({
  destination,
  onRemoved,
}: SavedDestinationCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    if (isRemoving) return;

    setIsRemoving(true);
    setError("");

    try {
      await removeSavedDestination(destination.id);
      onRemoved?.(destination.id);
    } catch (error) {
      console.error("Failed to remove saved destination:", error);
      setError(error instanceof Error ? error.message : "Failed to remove destination. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_10px_28px_rgba(1,9,17,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 motion-reduce:transform-none">
      {/* Image */}
      <Link
        href={`/destinations/${destination.id}`}
        data-theme-contrast="dark"
        className="relative block aspect-[16/9] overflow-hidden"
      >
        <Image
          src={destination.imageUrl}
          alt={`${destination.name}, ${destination.country}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={75}
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {destination.country}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/destinations/${destination.id}`}
              className="inline-flex items-center gap-1.5 text-base font-semibold tracking-[-0.02em] text-foreground transition hover:text-primary"
            >
              {destination.name}
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              {destination.city
                ? `${destination.city}, ${destination.country}`
                : destination.country}
            </p>
          </div>

          <Star aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 fill-amber-400/20 text-amber-500" />
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {destination.description}
        </p>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-2">
          {destination.category.slice(0, 2).map((category) => (
            <span
              key={category}
              className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-[11px] capitalize text-muted"
            >
              {category}
            </span>
          ))}

          {destination.recommendedDays && (
            <span className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-[11px] text-muted">
              {destination.recommendedDays.min}–
              {destination.recommendedDays.max} days
            </span>
          )}
        </div>

        {/* Actions */}
        {error && <p role="alert" className="mt-3 text-xs text-rose-700 dark:text-rose-200">{error}</p>}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/destinations/${destination.id}`}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:brightness-105 motion-reduce:transform-none"
          >
            View Destination
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label={`Remove ${destination.name} from saved destinations`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-medium text-muted transition hover:border-rose-400/20 hover:bg-rose-400/5 hover:text-rose-700 disabled:cursor-wait disabled:opacity-50 dark:hover:text-rose-200"
          >
            <BookmarkX aria-hidden="true" className="h-3.5 w-3.5" />
            {isRemoving ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}