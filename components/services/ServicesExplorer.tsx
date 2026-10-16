
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  GraduationCap,
  HeartPulse,
  Hotel,
  Plane,
  Search,
  Sparkles,
  Ticket,
  WalletCards,
  X,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string;
  short_description: string | null;
  icon: string | null;
};

type Props = {
  services: Service[];
};

const categoryStyles: Record<string, { label: string; icon: typeof Plane; tone: string }> = {
  conferences: {
    label: "Conferences",
    icon: Ticket,
    tone: "from-violet-500/15 to-fuchsia-500/10 text-violet-600 dark:text-violet-300",
  },
  visa: {
    label: "Visa",
    icon: WalletCards,
    tone: "from-sky-500/15 to-cyan-500/10 text-sky-600 dark:text-sky-300",
  },
  flights: {
    label: "Flights & stays",
    icon: Plane,
    tone: "from-blue-500/15 to-indigo-500/10 text-blue-600 dark:text-blue-300",
  },
  medical: {
    label: "Medical",
    icon: HeartPulse,
    tone: "from-rose-500/15 to-pink-500/10 text-rose-600 dark:text-rose-300",
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    tone: "from-amber-500/15 to-orange-500/10 text-amber-600 dark:text-amber-300",
  },
  custom: {
    label: "Custom support",
    icon: Sparkles,
    tone: "from-teal-500/15 to-emerald-500/10 text-teal-600 dark:text-teal-300",
  },
};

function getCategory(category: string) {
  return categoryStyles[category.toLowerCase()] ?? {
    label: category.replace(/[-_]/g, " "),
    icon: BriefcaseBusiness,
    tone: "from-primary/15 to-sky-500/10 text-primary",
  };
}

function getServiceIcon(service: Service) {
  const slug = service.slug.toLowerCase();
  const category = service.category.toLowerCase();

  if (slug.includes("hotel") || slug.includes("accommodation")) return Hotel;
  if (slug.includes("conference") || slug.includes("invitation")) return Ticket;
  if (slug.includes("medical")) return HeartPulse;
  if (slug.includes("student")) return GraduationCap;
  if (slug.includes("visa")) return WalletCards;
  if (slug.includes("airport") || slug.includes("flight")) return Plane;
  if (category === "conferences") return Ticket;
  if (category === "medical") return HeartPulse;
  if (category === "education") return GraduationCap;
  if (category === "visa") return WalletCards;
  if (category === "flights") return Plane;

  return Sparkles;
}

function formatCategory(category: string) {
  return getCategory(category).label;
}

export default function ServicesExplorer({ services }: Props) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(services.map((service) => service.category.toLowerCase())),
    );

    return unique.sort((a, b) => {
      const preferred = [
        "conferences",
        "visa",
        "flights",
        "medical",
        "education",
        "custom",
      ];
      const aIndex = preferred.indexOf(a);
      const bIndex = preferred.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }, [services]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "all" ||
        service.category.toLowerCase() === activeCategory;

      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        (service.short_description ?? "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, activeCategory, search]);

  return (
    <div>
      {/* Search and filters */}
      <div className="mb-7 rounded-3xl border border-border/70 bg-background/75 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.035)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search visa, flights, conferences..."
              aria-label="Search services"
              className="min-h-12 w-full rounded-2xl border border-border bg-surface/70 pl-11 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted/80 focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-primary/10 hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-xs font-medium text-muted">
            Showing{" "}
            <span className="font-bold text-foreground">
              {filteredServices.length}
            </span>{" "}
            of {services.length} services
          </p>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            aria-pressed={activeCategory === "all"}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition duration-200 ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border bg-surface/60 text-muted hover:border-primary/30 hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            All services
          </button>

          {categories.map((category) => {
            const config = getCategory(category);
            const CategoryIcon = config.icon;
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold capitalize transition duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border border-border bg-surface/60 text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic service cards */}
      {filteredServices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filteredServices.map((service, index) => {
            const category = getCategory(service.category);
            const CategoryIcon = category.icon;
            const ServiceIcon = getServiceIcon(service);
            const customIcon =
              service.icon?.trim() && service.icon.trim() !== "✦"
                ? service.icon.trim()
                : null;

            return (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-[1.65rem] border border-border/75 bg-background/85 p-5 shadow-[0_8px_35px_rgba(15,23,42,0.035)] transition duration-300 ease-out hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_24px_55px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
              >
                {/* Card background accent */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${category.tone.split(" ").slice(0, 2).join(" ")} opacity-70 blur-3xl transition duration-500 group-hover:scale-150 group-hover:opacity-100`}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${category.tone} ring-1 ring-inset ring-black/[0.04] shadow-sm transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}
                  >
                    {customIcon ? (
                      <span className="text-2xl" aria-hidden="true">
                        {customIcon}
                      </span>
                    ) : (
                      <ServiceIcon className="h-6 w-6" strokeWidth={1.8} />
                    )}
                  </div>

                  <span className="inline-flex max-w-[55%] items-center gap-1.5 rounded-full border border-border/70 bg-surface/75 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                    <CategoryIcon className="h-3 w-3 shrink-0 text-primary" />
                    <span className="truncate">
                      {formatCategory(service.category)}
                    </span>
                  </span>
                </div>

                <h3 className="relative mt-6 text-lg font-extrabold leading-snug tracking-[-0.025em] transition-colors duration-200 group-hover:text-primary sm:text-xl">
                  {service.name}
                </h3>

                <p className="relative mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {service.short_description ||
                    "Explore this service and discover how TISA Global can support your international plans."}
                </p>

                <div className="relative mt-auto flex items-center justify-between gap-3 pt-7">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Explore service
                    <Check className="h-4 w-4 opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </span>

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-surface/80 transition duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>

                <span className="sr-only">
                  Open service {index + 1}: {service.name}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-background/65 px-6 py-12 text-center sm:py-16">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Search className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-bold">No matching services found</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
            Try another search term or explore all available services.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveCategory("all");
            }}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
