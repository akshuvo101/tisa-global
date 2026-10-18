
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Compass, MapPin, Sparkles } from "lucide-react";

import { destinations } from "@/lib/data/destination";

export default function FeaturedDestinations() {
  const featuredDestinations = destinations.filter(
    (destination) => destination.featured,
  );

  return (
    <section
      aria-labelledby="featured-destinations-title"
      className="home-section relative overflow-hidden border-t border-border"
    >
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 -z-10 h-80 w-80 rounded-full bg-teal-400/[0.06] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        {/* Section heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="home-featured-reveal mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-light/70 px-3.5 py-2 text-xs font-semibold tracking-wide text-primary shadow-sm">
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4"
              />
              A LITTLE INSPIRATION FOR THE ROAD
            </div>

            <h2
              id="featured-destinations-title"
              className="home-featured-reveal home-featured-delay-1 text-3xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl"
            >
              Find your next{" "}
              <span className="home-featured-heading-accent">somewhere.</span>
            </h2>

            <p className="home-featured-reveal home-featured-delay-2 mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              Explore a few remarkable places to begin. When one feels right,
              discover more details or ask TISA for help planning.
            </p>
          </div>

          <Link
            href="/explore"
            className="group home-featured-reveal home-featured-explore-link inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-border bg-surface-light/70 px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:self-auto motion-reduce:transform-none motion-reduce:transition-none"
          >
            Explore all destinations
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>

        {/* Destination grid */}
        {featuredDestinations.length > 0 ? (
          <div className="mt-9 grid gap-5 sm:mt-11 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featuredDestinations.map((destination, index) => (
              <Link
                key={destination.id}
                href={`/destinations/${destination.id}`}
                className="home-featured-reveal home-destination-card group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface-light shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
                style={
                  {
                    "--destination-delay": `${Math.min(index, 5) * 80}ms`,
                  } as React.CSSProperties
                }
              >
                {/* Destination image */}
                <div
                  data-theme-contrast="dark"
                  className="home-destination-card__image relative aspect-[16/10] overflow-hidden bg-slate-900"
                >
                  <Image
                    src={destination.imageUrl}
                    alt={`${destination.name}, ${destination.country}`}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 44px), (max-width: 1279px) calc(33.333vw - 32px), 395px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none"
                  />

                  {/* Readable image overlays */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-slate-950/10"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-teal-950/10 via-transparent to-transparent"
                  />

                  {/* Featured badge */}
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/35 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                    <Sparkles
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-teal-200"
                    />
                    Featured
                  </div>

                  {/* Country and destination */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80">
                        <MapPin
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-teal-200"
                        />
                        {destination.country}
                      </p>

                      <h3 className="mt-1.5 text-2xl font-semibold tracking-tight text-white sm:text-[1.7rem]">
                        {destination.name}
                      </h3>
                    </div>

                    <span
                      aria-hidden="true"
                      className="mb-0.5 flex h-10 w-10 shrink-0 translate-y-1 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 shadow-lg backdrop-blur-md transition-[transform,opacity,background-color] duration-300 group-hover:translate-y-0 group-hover:bg-white/20 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="home-destination-card__content flex flex-1 flex-col p-4 sm:p-5">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {destination.category.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] font-medium capitalize text-muted"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
                    {destination.description}
                  </p>

                  {/* Bottom information */}
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/80 pt-4 mt-5">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-muted">
                      <CalendarDays
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-primary"
                      />
                      <span>
                        {destination.recommendedDays
                          ? `${destination.recommendedDays.min}–${destination.recommendedDays.max} days`
                          : "Flexible duration"}
                      </span>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                      Discover
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-surface-light/60 px-6 py-12 text-center">
            <Compass
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-muted"
            />
            <p className="mt-3 font-medium text-foreground">
              New destinations are on the way.
            </p>
            <p className="mt-1 text-sm text-muted">
              Explore our destinations to find inspiration for your next trip.
            </p>
            <Link
              href="/explore"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Explore destinations
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
