
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Globe2,
  Sparkles,
} from "lucide-react";

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("service_catalog")
    .select("id,name,slug,category,short_description,icon")
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-primary/[0.10] blur-[100px]" />
          <div className="absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[90px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3.5 py-2 text-xs font-semibold tracking-wide text-primary shadow-sm backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                YOUR JOURNEY, OUR ASSISTANCE
              </div>

              <h1 className="mt-7 text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
                The world is open.
                <span className="mt-1 block bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text pb-2 text-transparent">
                  Let’s get you there.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                From visa guidance and flight bookings to international
                conferences and personalized travel support, find the services
                that move your plans forward.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#our-services"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_28px_rgba(13,148,136,0.20)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(13,148,136,0.30)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Explore our services
                  <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                </Link>

                <Link
                  href="/request"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-xl transition hover:border-primary/30 hover:bg-surface"
                >
                  Tell us what you need
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-muted sm:text-sm">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Personalized guidance
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Support for your next steps
                </span>
              </div>
            </div>

            {/* Hero information panel */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-cyan-400/10 blur-2xl"
              />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/20 bg-surface/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      Your next chapter
                    </p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                      One destination.
                      <br />
                      Many possibilities.
                    </h2>
                  </div>

                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Globe2 className="h-6 w-6" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted">
                  Tell us where you want to go and what you want to achieve.
                  We’ll help you explore the relevant services and next steps.
                </p>

                <div className="my-6 h-px bg-gradient-to-r from-primary/40 via-border to-transparent" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <Compass className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">
                      Explore options
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Find a service for your plans.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-semibold">
                      Plan your journey
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Get help with your next steps.
                    </p>
                  </div>
                </div>

                <Link
                  href="/ai"
                  className="group mt-5 inline-flex w-full items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/[0.07] px-4 py-3 text-sm font-semibold transition hover:border-primary/30 hover:bg-primary/[0.12]"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Ask the TISA AI assistant
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="our-services"
        className="relative mx-auto max-w-7xl scroll-mt-28 px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8"
      >
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              What we can help with
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Services for your next move.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Explore the available services and choose the support that fits
              your international plans.
            </p>
          </div>

          <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-2 text-xs font-medium text-muted backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {services?.length ?? 0} services available
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-border bg-surface/70 p-6 text-sm text-muted backdrop-blur-xl"
          >
            We couldn’t load the services right now. Please try again later or
            submit a request for assistance.
            <Link
              href="/request"
              className="ml-1 font-semibold text-primary underline-offset-4 hover:underline"
            >
              Contact TISA
            </Link>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group relative flex min-h-[245px] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface/65 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-surface/90 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/[0.06] blur-3xl transition duration-500 group-hover:bg-primary/[0.14]"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/[0.09] text-xl shadow-sm transition duration-300 group-hover:scale-105 group-hover:border-primary/30">
                    <span aria-hidden="true">
                      {service.icon || "✦"}
                    </span>
                  </div>

                  <span className="rounded-full border border-border/80 bg-background/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {service.category || "Travel service"}
                  </span>
                </div>

                <h3 className="relative mt-6 text-lg font-bold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
                  {service.name}
                </h3>

                <p className="relative mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {service.short_description ||
                    "Explore this service and discover how TISA Global can help with your international plans."}
                </p>

                <div className="relative mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="text-sm font-semibold text-primary">
                    Explore service
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 transition duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>

                <span className="sr-only">Service {index + 1}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-border bg-surface/65 px-6 py-12 text-center shadow-sm backdrop-blur-xl sm:px-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
              <Compass className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-xl font-bold">
              Your next journey starts with a conversation.
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Our service catalogue is being updated. Tell us what you’re
              planning, and we’ll help you explore your options.
            </p>
            <Link
              href="/request"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Request assistance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-primary/20 bg-surface/70 px-6 py-9 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:px-10 sm:py-11 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.10] via-transparent to-cyan-400/[0.08]"
          />
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Your journey, your way
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Have a plan that needs a little help?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              Share your goals with us. We’ll help you identify relevant
              services and understand the next steps.
            </p>
          </div>

          <div className="mt-6 flex shrink-0 flex-wrap gap-3 lg:mt-0">
            <Link
              href="/request"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Start a request
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background/50 px-5 py-3 text-sm font-semibold transition hover:border-primary/30 hover:bg-background"
            >
              Explore destinations
              <Globe2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}