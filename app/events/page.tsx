
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PremiumSelect from "@/components/events/PremiumSelect";
import { createClient } from "@/lib/supabase/server";
import {
    ArrowRight,
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    Globe2,
    MapPin,
    Search,
    Sparkles,
    X,
} from "lucide-react";

type EventsPageProps = {
    searchParams: Promise<{
        q?: string;
        country?: string;
        category?: string;
    }>;
};

function formatDate(value: string | null) {
    if (!value) return null;

    const parts = value.split("-").map(Number);

    if (
        parts.length !== 3 ||
        parts.some(Number.isNaN) ||
        parts[0] < 1 ||
        parts[1] < 1 ||
        parts[1] > 12 ||
        parts[2] < 1 ||
        parts[2] > 31
    ) {
        return value;
    }

    return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])));
}

function getUniqueSortedValues(
    items: Array<{ country: string | null; category: string | null }>,
    key: "country" | "category",
) {
    return [
        ...new Set(
            items
                .map((item) => item[key]?.trim())
                .filter((value): value is string => Boolean(value)),
        ),
    ].sort((a, b) => a.localeCompare(b));
}

export default async function EventsPage({
    searchParams,
}: EventsPageProps) {
    const params = await searchParams;

    const q = params.q?.trim() ?? "";
    const country = params.country?.trim() ?? "";
    const category = params.category?.trim() ?? "";

    const supabase = await createClient();

    let eventsQuery = supabase
        .from("events")
        .select(
            "id,title,slug,country,city,start_date,end_date,organizer_name,category,registration_status,last_verified_at",
        )
        .eq("verification_status", "verified")
        .neq("status", "cancelled")
        .order("start_date", { ascending: true })
        .limit(60);

    if (q) {
        eventsQuery = eventsQuery.ilike("title", `%${q}%`);
    }

    if (country) {
        eventsQuery = eventsQuery.eq("country", country);
    }

    if (category) {
        eventsQuery = eventsQuery.eq("category", category);
    }

    const [{ data: events, error }, { data: filterOptions }] =
        await Promise.all([
            eventsQuery,
            supabase
                .from("events")
                .select("country,category")
                .eq("verification_status", "verified")
                .neq("status", "cancelled"),
        ]);

    const options = filterOptions ?? [];
    const uniqueCountries = getUniqueSortedValues(options, "country");
    const uniqueCategories = getUniqueSortedValues(options, "category");

    const hasFilters = Boolean(q || country || category);

    const activeFilters = [
        q ? `"${q}"` : null,
        country || null,
        category || null,
    ].filter(Boolean);

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Ambient background */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-[12%] h-80 w-80 rounded-full bg-primary/[0.09] blur-[100px]" />
                <div className="absolute right-[-8rem] top-[30%] h-96 w-96 rounded-full bg-cyan-400/[0.06] blur-[110px]" />
            </div>

            {/* Hero */}
            <section className="relative">
                <div className="mx-auto max-w-7xl px-5 pb-9 pt-12 sm:px-6 sm:pb-12 sm:pt-16 lg:px-8 lg:pt-20">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary backdrop-blur-xl sm:text-xs">
                            <Globe2 className="h-3.5 w-3.5" />
                            Conferences & International Events
                        </div>

                        <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-7xl">
                            Find the opportunity.
                            <span className="mt-1 block bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text pb-2 text-transparent">
                                We help you get there.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
                            Discover verified international conferences and events. Explore
                            opportunities, then request help with registration, invitations,
                            visa guidance, flights, and travel arrangements.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted sm:text-sm">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Verified listings
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Globe2 className="h-4 w-4 text-primary" />
                                International opportunities
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and filters */}
            <section
                aria-label="Find events"
                className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-6 lg:px-8"
            >
                <form
                    action="/events"
                    method="GET"
                    className="rounded-2xl border border-border/80 bg-surface/75 p-3 shadow-[0_12px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-4"
                >
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                        {/* Search */}

                        {/* Search input */}
                        <label className="group flex h-11 min-w-0 items-center gap-2.5 rounded-xl border border-border/80 bg-background/70 px-3 transition-colors duration-200 hover:border-primary/30 focus-within:border-primary/50">
                            <Search className="h-4 w-4 shrink-0 text-muted transition-colors group-focus-within:text-primary" />

                            <span className="sr-only">Search events by title</span>

                            <input
                                type="search"
                                name="q"
                                defaultValue={q}
                                placeholder="Search conferences..."
                                className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent text-sm text-foreground outline-none ring-0 placeholder:text-muted/80 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                            />
                        </label>


                        {/* Country filter */}
                        <PremiumSelect
                            name="country"
                            label="Filter events by country"
                            placeholder="All countries"
                            value={country}
                            options={uniqueCountries}
                            icon="country"
                        />

                        {/* Category filter */}
                        <PremiumSelect
                            name="category"
                            label="Filter events by category"
                            placeholder="All categories"
                            value={category}
                            options={uniqueCategories}
                            icon="category"
                        />

                        {/* Search button */}
                        <button
                            type="submit"
                            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_rgba(13,148,136,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(13,148,136,0.25)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <Search className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            Search
                        </button>
                    </div>

                    {/* Active filter summary */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-1 pt-3">
                        <p className="text-xs leading-5 text-muted">
                            {hasFilters ? (
                                <>
                                    Showing results for
                                    <span className="ml-1.5 font-medium text-foreground">
                                        {activeFilters.join(" · ")}
                                    </span>
                                </>
                            ) : (
                                "Explore upcoming international opportunities"
                            )}
                        </p>

                        {hasFilters && (
                            <Link
                                href="/events"
                                className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
                                Clear filters
                            </Link>
                        )}
                    </div>
                </form>
            </section>

            {/* Event listings */}
            <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">
                            Discover & connect
                        </p>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                            Explore events
                        </h2>
                    </div>

                    <p className="text-xs text-muted sm:text-sm">
                        {error
                            ? "Events temporarily unavailable"
                            : `${events?.length ?? 0} ${events?.length === 1 ? "event" : "events"
                            } found`}
                    </p>
                </div>

                {error ? (
                    <div
                        role="alert"
                        className="rounded-2xl border border-border bg-surface/70 p-8 text-center backdrop-blur-xl"
                    >
                        <Globe2 className="mx-auto h-8 w-8 text-primary" />

                        <h3 className="mt-4 text-lg font-semibold">
                            We couldn’t load events right now.
                        </h3>

                        <p className="mt-2 text-sm text-muted">
                            Please try again in a little while.
                        </p>

                        <Link
                            href="/events"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            Try again
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : events && events.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                        {events.map((event) => {
                            const startDate = formatDate(event.start_date);
                            const endDate = formatDate(event.end_date);

                            return (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    className="group relative flex min-h-[255px] flex-col overflow-hidden rounded-[1.4rem] border border-border/80 bg-surface/65 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-surface/90 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-6"
                                >
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-primary/[0.04] blur-3xl transition duration-500 group-hover:bg-primary/[0.13]"
                                    />

                                    {/* Card header */}
                                    <div className="relative flex items-center justify-between gap-3">
                                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-300">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </span>

                                        <span className="max-w-[52%] truncate rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-[10px] font-medium text-muted">
                                            {event.category || "International event"}
                                        </span>
                                    </div>

                                    {/* Event title */}
                                    <h3 className="relative mt-5 line-clamp-2 text-lg font-bold leading-snug tracking-tight transition-colors duration-200 group-hover:text-primary sm:text-xl">
                                        {event.title}
                                    </h3>

                                    {event.organizer_name && (
                                        <p className="relative mt-2 truncate text-xs text-muted">
                                            Organized by {event.organizer_name}
                                        </p>
                                    )}

                                    {/* Event details */}
                                    <div className="relative mt-4 grid gap-2.5">
                                        <p className="flex items-start gap-2 text-sm text-muted">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                                            <span className="line-clamp-2">
                                                {[event.city, event.country]
                                                    .filter(Boolean)
                                                    .join(", ") || "International"}
                                            </span>
                                        </p>

                                        <p className="flex items-start gap-2 text-sm text-muted">
                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                                            <span>
                                                {startDate
                                                    ? `${startDate}${endDate ? ` – ${endDate}` : ""}`
                                                    : "Date to be confirmed"}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Card footer */}
                                    <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4 mt-5">
                                        <span className="min-w-0 truncate text-xs font-semibold text-primary sm:text-sm">
                                            {event.registration_status || "Explore event"}
                                        </span>

                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background/60 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground">
                                            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="rounded-[1.6rem] border border-border bg-surface/60 px-6 py-12 text-center shadow-sm backdrop-blur-xl sm:px-10 sm:py-16">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-primary">
                            {hasFilters ? (
                                <Search className="h-6 w-6" />
                            ) : (
                                <CalendarDays className="h-6 w-6" />
                            )}
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            {hasFilters
                                ? "No matching events found"
                                : "New opportunities are on the way"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                            {hasFilters
                                ? "Try a different search term or remove some filters to explore more verified events."
                                : "There are no verified events to display right now. Please check back later."}
                        </p>

                        {hasFilters && (
                            <Link
                                href="/events"
                                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
                            >
                                <X className="h-4 w-4" />
                                Clear all filters
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {/* Closing CTA */}
            <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
                <div className="relative isolate overflow-hidden rounded-[1.6rem] border border-primary/20 bg-surface/70 px-6 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9 sm:py-9">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.09] via-transparent to-cyan-400/[0.07]"
                    />

                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Your next opportunity
                        </div>

                        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                            Found an event worth attending?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                            Tell TISA what you’re planning, and explore the support you may
                            need for your international journey.
                        </p>
                    </div>

                    <Link
                        href="/request"
                        className="group mt-5 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:mt-0"
                    >
                        Request assistance
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
