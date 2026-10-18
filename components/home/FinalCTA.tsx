import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  Globe2,
  PlaneTakeoff,
  Sparkles,
} from "lucide-react";

const journeySteps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find a conference, destination, service, or travel opportunity that matches your plans.",
    action: "Explore your options",
    icon: Compass,
    accent: "teal",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=78",
    imageAlt: "Traveler looking across a mountain landscape",
  },
  {
    number: "02",
    title: "Tell TISA",
    description:
      "Share your destination, travel dates, deadlines, and the services you need.",
    action: "Submit your request",
    icon: FileText,
    accent: "blue",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=78",
    imageAlt: "Travel documents being reviewed on a desk",
  },
  {
    number: "03",
    title: "We Review",
    description:
      "Our team reviews your requirements, explains the next steps, and requests documents when needed.",
    action: "Review & coordination",
    icon: CheckCircle2,
    accent: "violet",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=78",
    imageAlt: "Team reviewing details together on a laptop",
  },
  {
    number: "04",
    title: "Travel with Confidence",
    description:
      "Once you approve the quote, we coordinate the agreed services to help prepare for your journey.",
    action: "Prepare for departure",
    icon: PlaneTakeoff,
    accent: "amber",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=78",
    imageAlt: "Airplane wing above the clouds",
  },
];

export default function FinalCTA() {
  return (
    <section
      className="home-final-cta relative isolate overflow-hidden border-t border-border"
      aria-labelledby="final-cta-title"
    >
      <div aria-hidden="true" className="home-final-cta__scrim absolute inset-0" />
      <div
        aria-hidden="true"
        className="home-final-cta__flight-path pointer-events-none absolute"
      >
        <span className="home-final-cta__flight-plane">
          <PlaneTakeoff className="h-7 w-7" />
        </span>
      </div>

      <div
        data-theme-contrast="dark"
        className="relative z-10 mx-auto max-w-7xl px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-slate-950/35 px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-white/85 shadow-sm backdrop-blur-md sm:text-xs">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-teal-200" />
            HOW YOUR TISA JOURNEY WORKS
          </div>

          <h2
            id="final-cta-title"
            className="mt-5 text-[clamp(2rem,4.6vw,3.7rem)] font-semibold leading-[1.08] tracking-[-0.05em]"
          >
            From your first idea
            <span className="home-final-cta__title-accent block">
              to your next destination.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            International travel has many moving parts. Tell us what you need,
            and we will help you understand and coordinate the next steps.
          </p>
        </div>

        <ol
          aria-label="How your journey with TISA works"
          className="home-final-cta__steps relative mt-9 grid list-none grid-cols-1 gap-4 p-0 sm:mt-11 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-5"
        >
          {journeySteps.map(({ icon: Icon, ...step }, index) => (
            <li
              key={step.number}
              className={`home-final-cta__step home-final-cta__step--${step.accent} group relative flex min-h-[330px] flex-col overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_18px_42px_rgba(0,0,0,0.25)] transition-[transform,border-color,box-shadow] duration-250 sm:p-5`}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <Image
                src={step.image}
                alt={step.imageAlt}
                fill
                sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(50vw - 32px), 280px"
                quality={75}
                className="home-final-cta__step-image object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
              />
              <div aria-hidden="true" className="home-final-cta__step-shade absolute inset-0" />
              <div aria-hidden="true" className="home-final-cta__step-art absolute inset-0" />
              <div aria-hidden="true" className="home-final-cta__step-contour absolute inset-0" />

              <div className="home-final-cta__step-content relative z-10 flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <span className="home-final-cta__step-icon grid h-11 w-11 place-items-center rounded-full border shadow-[0_0_18px_currentColor] transition-transform duration-250 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <span
                    aria-hidden="true"
                    className="home-final-cta__step-number text-sm font-semibold tabular-nums tracking-wide"
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-white/80">
                  {step.description}
                </p>

                <div className="home-final-cta__step-action mt-4 flex min-h-9 items-center justify-between gap-2 border-t pt-3">
                  <span className="text-xs font-medium leading-5 text-white/90">
                    {step.action}
                  </span>
                  {index < journeySteps.length - 1 ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="home-final-cta__step-arrow h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                    />
                  ) : (
                    <CheckCircle2
                      aria-hidden="true"
                      className="home-final-cta__step-arrow h-4 w-4 shrink-0"
                    />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
          <Link
            href="/request"
            className="home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
          >
            Start a Travel Request
            <ArrowRight
              size={17}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>

          <Link
            href="/events"
            className="home-secondary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
          >
            <CalendarDays size={16} aria-hidden="true" />
            Explore Conferences
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <div className="home-final-cta__note mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-center text-xs text-white/70 sm:mt-9 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-emerald-300"
            />
            Tell us what you need
          </span>
          <span className="hidden h-3 w-px bg-white/20 sm:block" />
          <span className="inline-flex items-center gap-2">
            <Globe2 size={14} aria-hidden="true" className="text-teal-200" />
            International travel support
          </span>
        </div>
      </div>
    </section>
  );
}
