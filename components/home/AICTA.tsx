
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  Bot,
  Check,
  Compass,
  Globe2,
  Sparkles,
} from "lucide-react";

const suggestions = [
  "Find a trip under ৳150k",
  "Explore visa-friendly destinations",
  "Plan a 7-day getaway",
];

export default function AICTA() {
  return (
    <section
      className="home-section relative isolate overflow-hidden border-t border-border"
      aria-labelledby="ai-cta-title"
    >
      {/* Atmospheric accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface-light/80 shadow-2xl shadow-black/[0.08] backdrop-blur-sm sm:rounded-[2.5rem]">
          {/* Decorative background grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-primary/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-12 h-56 w-56 rounded-full border border-primary/10 sm:h-72 sm:w-72"
          />

          <div className="relative grid items-center gap-12 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:p-14 xl:gap-16 xl:p-16">
            {/* Copy and actions */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-primary">
                <Sparkles size={14} aria-hidden="true" />
                YOUR PERSONAL AI TRAVEL CONCIERGE
              </div>

              <h2
                id="ai-cta-title"
                className="mt-7 max-w-xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.5rem]"
              >
                Your next journey
                <span className="mt-1 block text-primary">
                  starts with a question.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-sm leading-7 text-muted sm:text-base sm:leading-8">
                Dreaming of somewhere new? Share your budget, dates, and travel
                style with TISA AI. Explore destinations, understand your
                options, and start shaping a trip that works for you.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/ai"
                  className="home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Talk to TISA AI
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/planner"
                  className="home-secondary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  Plan your trip
                  <ArrowDownRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                  />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <Check size={12} aria-hidden="true" />
                  </span>
                  Built around your preferences
                </span>

                <span className="inline-flex items-center gap-2">
                  <Globe2 size={15} aria-hidden="true" />
                  Explore worldwide
                </span>
              </div>
            </div>

            {/* AI conversation preview */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
              {/* Ambient glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-primary/10 blur-2xl"
              />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-xl shadow-black/10">
                {/* Window header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary-soft text-primary">
                      <Bot size={22} aria-hidden="true" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        TISA AI
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Your travel companion
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-2.5 py-1.5">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-secondary"
                    />
                    <span className="text-[10px] font-medium text-muted">
                      AI assistant
                    </span>
                  </div>
                </div>

                {/* Conversation */}
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    <span className="h-px flex-1 bg-border" />
                    A conversation starts here
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3.5 text-sm leading-6 text-white shadow-lg shadow-primary/15">
                      I have ৳150k and 7 days. Where should I travel?
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Sparkles size={15} aria-hidden="true" />
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-surface-light p-4">
                      <p className="text-sm font-medium leading-6 text-foreground">
                        Let&apos;s find your kind of adventure.
                      </p>

                      <p className="mt-1.5 text-xs leading-6 text-muted">
                        We can explore destinations based on your budget,
                        travel dates, visa requirements, and the experiences
                        you love.
                      </p>

                      <div className="mt-4 space-y-2">
                        {suggestions.map((suggestion) => (
                          <div
                            key={suggestion}
                            className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-surface px-3 py-2.5"
                          >
                            <Compass
                              size={14}
                              className="shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span className="text-xs leading-5 text-foreground">
                              {suggestion}
                            </span>
                            <ArrowRight
                              size={13}
                              className="ml-auto shrink-0 text-muted"
                              aria-hidden="true"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prompt preview */}
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-light px-4 py-3">
                    <span className="flex-1 text-xs text-muted">
                      Tell us where you want to go...
                    </span>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                      <ArrowRight size={15} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 border-t border-border bg-surface-light/70 px-5 py-3.5 sm:px-6">
                  <Sparkles
                    size={13}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-[10px] leading-5 text-muted">
                    Explore ideas. Review requirements. Plan with confidence.
                  </p>
                </div>
              </div>

              {/* Floating destination accent */}
              <div
                aria-hidden="true"
                className="absolute -right-2 top-20 hidden h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-surface shadow-lg sm:flex lg:-right-4"
              >
                <Globe2 size={21} className="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}