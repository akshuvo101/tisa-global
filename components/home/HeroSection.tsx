import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Compass,
  FileText,
  Headset,
  Package,
  Plane,
  Sparkles,
  UsersRound,
} from "lucide-react";

const orbitServices = [
  {
    title: "Travel",
    description: "Flights, visas & documents",
    href: "/services",
    icon: Plane,
    position: "travel",
  },
  {
    title: "Packages",
    description: "Discover travel experiences",
    href: "/packages",
    icon: Package,
    position: "packages",
  },
  {
    title: "Events",
    description: "Global events & opportunities",
    href: "/events",
    icon: CalendarDays,
    position: "events",
  },
  {
    title: "Conferences",
    description: "Find global conferences",
    href: "/events",
    icon: UsersRound,
    position: "conferences",
  },
] as const;

export default function HeroSection() {
  return (
    <section className="home-hero relative isolate flex min-h-[640px] items-center overflow-hidden bg-transparent sm:min-h-[700px]">
      <div aria-hidden="true" className="home-hero__scrim absolute inset-0" />
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,.72fr)] xl:gap-14 xl:px-10 xl:pb-24 xl:pt-24">
        <div data-theme-contrast="dark" className="home-hero__copy min-w-0 text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-4 py-2 text-xs font-medium tracking-wide text-white/90 shadow-sm backdrop-blur-md sm:mb-7 sm:text-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-teal-200" />
            Thoughtful travel, wherever life takes you
          </div>

          <h1 className="max-w-[13ch] text-[clamp(2.7rem,6.2vw,5.4rem)] font-semibold leading-[1.01] tracking-[-0.06em]">
            The world is closer
            <span className="mt-2 block text-[#b9e7df]">
              with the right partner.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:mt-7 sm:text-lg sm:leading-8">
            Get personal travel assistance and discover global opportunities,
            with practical guidance from your first idea to the details ahead.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap">
            <Link
              href="/request"
              className="home-primary-action group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
            >
              Plan my journey
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
            <Link
              href="/ai"
              className="home-secondary-action inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4 text-teal-200" />
              Ask TISA AI
            </Link>
          </div>

          <Link
            href="/explore"
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-white/80 underline decoration-white/35 underline-offset-4 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none"
          >
            Explore destinations
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 text-xs font-medium text-white/80 sm:mt-11 sm:gap-x-7 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <Compass aria-hidden="true" className="h-4 w-4 text-teal-200" />
              Personal travel guidance
            </span>
            <span className="inline-flex items-center gap-2">
              <FileText aria-hidden="true" className="h-4 w-4 text-teal-200" />
              Visa &amp; document support
            </span>
            <span className="inline-flex items-center gap-2">
              <Headset aria-hidden="true" className="h-4 w-4 text-teal-200" />
              Human assistance
            </span>
          </div>
        </div>

        <aside className="home-hero__orbit-wrap mx-auto w-full max-w-[470px] xl:ml-auto xl:mr-0">
          <nav aria-label="Explore TISA Global services" className="home-hero__orbit">
            <div aria-hidden="true" className="home-hero__orbit-ring home-hero__orbit-ring--outer" />
            <div aria-hidden="true" className="home-hero__orbit-ring home-hero__orbit-ring--inner" />

            <Link
              href="/ai"
              className="home-hero__ai-hub group"
              aria-label="Open TISA AI, your intelligent travel companion"
            >
              <span className="home-hero__ai-hub-icon">
                <Sparkles aria-hidden="true" className="h-6 w-6" />
              </span>
              <span className="home-hero__ai-hub-title">TISA AI</span>
              <span className="home-hero__ai-hub-subtitle">
                Your intelligent
                <br />
                travel companion
              </span>
            </Link>

            {orbitServices.map(({ title, description, href, icon: Icon, position }) => (
              <Link
                key={title}
                href={href}
                className={`home-hero__service-card home-hero__service-card--${position} group`}
              >
                <span className="home-hero__service-icon">
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <span className="home-hero__service-copy">
                  <span className="home-hero__service-title">{title}</span>
                  <span className="home-hero__service-description">{description}</span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="home-hero__service-arrow h-3.5 w-3.5 shrink-0"
                />
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </section>
  );
}
