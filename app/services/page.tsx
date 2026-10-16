
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  Plane,
  Sparkles,
} from "lucide-react";
import ServicesExplorer from "@/components/services/ServicesExplorer";

export const metadata = {
  title: "Travel Services | TISA Global",
  description:
    "Explore visa assistance, conferences, flights, accommodation, medical tourism, and international travel services with TISA Global.",
};

export default async function ServicesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_catalog")
    .select("id,name,slug,category,short_description,icon")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  const services = data ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Single unified services section */}
      <section
        id="our-services"
        className="scroll-mt-24 pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-12"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          {/* Services heading and compact assistance tools */}
          <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary sm:text-xs">
                <Compass className="h-3.5 w-3.5" />
                Find your way forward
              </p>

              <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] sm:text-3xl">
                Explore our services
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Choose a service or search by what you need.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Available services count */}
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-border/60 bg-surface/60 px-3 py-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Globe2 className="h-[18px] w-[18px]" />
                </span>

                <span>
                  <span className="block text-lg font-extrabold leading-tight">
                    {error ? "—" : services.length.toString().padStart(2, "0")}
                  </span>

                  <span className="block text-[11px] text-muted">
                    Available services
                  </span>
                </span>
              </div>

              {/* TISA AI shortcut */}
              <Link
                href="/ai"
                className="group inline-flex min-h-[56px] items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.06] px-3 py-2.5 transition duration-300 hover:border-primary/40 hover:bg-primary/[0.12] hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground transition group-hover:scale-105">
                  <Sparkles className="h-[18px] w-[18px]" />
                </span>

                <span>
                  <span className="block text-sm font-bold">
                    Need guidance?
                  </span>

                  <span className="block text-[11px] text-muted">
                    Ask TISA AI
                  </span>
                </span>

                <ArrowUpRight className="ml-1 h-4 w-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Service catalogue */}
          {error ? (
            <div
              role="alert"
              className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.04] p-6 sm:p-9"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Globe2 className="h-6 w-6" />
                </span>

                <div className="flex-1">
                  <h2 className="font-bold">
                    Services couldn’t be loaded
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-muted">
                    Please refresh the page or contact our team for assistance.
                  </p>
                </div>

                <Link
                  href="/request"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
                >
                  Contact TISA
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : services.length > 0 ? (
            <ServicesExplorer services={services} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center sm:py-16">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Compass className="h-7 w-7" />
              </span>

              <h2 className="mt-4 text-lg font-bold">
                Your next journey starts here.
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Our service catalogue is being updated. Tell us what you need,
                and our team will help you explore the next steps.
              </p>

              <Link
                href="/request"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5"
              >
                Request assistance
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Request assistance link */}
          <div className="mt-5 flex justify-end">
            <Link
              href="/request"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
            >
              Request assistance
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Compact premium CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="group relative isolate overflow-hidden rounded-[1.75rem] border border-primary/20 bg-slate-950 px-6 py-7 text-white shadow-[0_18px_55px_rgba(15,23,42,0.14)] sm:px-8 sm:py-8 lg:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-teal-500/20 via-slate-950 to-sky-500/15"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/[0.08] transition-transform duration-700 group-hover:scale-110"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 -top-14 h-44 w-44 rounded-full border border-dashed border-teal-300/15"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-teal-300 sm:grid">
                <Plane className="h-6 w-6" />
              </span>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300 sm:text-xs">
                  Your journey, your way
                </p>

                <h2 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
                  Have something specific in mind?
                </h2>

                <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-300">
                  Tell us your plans. We’ll help you find the right next step.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3 sm:pl-4">
              <Link
                href="/request"
                className="group/btn inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-teal-400 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-teal-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-teal-300"
              >
                Start a request
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>

              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Explore places
                <Globe2 className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
