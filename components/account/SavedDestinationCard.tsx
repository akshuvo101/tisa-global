"use client";

import Link from "next/link";
import Image from "next/image";
import type { Destination } from "@/types/destination";
import { removeSavedDestination } from "@/lib/saved-destinations";
import { useState } from "react";

type SavedDestinationCardProps = {
  destination: Destination;
  onRemoved?: (destinationId: string) => void;
};

export default function SavedDestinationCard({
  destination,
  onRemoved,
}: SavedDestinationCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      await removeSavedDestination(destination.id);
      onRemoved?.(destination.id);
    } catch (error) {
      console.error("Failed to remove saved destination:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to remove destination. Please try again."
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition hover:border-white/[0.14]">
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

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {destination.country}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/destinations/${destination.id}`}
              className="text-lg font-semibold tracking-[-0.02em] text-white transition hover:text-sky-300"
            >
              {destination.name}
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              {destination.city
                ? `${destination.city}, ${destination.country}`
                : destination.country}
            </p>
          </div>

          <span className="shrink-0 text-sky-300">
            ★
          </span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
          {destination.description}
        </p>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-2">
          {destination.category.slice(0, 2).map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] capitalize text-slate-400"
            >
              {category}
            </span>
          ))}

          {destination.recommendedDays && (
            <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">
              {destination.recommendedDays.min}–
              {destination.recommendedDays.max} days
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <Link
            href={`/destinations/${destination.id}`}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-white text-xs font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            View Destination
          </Link>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="h-10 rounded-xl border border-white/[0.08] px-4 text-xs font-medium text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300 disabled:cursor-wait disabled:opacity-50"
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </article>
  );
}