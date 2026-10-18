
import Link from "next/link";
import Image from "next/image";
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
      className="home-section home-ai-cta relative isolate overflow-hidden border-t border-border"
      aria-labelledby="ai-cta-title"
    >
      <div
        aria-hidden="true"
        className="home-ai-cta__atmosphere pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="home-ai-cta__glow home-ai-cta__glow--teal absolute -right-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
        <div className="home-ai-cta__glow home-ai-cta__glow--mint absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="home-ai-cta__container mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="home-ai-cta__frame relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface-light/80 shadow-2xl shadow-black/[0.12] backdrop-blur-sm sm:rounded-[2.5rem]">
          <div
            aria-hidden="true"
            className="home-ai-cta__world-map pointer-events-none absolute inset-0"
          />

          <div
            aria-hidden="true"
            className="home-ai-cta__orbit home-ai-cta__orbit--outer pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-primary/10 sm:h-96 sm:w-96"
          />
          <div
            aria-hidden="true"
            className="home-ai-cta__orbit home-ai-cta__orbit--inner pointer-events-none absolute -right-8 -top-12 h-56 w-56 rounded-full border border-primary/10 sm:h-72 sm:w-72"
          />

          <div className="home-ai-cta__content relative grid items-center gap-10 p-5 sm:gap-12 sm:p-9 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:p-11 xl:gap-12 xl:p-14">
            {/* Copy and actions */}
            <div className="relative z-10">
              <div className="home-ai-cta__eyebrow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/80 px-3.5 py-2 text-[10px] font-semibold tracking-[0.14em] text-primary sm:text-xs">
                <Sparkles size={14} aria-hidden="true" />
                YOUR PERSONAL AI TRAVEL CONCIERGE
              </div>

              <h2
                id="ai-cta-title"
                className="mt-6 max-w-xl text-[clamp(2.25rem,4.4vw,3.65rem)] font-semibold leading-[1.08] tracking-[-0.055em] text-foreground sm:mt-7"
              >
                Your next journey
                <span className="home-ai-cta__title-accent mt-1 block">
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
                  className="home-ai-cta__primary home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Talk to TISA AI
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>

                <Link
                  href="/planner"
                  className="home-ai-cta__secondary home-secondary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
                >
                  Plan your trip
                  <ArrowDownRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 motion-reduce:transition-none"
                  />
                </Link>
              </div>

              <div className="home-ai-cta__trust-row mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted">
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

            {/* AI conversation preview with travel imagery */}
            <div className="home-ai-cta__scene relative mx-auto w-full max-w-[570px] lg:ml-auto lg:mr-0">
              <div className="home-ai-cta__destination-cards" aria-hidden="true">
                <div className="home-ai-cta__destination home-ai-cta__destination--mountains">
                  <Image
                    src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=78"
                    alt=""
                    fill
                    sizes="(max-width: 639px) 44vw, 190px"
                    quality={75}
                    className="object-cover"
                  />
                  <span className="home-ai-cta__destination-caption">
                    <Compass size={12} aria-hidden="true" />
                    Somewhere new
                  </span>
                </div>
                <div className="home-ai-cta__destination home-ai-cta__destination--flight">
                  <Image
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=78"
                    alt=""
                    fill
                    sizes="(max-width: 639px) 44vw, 190px"
                    quality={75}
                    className="object-cover"
                  />
                  <span className="home-ai-cta__destination-caption">
                    <Globe2 size={12} aria-hidden="true" />
                    Your next chapter
                  </span>
                </div>
              </div>

              <div className="home-ai-cta__chat-glow" aria-hidden="true" />
              <div data-theme-contrast="dark" className="home-ai-cta__chat-window relative z-10 mx-auto overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface shadow-xl shadow-black/20">
                {/* Window header */}
                <div className="home-ai-cta__chat-header flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="home-ai-cta__bot-mark flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary-soft text-primary">
                      <Bot size={22} aria-hidden="true" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">TISA AI</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Your travel companion
                      </p>
                    </div>
                  </div>

                  <div className="home-ai-cta__status inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-light px-2.5 py-1.5">
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
                <div className="home-ai-cta__conversation space-y-4 p-4 sm:space-y-5 sm:p-5">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    <span className="h-px flex-1 bg-border" />
                    A conversation starts here
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <div className="flex justify-end">
                    <div className="home-ai-cta__user-message max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3.5 text-sm leading-6 text-white shadow-lg shadow-primary/15">
                      I have ৳150k and 7 days. Where should I travel?
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="home-ai-cta__assistant-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Sparkles size={15} aria-hidden="true" />
                    </div>

                    <div className="home-ai-cta__assistant-message min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border bg-surface-light p-4">
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
                            className="home-ai-cta__suggestion flex items-center gap-2.5 rounded-xl border border-border/80 bg-surface px-3 py-2.5"
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
                  <div className="home-ai-cta__prompt flex items-center gap-3 rounded-xl border border-border bg-surface-light px-4 py-3">
                    <span className="flex-1 text-xs text-muted">
                      Tell us where you want to go...
                    </span>
                    <div className="home-ai-cta__send-mark flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                      <ArrowRight size={15} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="home-ai-cta__chat-footer flex items-center gap-2 border-t border-border bg-surface-light/70 px-4 py-3.5 sm:px-5">
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

              <div
                aria-hidden="true"
                className="home-ai-cta__globe-badge absolute -right-2 top-20 hidden h-12 w-12 items-center justify-center rounded-2xl border border-border/80 bg-surface shadow-lg sm:flex lg:-right-4"
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