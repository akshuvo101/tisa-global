import Link from "next/link";

import type { Destination } from "@/types/destination";

type DestinationAICTAProps = {
  destination: Destination;
};

export default function DestinationAICTA({
  destination,
}: DestinationAICTAProps) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-surface px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          {/* Background accents */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-500/[0.08] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/[0.06] blur-3xl" />

          <div className="relative max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Plan with TISA Global
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Ready to turn {destination.name} into a real trip?
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Tell TISA Global where you are starting from, how long you want to
              travel, and what you want to spend. We’ll help you build a
              practical travel plan around this destination.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/ai?destination=${destination.id}`}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:bg-primary/90"
              >
                Ask TISA AI
              </Link>

              <Link
                href={`/planner?destination=${destination.id}`}
                className="rounded-xl border border-border bg-surface-light px-5 py-3 text-sm font-medium text-white transition hover:border-primary/30 hover:text-primary"
              >
                Build My Trip
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}