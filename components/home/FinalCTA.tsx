
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  MoveUpRight,
  Sparkles,
} from "lucide-react";

export default function FinalCTA() {
  return (
    <section
      className="home-section relative isolate overflow-hidden border-t border-border"
      aria-labelledby="final-cta-title"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface-light/85 shadow-2xl shadow-black/[0.08] backdrop-blur-sm sm:rounded-[2.5rem]">
          {/* Ambient lighting */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-28 -top-36 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-secondary/10 blur-[110px]" />

            <div className="absolute right-0 top-0 hidden h-full w-[42%] lg:block">
              <div className="absolute right-12 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-primary/10" />
              <div className="absolute right-24 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-primary/10" />
              <div className="absolute right-36 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-primary/10" />
              <div className="absolute right-[8.5rem] top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft/80 text-primary shadow-xl shadow-primary/10">
                <Globe2 size={28} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/80 px-4 py-2 text-xs font-semibold tracking-wide text-primary">
                <Sparkles size={14} aria-hidden="true" />
                YOUR JOURNEY, YOUR WAY
              </div>

              <h2
                id="final-cta-title"
                className="mt-7 text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl"
              >
                Wherever life takes you,
                <span className="mt-2 block text-primary">
                  let&apos;s plan the way.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
                From international conferences and visa guidance to flights
                and personalized travel support, tell us what you need.
                We&apos;ll review your request and help you understand the
                next steps.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/request"
                  className="home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start a Travel Request
                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/events"
                  className="home-secondary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/70 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <Compass size={16} aria-hidden="true" />
                  Explore Conferences
                  <MoveUpRight
                    size={15}
                    aria-hidden="true"
                    className="text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              {/* Closing note */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-secondary"
                  />
                  Tell us what you need
                </span>

                <span className="hidden h-3 w-px bg-border sm:block" />

                <span className="inline-flex items-center gap-2">
                  <Globe2 size={14} aria-hidden="true" />
                  International travel support
                </span>
              </div>
            </div>

            {/* Corner detail */}
            <div
              aria-hidden="true"
              className="absolute bottom-7 right-8 hidden items-center gap-2 text-xs font-medium tracking-wide text-muted/70 xl:flex"
            >
              TISA GLOBAL
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}