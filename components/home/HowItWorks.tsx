
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
      "Find a conference, destination, service, or travel opportunity that matches your plans.",
    icon: Compass,
    label: "Explore your options",
  },
  {
    number: "02",
    title: "Tell TISA",
    description:
      "Share your destination, travel dates, deadlines, and the services you need.",
    icon: ClipboardList,
    label: "Submit your request",
  },
  {
    number: "03",
    title: "We Review",
    description:
      "Our team reviews your requirements, explains the next steps, and requests documents when needed.",
    icon: CheckCircle2,
    label: "Review & coordination",
  },
  {
    number: "04",
    title: "Travel with Confidence",
    description:
      "Once you approve the quote, we coordinate the agreed services to help prepare for your journey.",
    icon: PlaneTakeoff,
    label: "Prepare for departure",
  },
];

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-title"
      className="home-section relative isolate overflow-hidden border-t border-border"
    >
      {/* Subtle background accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[min(700px,90vw)] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-light/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-primary shadow-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            YOUR JOURNEY, STEP BY STEP
          </div>

          <h2
            id="how-it-works-title"
            className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-4xl lg:text-5xl"
          >
            From your first idea
            <span className="block text-primary">
              to your next destination.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            International travel has many moving parts. Tell us what you need,
            and we will help you understand and coordinate the next steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-12 lg:mt-16">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2rem] hidden h-px bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 lg:block"
          />

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {steps.map(({ icon: Icon, ...step }, index) => (
              <li
                key={step.number}
                className="home-process-card group relative flex h-full flex-col rounded-[1.5rem] border border-border/80 bg-surface-light p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-black/[0.05] motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Icon and number */}
                <div className="relative flex items-center justify-between">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary-soft text-primary shadow-sm transition-[transform,background-color] duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                    <Icon
                      aria-hidden="true"
                      className="h-6 w-6"
                      strokeWidth={1.7}
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-3xl font-semibold tracking-[-0.06em] text-primary/[0.20] transition-colors duration-300 group-hover:text-primary/50"
                  >
                    {step.number}
                  </span>
                </div>

                {/* Step content */}
                <h3 className="mt-7 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {step.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                  {step.description}
                </p>

                {/* Supporting label */}
                <div className="mt-6 flex items-center justify-between gap-2 border-t border-border/80 pt-4">
                  <span className="text-xs font-medium leading-5 text-muted">
                    {step.label}
                  </span>

                  {index < steps.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary/60 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  ) : (
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Closing note */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-2 text-center text-sm leading-6 text-muted sm:mt-10">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <p>
            Not sure where to start? Begin with a request. We will help clarify
            what comes next.
          </p>
        </div>
      </div>
    </section>
  );
}