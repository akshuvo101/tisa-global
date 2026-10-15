import Image from "next/image";
import Link from "next/link";

import SaveDestinationButton from "@/components/destinations/SaveDestinationButton";
import type { Destination } from "@/types/destination";

type DestinationHeroProps = {
  destination: Destination;
};

export default function DestinationHero({
  destination,
}: DestinationHeroProps) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Image */}
          <div data-theme-contrast="dark" className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-surface">
            <Image
              src={destination.imageUrl}
              alt={`${destination.name}, ${destination.country}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
          </div>

          {/* Content */}
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{destination.country}</span>

              {destination.city && (
                <>
                  <span className="text-white/30">•</span>
                  <span>{destination.city}</span>
                </>
              )}
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              {destination.name}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              {destination.category.map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-border bg-surface-light px-3 py-1.5 text-xs capitalize text-muted"
                >
                  {category}
                </span>
              ))}
            </div>

            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
              {destination.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/planner?destination=${destination.id}`}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:bg-primary/90"
              >
                Plan My Trip
              </Link>

              <Link
                href={`/ai?destination=${destination.id}`}
                className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-white transition hover:border-primary/30 hover:text-primary"
              >
                Ask TISA AI
              </Link>

              <SaveDestinationButton
                destinationId={destination.id}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}