
"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find a conference, destination, service, or global opportunity that matches your plans.",
    label: "Explore your options",
    icon: Compass,
    accent: "teal",
  },
  {
    number: "02",
    title: "Tell TISA",
    description:
      "Share your destination, travel dates, deadlines, and the assistance you need.",
    label: "Submit your request",
    icon: ClipboardList,
    accent: "blue",
  },
  {
    number: "03",
    title: "We Review",
    description:
      "Our team reviews your requirements, explains the next steps, and guides you through the details.",
    label: "Review & coordination",
    icon: CheckCircle2,
    accent: "violet",
  },
  {
    number: "04",
    title: "Travel with Confidence",
    description:
      "Once you approve the quote, we coordinate the agreed services to help prepare for your journey.",
    label: "Prepare for departure",
    icon: PlaneTakeoff,
    accent: "mint",
  },
] as const;

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="home-journey relative isolate overflow-hidden border-t border-border"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="home-journey__glow home-journey__glow--one" />
        <div className="home-journey__glow home-journey__glow--two" />

        <div
          className="home-journey__grid absolute inset-0"
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="home-journey__eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-light/75 px-4 py-2 text-[10px] font-bold tracking-[0.16em] text-primary shadow-sm backdrop-blur-xl sm:text-xs">
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4"
            />
            YOUR JOURNEY, SIMPLIFIED
          </div>

          <h2
            id="how-it-works-title"
            className="home-journey__heading text-3xl font-semibold leading-[1.12] tracking-[-0.05em] text-foreground sm:text-4xl lg:text-5xl"
          >
            Four steps.
            <span className="home-journey__heading-accent block">
              One world of possibilities.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            From the first spark of an idea to the details of your departure,
            TISA helps you navigate the journey with greater clarity.
          </p>
        </div>

        {/* Journey timeline */}
        <div className="home-journey__timeline relative mt-12 sm:mt-16 lg:mt-20">
          {/* Animated desktop connector */}
          <div
            aria-hidden="true"
            className="home-journey__connector"
          >
            <span className="home-journey__connector-fill" />
            <span className="home-journey__connector-pulse" />
          </div>

          <ol className="home-journey__steps relative grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-5">
            {steps.map(({ icon: Icon, ...step }, index) => (
              <li
                key={step.number}
                className={`home-journey__step home-journey__step--${step.accent} group relative`}
                style={{
                  animationDelay: `${index * 120}ms`,
                }}
              >
                {/* Timeline node */}
                <div className="home-journey__node-wrap">
                  <span className="home-journey__node-ring" />
                  <span className="home-journey__node">
                    <span className="home-journey__node-inner" />
                  </span>
                </div>

                {/* Step panel */}
                <article className="home-journey__panel relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface-light/75 p-5 shadow-sm backdrop-blur-xl transition-[transform,border-color,box-shadow,background-color] duration-300 group-hover:-translate-y-1 group-hover:border-primary/35 group-hover:shadow-xl group-hover:shadow-black/[0.07] motion-reduce:transform-none motion-reduce:transition-none sm:p-6 lg:mt-8">
                  {/* Accent artwork */}
                  <div
                    aria-hidden="true"
                    className="home-journey__panel-glow"
                  />
                  <div
                    aria-hidden="true"
                    className="home-journey__panel-orbit"
                  />

                  {/* Top row */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="home-journey__icon-box grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary-soft text-primary shadow-sm transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none sm:h-14 sm:w-14">
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        strokeWidth={1.7}
                      />
                    </div>

                    <span className="home-journey__number select-none text-4xl font-semibold leading-none tracking-[-0.07em] sm:text-5xl">
                      {step.number}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="relative z-10 mt-7">
                    <p className="home-journey__step-kicker text-[10px] font-bold uppercase tracking-[0.17em] text-primary/80">
                      STEP {step.number}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom label */}
                  <div className="home-journey__step-footer relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-border/80 pt-4 mt-6">
                    <span className="text-xs font-medium leading-5 text-muted">
                      {step.label}
                    </span>

                    <span
                      aria-hidden="true"
                      className="home-journey__step-arrow grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted transition-[transform,color,border-color,background-color] duration-200 group-hover:translate-x-0.5 group-hover:border-primary/30 group-hover:bg-primary-soft group-hover:text-primary motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing prompt */}
        <div className="home-journey__closing mx-auto mt-10 flex max-w-3xl flex-col items-center justify-between gap-5 rounded-2xl border border-border/80 bg-surface-light/60 p-5 text-center shadow-sm backdrop-blur-xl sm:mt-12 sm:flex-row sm:px-6 sm:py-5 sm:text-left">
          <div className="flex items-start gap-3">
            <span className="home-journey__closing-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary-soft text-primary">
              <Sparkles
                aria-hidden="true"
                className="h-5 w-5"
              />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                Not sure where to start?
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
                Tell us your goal. We’ll help you understand the next step.
              </p>
            </div>
          </div>

          <Link
            href="/request"
            className="home-journey__cta group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
          >
            Start a request
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}