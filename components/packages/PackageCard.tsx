import Link from "next/link";
import Image from "next/image";
import { TravelPackage } from "@/types/packages";

type PackageCardProps = {
  packageData: TravelPackage;
};

const travelStyleLabel: Record<
  TravelPackage["travelStyle"],
  string
> = {
  budget: "Budget",
  balanced: "Balanced",
  comfort: "Comfort",
  luxury: "Luxury",
};

export default function PackageCard({
  packageData,
}: PackageCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
      {/* Image */}
      <Link
        href={`/packages/${packageData.id}`}
        className="block"
      >
        <div data-theme-contrast="dark" className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={packageData.imageUrl}
            alt={packageData.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {packageData.featured && (
            <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              Featured
            </span>
          )}

          <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {travelStyleLabel[packageData.travelStyle]}
          </span>

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/65">
              {packageData.country}
            </p>

            <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">
              {packageData.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
          <span>{packageData.durationDays} days</span>
          <span className="h-1 w-1 rounded-full bg-white/25" />
          <span>{packageData.durationNights} nights</span>
          <span className="h-1 w-1 rounded-full bg-white/25" />
          <span>From {packageData.departureCity}</span>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
          {packageData.description}
        </p>

        {/* Highlights */}
        <div className="mt-5 flex flex-wrap gap-2">
          {packageData.inclusions.slice(0, 3).map((item) => (
            <span
              key={item}
              className="rounded-lg border border-border bg-surface-light px-2.5 py-1.5 text-xs text-white/70"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs text-muted">
              From
            </p>

            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-semibold tracking-tight text-white">
                {packageData.currency === "BDT" ? "৳" : packageData.currency}{" "}
                {packageData.price.toLocaleString()}
              </span>

              {packageData.pricePerPerson && (
                <span className="text-xs text-muted">
                  / person
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/packages/${packageData.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
          >
            View package
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}