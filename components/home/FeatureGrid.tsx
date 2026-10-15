
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Headset,
  Plane,
  Stamp,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    number: "01",
    title: "Conferences & Events",
    description:
      "Discover international conferences and get support with registration, invitation letters, visa guidance, flights, and accommodation.",
    href: "/events",
    action: "Explore events",
    accent: "teal",
  },
  {
    icon: Stamp,
    number: "02",
    title: "Visa Assistance",
    description:
      "Navigate tourist, business, student, medical, and conference visa requirements with structured guidance and document support.",
    href: "/services/visa-assistance",
    action: "Explore visa support",
    accent: "blue",
  },
  {
    icon: Plane,
    number: "03",
    title: "Flights & Travel",
    description:
      "Coordinate flights, accommodation, airport transfers, insurance, and other travel arrangements through one service request.",
    href: "/services/flight-ticket",
    action: "Explore travel help",
    accent: "violet",
  },
  {
    icon: Headset,
    number: "04",
    title: "Custom Assistance",
    description:
      "Have a unique or urgent international travel need? Tell us what you need, and our team will review your request.",
    href: "/request",
    action: "Talk to our team",
    accent: "amber",
  },
];

export default function FeatureGrid() {
  return (
    <section
      aria-labelledby="feature-grid-title"
      className="home-section relative isolate overflow-hidden border-t border-border"
    >
      {/* Decorative background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 -z-10 h-80 w-80 rounded-full bg-primary/[0.055] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        {/* Section introduction */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-light/70 px-3.5 py-2 text-xs font-semibold tracking-wide text-primary shadow-sm">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              YOUR JOURNEY, BETTER CONNECTED
            </div>

            <h2
              id="feature-grid-title"
              className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl"
            >
              International travel,
              <span className="block text-primary">
                made more manageable.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
              From discovering global opportunities to organizing essential
              travel details, get the guidance you need in one place.
            </p>
          </div>

          <p className="hidden max-w-[200px] pb-1 text-sm leading-6 text-muted md:block">
            One point of contact. Support for the journey ahead.
          </p>
        </div>

        {/* Service cards */}
        <div className="mt-9 grid gap-4 sm:mt-11 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {features.map(({ icon: Icon, ...feature }, index) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="home-feature-card group relative flex min-h-[290px] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface-light p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
              style={{
                animationDelay: `${index * 70}ms`,
              }}
            >
              {/* Subtle card highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.055] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
              />

              {/* Icon and index */}
              <div className="relative flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary-soft text-primary shadow-sm transition-[transform,background-color,border-color] duration-300 group-hover:scale-105 group-hover:border-primary/30 motion-reduce:transform-none motion-reduce:transition-none">
                  <Icon
                    aria-hidden="true"
                    className="h-6 w-6"
                    strokeWidth={1.7}
                  />
                </div>

                <span
                  aria-hidden="true"
                  className="pt-1 text-xs font-semibold tabular-nums tracking-[0.14em] text-muted/60"
                >
                  {feature.number}
                </span>
              </div>

              {/* Card content */}
              <div className="relative mt-7">
                <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {feature.description}
                </p>
              </div>

              {/* Action */}
              <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border/80 pt-5 mt-6">
                <span className="text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                  {feature.action}
                </span>

                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-[transform,color,border-color,background-color] duration-200 group-hover:translate-x-0.5 group-hover:border-primary/25 group-hover:bg-primary-soft group-hover:text-primary motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-5 text-muted sm:text-sm">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Sparkles aria-hidden="true" className="h-3 w-3" />
          </span>
          <span>
            Every journey is different. Start with the support you need.
          </span>
        </div>
      </div>
    </section>
  );
}