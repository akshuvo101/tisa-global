
import Link from "next/link";
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
    <footer className="relative isolate overflow-hidden border-t border-white/15 bg-surface/55 text-foreground shadow-[0_-12px_50px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      {/* Glass background and soft ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-28 left-[18%] h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-primary/[0.04]" />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-9 lg:px-8">
        {/* Compact main content */}
        <div className="grid gap-8 md:grid-cols-[1.1fr_1.5fr] md:gap-10 lg:gap-14">
          {/* Brand */}
          <div className="max-w-sm">
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
                  TISA <span className="text-primary">GLOBAL</span>
                </span>
                <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted sm:text-[9px]">
                  Explore · Connect · Experience
                </span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-[13px] leading-6 text-muted">
              Explore international opportunities with personalized assistance
              for visas, flights, conferences, education, and your next journey.
            </p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary" />
                Global opportunities
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Headset className="h-3.5 w-3.5 text-primary" />
                Personal assistance
              </span>
            </div>

            <Link
              href="/request"
              className="group mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[0_4px_18px_rgba(13,148,136,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_7px_24px_rgba(13,148,136,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Start an assistance request
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Navigation links */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 sm:gap-x-6">
            {footerGroups.map((group, index) => {
              const GroupIcon = group.icon;

              return (
                <div
                  key={group.title}
                  className={index === 2 ? "col-span-2 sm:col-span-1" : ""}
                >
                  <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                    <GroupIcon className="h-3.5 w-3.5 text-primary" />
                    {group.title}
                  </h2>

                  <ul className="mt-3 grid gap-2.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1 text-[12px] text-muted transition-colors duration-200 hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {link.label}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-3 w-3 shrink-0 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
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
        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.035]">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">
                Have a destination in mind?
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Let’s explore your next international journey.
              </p>
            </div>
          </div>

          <Link
            href="/ai"
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary/15 sm:self-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ask TISA AI
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col gap-2.5 border-t border-border/60 pt-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} <span className="font-semibold text-foreground">TISA Global</span>.
            All rights reserved.
          </p>

          <p className="leading-5 sm:text-right">
            You find the opportunity.
            <span className="ml-1 font-medium text-foreground">
              TISA helps you get there.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}