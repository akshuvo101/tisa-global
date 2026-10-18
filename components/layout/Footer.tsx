
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  Headset,
  Plane,
  Sparkles,
} from "lucide-react";

import TisaBrandMark from "@/components/layout/TisaBrandMark";

const footerGroups = [
  {
    title: "Discover",
    icon: Compass,
    links: [
      { label: "Destinations", href: "/explore" },
      { label: "Travel Packages", href: "/packages" },
      { label: "Conferences & Events", href: "/events" },
      { label: "Articles", href: "/articles" },
    ],
  },
  {
    title: "Services",
    icon: Plane,
    links: [
      { label: "All Services", href: "/services" },
      { label: "Visa Assistance", href: "/services/visa-assistance" },
      { label: "Flight Tickets", href: "/services/flight-ticket" },
      { label: "Custom Assistance", href: "/request" },
    ],
  },
  {
    title: "Company",
    icon: Globe2,
    links: [
      { label: "About TISA", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "AI Travel Assistant", href: "/ai" },
      { label: "Plan Your Journey", href: "/planner" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-theme-contrast="dark"
      className="site-footer relative isolate overflow-hidden border-t border-white/15 text-white"
    >
      <Image
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=78"
        alt=""
        fill
        sizes="100vw"
        quality={75}
        className="site-footer__backdrop"
      />
      <div
        aria-hidden="true"
        className="site-footer__scrim pointer-events-none absolute inset-0"
      >
        <div className="site-footer__world-map absolute inset-0" />
        <div className="site-footer__ambient site-footer__ambient--teal absolute -right-20 -top-28 h-64 w-64 rounded-full blur-3xl" />
        <div className="site-footer__ambient site-footer__ambient--cyan absolute -bottom-28 left-[18%] h-56 w-56 rounded-full blur-3xl" />
      </div>

      <div className="site-footer__content relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="grid gap-9 md:grid-cols-[1.1fr_1.5fr] md:gap-10 lg:gap-14">
          {/* Brand */}
          <div className="site-footer__brand max-w-sm">
            <Link
              href="/"
              aria-label="TISA Global home"
              className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <TisaBrandMark />
              </span>

              <span className="flex flex-col">
                <span className="text-lg font-extrabold leading-none tracking-[-0.055em] sm:text-xl">
                  TISA <span className="site-footer__brand-accent">GLOBAL</span>
                </span>
                <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/65 sm:text-[9px]">
                  Explore · Connect · Experience
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/70">
              Explore international opportunities with personalized assistance
              for visas, flights, conferences, education, and your next journey.
            </p>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-cyan-300" />
                Global opportunities
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Headset className="h-3.5 w-3.5 text-cyan-300" />
                Personal assistance
              </span>
            </div>

            <Link
              href="/request"
              className="site-footer__request group mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-cyan-200/30 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transform-none motion-reduce:transition-none"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start an assistance request
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Navigation links */}
          <div className="site-footer__nav grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 sm:gap-x-6">
            {footerGroups.map((group, index) => {
              const GroupIcon = group.icon;

              return (
                <div
                  key={group.title}
                  className={`site-footer__nav-group ${index > 0 ? "sm:border-l sm:border-white/10 sm:pl-5 lg:pl-7" : ""} ${index === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                >
                  <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    <span className="site-footer__group-icon grid h-8 w-8 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10">
                      <GroupIcon className="h-4 w-4 text-cyan-200" />
                    </span>
                    {group.title}
                  </h2>

                  <ul className="mt-4 grid gap-3">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="site-footer__nav-link group inline-flex min-h-7 items-center gap-1 text-[12px] text-white/70 transition-colors duration-200 hover:text-cyan-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                        >
                          {link.label}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 text-cyan-300 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Small glass CTA */}
        <div className="site-footer__ai mt-9 grid gap-4 rounded-2xl border border-cyan-300/25 p-3.5 shadow-2xl backdrop-blur-xl sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-4 lg:mt-10 lg:grid-cols-[220px_minmax(0,1fr)_auto]">
          <div className="site-footer__ai-image relative h-28 overflow-hidden rounded-xl sm:h-[94px]">
            <Image
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=78"
              alt="Tropical island destination with clear blue water"
              fill
              sizes="(max-width: 639px) calc(100vw - 56px), 220px"
              quality={75}
              className="object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <span className="site-footer__ai-icon grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-cyan-200">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white sm:text-base">
                Have a destination in mind?
              </h2>
              <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">
                Let’s explore your next international journey.
              </p>
            </div>
          </div>

          <Link
            href="/ai"
            className="site-footer__ai-link inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full px-5 py-2.5 text-xs font-semibold text-slate-950 transition-all hover:-translate-y-0.5 sm:self-auto motion-reduce:transform-none motion-reduce:transition-none"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask TISA AI
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="site-footer__bottom mt-7 flex flex-col gap-3 border-t border-white/15 pt-5 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} <span className="font-semibold text-white">TISA Global</span>.
            All rights reserved.
          </p>

          <p className="site-footer__signoff leading-5 sm:border-l sm:border-cyan-300/40 sm:pl-5 sm:text-right">
            You find the opportunity.
            <span className="ml-1 font-medium text-cyan-200">
              TISA helps you get there.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}