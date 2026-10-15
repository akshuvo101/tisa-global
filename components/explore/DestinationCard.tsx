import Image from "next/image";
import Link from "next/link";

import type { Destination } from "@/types/destination";

type DestinationCardProps = {
  destination: Destination;
};

export default function DestinationCard({
  destination,
}: DestinationCardProps) {
  return (
    <Link
      href={`/destinations/${destination.id}`}
      className="group overflow-hidden rounded-3xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-primary/30"
    >
      {/* Image */}
      <div data-theme-contrast="dark" className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={destination.imageUrl}
          alt={`${destination.name}, ${destination.country}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Location */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-medium text-white/70">
            {destination.country}
            {destination.city ? ` · ${destination.city}` : ""}
          </p>

          <h3 className="mt-1 text-xl font-semibold text-white">
            {destination.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {destination.category.slice(0, 3).map((category) => (
            <span
              key={category}
              className="rounded-full border border-border bg-surface-light px-2.5 py-1 text-[11px] capitalize text-muted"
            >
              {category}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
          {destination.description}
        </p>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-[11px] text-muted">Recommended stay</p>

            <p className="mt-1 text-xs font-medium text-white">
              {destination.recommendedDays
                ? `${destination.recommendedDays.min}–${destination.recommendedDays.max} days`
                : "Flexible"}
            </p>
          </div>

          <span className="text-sm font-medium text-white transition group-hover:text-primary">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}