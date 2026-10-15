import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="home-hero relative isolate flex min-h-[640px] items-center overflow-hidden bg-transparent sm:min-h-[700px]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,14,24,0.22),rgba(4,14,24,0.08)_72%,transparent),linear-gradient(180deg,rgba(4,14,24,0.05),rgba(4,14,24,0.14))]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div data-theme-contrast="dark" className="max-w-3xl text-white">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-4 py-2 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md sm:text-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-teal-200" />
            Thoughtful travel, wherever life takes you
          </div>
          <h1 className="max-w-[13ch] text-5xl font-semibold leading-[1.02] tracking-[-0.06em] sm:text-6xl lg:text-[5.25rem]">
            The world is closer
            <span className="mt-2 block text-[#b9e7df]">with the right partner.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
            From a conference across the globe to a journey that changes
            everything, TISA brings the details, guidance, and people together
            so you can travel with confidence.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/request"
              className="home-primary-action inline-flex min-h-13 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold focus-visible:outline-offset-4"
            >
              Plan my journey
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="home-secondary-action inline-flex min-h-13 items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white"
            >
              Find inspiration
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/15 pt-5 text-xs font-medium text-white/75 sm:text-sm">
            <span>Personal travel guidance</span>
            <span>Visa &amp; document support</span>
            <span>Real people, every step</span>
          </div>
        </div>
      </div>
    </section>
  );
}
