
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  Globe2,
  Headset,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("service_catalog")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (!service) notFound();

  const description =
    service.description ||
    service.short_description ||
    "Explore this service and discover how TISA Global can help you plan your next international journey.";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-[10%] h-80 w-80 rounded-full bg-primary/[0.09] blur-[100px]" />
        <div className="absolute right-[-8rem] top-[35%] h-96 w-96 rounded-full bg-cyan-400/[0.07] blur-[110px]" />
      </div>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-muted"
        >
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/services"
            className="transition-colors hover:text-primary"
          >
            Services
          </Link>
          <span aria-hidden="true">/</span>
          <span className="max-w-[200px] truncate font-medium text-foreground">
            {service.name}
          </span>
        </nav>
      </div>

      {/* Main service detail */}
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 lg:pb-24">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_350px] lg:gap-12">
          {/* Primary content */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface/65 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur-2xl sm:rounded-[2rem] sm:p-10 lg:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/[0.09] blur-[80px]"
            />

            <div className="relative">
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3.5 py-2 text-xs font-semibold text-muted transition hover:border-primary/30 hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                All services
              </Link>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-[1.4rem] border border-primary/20 bg-primary/[0.09] text-4xl shadow-sm">
                  <span aria-hidden="true">{service.icon || "✦"}</span>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {service.category || "TISA Global Service"}
                </span>
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Your journey starts here
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {service.name}
                <span className="mt-2 block bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text pb-2 text-transparent">
                  Made simpler with TISA.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-muted sm:text-lg">
                {description}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/request?service=${encodeURIComponent(String(service.id))}`}
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_25px_rgba(13,148,136,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(13,148,136,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Request this service
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background/50 px-6 py-3 text-sm font-semibold transition hover:border-primary/30 hover:bg-surface"
                >
                  <Headset className="h-4 w-4 text-primary" />
                  Talk to TISA
                </Link>
              </div>

              <div className="my-9 h-px bg-gradient-to-r from-primary/30 via-border to-transparent sm:my-11" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">
                      Guidance for your plans
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Explore relevant options and understand the next steps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">
                      International opportunities
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      Get started with support tailored to your request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assistance sidebar */}
          <aside className="grid gap-5 sm:grid-cols-2 lg:sticky lg:top-28 lg:grid-cols-1">
            <div className="relative isolate overflow-hidden rounded-[1.6rem] border border-primary/20 bg-surface/75 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 -z-10 h-40 w-40 rounded-full bg-primary/[0.12] blur-3xl"
              />

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Need a hand?
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Let’s plan your next step.
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                Share your requirements with TISA Global and get help
                understanding the available options for this service.
              </p>

              <Link
                href={`/request?service=${encodeURIComponent(String(service.id))}`}
                className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Start your request
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="rounded-[1.6rem] border border-border/80 bg-surface/60 p-6 backdrop-blur-xl sm:p-7">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                How we can help
              </h2>

              <ul className="mt-5 grid gap-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-6 text-muted">
                    Understand your needs and travel goals.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-6 text-muted">
                    Explore suitable options and requirements.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm leading-6 text-muted">
                    Understand the next steps for your request.
                  </span>
                </li>
              </ul>

              <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-5 text-muted">
                Specific requirements, availability, fees, and outcomes depend
                on your selected service and circumstances.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* More discovery */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface/60 px-6 py-8 backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9 sm:py-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-cyan-400/[0.06]"
          />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">
              Keep exploring
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Your next opportunity could be closer than you think.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Discover other services or explore international destinations
              for your next journey.
            </p>
          </div>

          <div className="relative mt-5 flex shrink-0 flex-wrap gap-3 sm:mt-0">
            <Link
              href="/services"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold transition hover:border-primary/30"
            >
              All services
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/explore"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
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