
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  Globe2,
  Compass,
  FileCheck2,
  Headset,
  MapPinned,
  PlaneTakeoff,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const services = [
  {
    icon: MapPinned,
    number: "01",
    title: "Destination Discovery",
    description:
      "Explore international destinations with helpful travel information, estimated costs, and practical guidance for planning your journey.",
  },
  {
    icon: FileCheck2,
    number: "02",
    title: "Travel Documentation",
    description:
      "Understand passport, visa, and other travel document requirements so you can prepare with greater clarity.",
  },
  {
    icon: Compass,
    number: "03",
    title: "Travel Packages",
    description:
      "Discover travel packages and service options designed to help you plan your trip around your needs and budget.",
  },
  {
    icon: Headset,
    number: "04",
    title: "Travel Assistance",
    description:
      "Get guidance throughout the planning process, with a focus on useful information and a more coordinated travel experience.",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Clarity First",
    description:
      "Make travel information easier to understand, from planning costs to documentation requirements.",
  },
  {
    icon: Globe2,
    title: "A World of Possibilities",
    description:
      "Bring destinations and travel opportunities together in one accessible experience.",
  },
  {
    icon: Headset,
    title: "People at the Center",
    description:
      "Combine digital convenience with helpful, human-centered travel assistance.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative isolate border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[440px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.13] blur-[120px]" />
          <div className="absolute right-[-10%] top-20 h-72 w-72 rounded-full bg-cyan-400/[0.07] blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-12 lg:py-36">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              About TISA Global
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-7xl">
              Your next journey
              <span className="mt-2 block bg-gradient-to-r from-primary via-cyan-300 to-sky-400 bg-clip-text text-transparent">
                starts with clarity.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              TISA Global — International Travel Service Around The World — is
              building a more connected way to explore destinations, understand
              travel requirements, discover service options, and prepare for
              international journeys with confidence.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/explore"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Explore Destinations
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.07]"
              >
                Talk to Our Team
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                International destinations
              </span>
              <span className="inline-flex items-center gap-2">
                <PlaneTakeoff className="h-4 w-4 text-primary" />
                Smarter travel planning
              </span>
            </div>
          </div>

          {/* Visual element: no external image required */}
          <div className="relative mx-auto flex aspect-square w-full max-w-[460px] items-center justify-center">
            <div className="absolute inset-[5%] rounded-full border border-white/[0.08]" />
            <div className="absolute inset-[14%] rounded-full border border-dashed border-primary/25" />
            <div className="absolute inset-[25%] rounded-full border border-white/[0.08]" />

            <div className="absolute h-[72%] w-[72%] rounded-full bg-primary/[0.10] blur-3xl" />

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-primary/25 bg-gradient-to-br from-primary/20 via-slate-900 to-cyan-500/10 shadow-[0_0_100px_rgba(56,189,248,0.12)] sm:h-56 sm:w-56">
              <Globe2
                strokeWidth={0.8}
                className="h-28 w-28 text-cyan-300 sm:h-36 sm:w-36"
              />
            </div>

            <div className="absolute right-[2%] top-[19%] flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-xl backdrop-blur-xl sm:right-0 sm:p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Explore the world
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Discover new possibilities
                </p>
              </div>
            </div>

            <div className="absolute bottom-[15%] left-0 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 p-3 shadow-xl backdrop-blur-xl sm:p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Plan with clarity
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Information at every step
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Our Story
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Travel planning should feel simpler.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-muted sm:text-lg">
            <p>
              Planning an international trip can mean navigating unfamiliar
              destinations, estimating expenses, understanding visa
              requirements, and comparing different travel services.
            </p>
            <p>
              TISA Global is being developed to bring these essential parts of
              travel planning into a more organized digital experience. Our goal
              is to help travelers move from exploring an opportunity to
              preparing for a journey with better access to relevant
              information.
            </p>
            <p>
              By bringing destination discovery, documentation guidance,
              package information, and assistance together, we aim to make the
              planning process more understandable and convenient.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              What We Focus On
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Everything starts with a better plan.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              A connected travel-planning experience designed around the
              information and support travelers need.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.number}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.09] bg-slate-950/40 p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/[0.035] sm:p-8"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.09] text-primary transition group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-medium tracking-widest text-white/25">
                      {service.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-semibold text-white sm:text-2xl">
                    {service.title}
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-7 text-muted sm:text-base">
                    {service.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            What Guides Us
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built around the traveler.
          </h2>
          <p className="mt-4 leading-7 text-muted">
            The principles behind the experience we are working to create.
          </p>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div key={value.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-primary">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-white">
                  {value.title}
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/[0.13] via-slate-900/80 to-cyan-500/[0.06] px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Your Journey, Your Way
              </p>

              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                The world is waiting. Start planning.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-muted">
                Explore destinations and take the next step toward your
                international travel plans with TISA Global.
              </p>
            </div>

            <Link
              href="/explore"
              className="group inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 md:self-center"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}