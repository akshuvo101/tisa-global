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

export default async function EventsPage({ searchParams }: EventsPageProps) {
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

    const [
        { data: events, error: eventsError },
        { data: filterOptions, error: filtersError },
    ] = await Promise.all([
        eventsQuery,
        supabase
            .from("events")
            .select("country,category")
            .eq("verification_status", "verified")
            .neq("status", "cancelled"),
    ]);

    if (eventsError) {
        console.error("[Events Page] Failed to load events:", {
            message: eventsError.message,
            code: eventsError.code,
            details: eventsError.details,
            hint: eventsError.hint,
        });
    }

    if (filtersError) {
        console.error("[Events Page] Failed to load filter options:", {
            message: filtersError.message,
            code: filtersError.code,
            details: filtersError.details,
            hint: filtersError.hint,
        });
    }

    const options = filterOptions ?? [];
    const uniqueCountries = getUniqueSortedValues(options, "country");
    const uniqueCategories = getUniqueSortedValues(options, "category");

    const hasFilters = Boolean(q || country || category);

    const activeFilters = [
        q ? `"${q}"` : null,
        country || null,
        category || null,
    ].filter(Boolean);

    const eventCount = events?.length ?? 0;

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            {/* Subtle ambient background */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            >
                <div className="absolute -top-32 left-[10%] h-72 w-72 rounded-full bg-primary/[0.08] blur-[100px]" />
                <div className="absolute right-[-7rem] top-[25%] h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-[110px]" />
            </div>

            {/* Compact visual hero */}
            <section className="relative overflow-hidden">
                <div className="mx-auto grid max-w-7xl items-center gap-5 px-5 pb-6 pt-7 sm:px-6 sm:pb-8 sm:pt-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-8 lg:pb-9 lg:pt-12">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-primary sm:text-xs">
                            <Globe2 className="h-3.5 w-3.5" />
                            Verified international events
                        </div>

                        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] sm:text-4xl lg:text-[3.35rem]">
                            Find your next
                            <span className="block bg-gradient-to-r from-primary via-cyan-500 to-sky-400 bg-clip-text pb-1 text-transparent">
                                global opportunity.
                            </span>
                        </h1>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                            Discover international conferences and events. Get support with
                            registration, invitations, visa guidance and travel planning.
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted sm:gap-x-5 sm:text-sm">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                Verified listings
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Globe2 className="h-4 w-4 text-primary" />
                                Global destinations
                            </span>
                        </div>
                    </div>

                    {/* Decorative visual — no external image required */}
                    <div
                        aria-hidden="true"
                        className="relative hidden min-h-[190px] overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-primary/[0.10] via-surface/70 to-cyan-400/[0.10] lg:flex lg:items-center lg:justify-center"
                    >
                        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent [background-size:18px_18px]" />
                        <div className="absolute h-44 w-44 rounded-full border border-primary/20" />
                        <div className="absolute h-32 w-32 rounded-full border border-primary/25" />
                        <div className="absolute h-20 w-20 rounded-full border border-cyan-400/30" />
                        <div className="absolute h-44 w-44 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-primary/30">
                            <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.7)]" />
                        </div>
                        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-primary/20 bg-background/80 text-primary shadow-xl shadow-primary/10 backdrop-blur-xl">
                            <Globe2 className="h-8 w-8" />
                        </div>
                        <div className="absolute bottom-4 left-4 rounded-xl border border-border/70 bg-background/80 px-3 py-2 backdrop-blur-xl">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                Explore worldwide
                            </p>
                            <p className="mt-0.5 text-sm font-bold">Your next journey starts here</p>
                        </div>
                        <div className="absolute right-4 top-4 rounded-full border border-emerald-500/20 bg-background/80 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-600 backdrop-blur-xl dark:text-emerald-300">
                            <CheckCircle2 className="mr-1 inline h-3 w-3" />
                            Trusted events
                        </div>
                    </div>
                </div>
            </section>

            {/* Search and filters — immediately after hero */}
            <section
                aria-label="Find events"
                className="mx-auto max-w-7xl scroll-mt-24 px-5 sm:px-6 lg:px-8"
            >
                <form
                    action="/events"
                    method="GET"
                    className="rounded-2xl border border-border/80 bg-surface/85 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:p-4"
                >
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <label className="group flex h-11 min-w-0 items-center gap-2.5 rounded-xl border border-border/80 bg-background/75 px-3 transition-colors hover:border-primary/30 focus-within:border-primary/50">
                            <Search className="h-4 w-4 shrink-0 text-muted transition-colors group-focus-within:text-primary" />
                            <span className="sr-only">Search events by title</span>
                            <input
                                type="search"
                                name="q"
                                defaultValue={q}
                                placeholder="Search conferences..."
                                className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted/80 focus:ring-0"
                            />
                        </label>

                        <PremiumSelect
                            name="country"
                            label="Filter events by country"
                            placeholder="All countries"
                            value={country}
                            options={uniqueCountries}
                            icon="country"
                        />

                        <PremiumSelect
                            name="category"
                            label="Filter events by category"
                            placeholder="All categories"
                            value={category}
                            options={uniqueCategories}
                            icon="category"
                        />

                        <button
                            type="submit"
                            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                            Search
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-1 pt-3">
                        <p className="text-xs leading-5 text-muted">
                            {hasFilters ? (
                                <>
                                    Showing results for{" "}
                                    <span className="font-medium text-foreground">
                                        {activeFilters.join(" · ")}
                                    </span>
                                </>
                            ) : (
                                "Find your next conference, event or opportunity"
                            )}
                        </p>

                        {hasFilters && (
                            <Link
                                href="/events"
                                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear filters
                            </Link>
                        )}
                    </div>
                </form>
            </section>

            {/* Event listings — tighter spacing to show results sooner */}
            <section className="mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-primary sm:text-xs">
                            Discover & connect
                        </p>
                        <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                            Explore events
                        </h2>
                    </div>

                    <p className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/70 px-3 py-1.5 text-xs text-muted">
                        {!eventsError && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                        {eventsError
                            ? "Events temporarily unavailable"
                            : `${eventCount} ${eventCount === 1 ? "event" : "events"} found`}
                    </p>
                </div>

                {eventsError ? (
                    <div
                        role="alert"
                        className="rounded-2xl border border-border bg-surface/70 p-7 text-center backdrop-blur-xl"
                    >
                        <Globe2 className="mx-auto h-7 w-7 text-primary" />
                        <h3 className="mt-3 text-lg font-semibold">
                            We couldn’t load events right now.
                        </h3>
                        <p className="mt-1.5 text-sm text-muted">
                            Please try again in a little while.
                        </p>
                        <Link
                            href="/events"
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            Try again <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : events && events.length > 0 ? (
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {events.map((event) => {
                            const startDate = formatDate(event.start_date);
                            const endDate = formatDate(event.end_date);

                            return (
                                <Link
                                    key={event.id}
                                    href={`/events/${event.slug}`}
                                    className="group relative flex min-h-[225px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface/70 p-4 shadow-[0_6px_24px_rgba(15,23,42,0.035)] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-surface/95 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5"
                                >
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/[0.05] blur-3xl transition group-hover:bg-primary/[0.13]"
                                    />

                                    <div className="relative flex items-center justify-between gap-2">
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600 dark:text-emerald-300 sm:text-[10px]">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verified
                                        </span>

                                        <span className="max-w-[55%] truncate rounded-full border border-border/80 bg-background/60 px-2.5 py-1 text-[10px] font-medium text-muted">
                                            {event.category || "International event"}
                                        </span>
                                    </div>

                                    <h3 className="relative mt-4 line-clamp-2 text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-lg">
                                        {event.title}
                                    </h3>

                                    {event.organizer_name && (
                                        <p className="relative mt-1.5 truncate text-xs text-muted">
                                            Organized by {event.organizer_name}
                                        </p>
                                    )}

                                    <div className="relative mt-3.5 grid gap-2">
                                        <p className="flex items-start gap-2 text-xs leading-5 text-muted sm:text-sm">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                                            <span className="line-clamp-2">
                                                {[event.city, event.country].filter(Boolean).join(", ") ||
                                                    "International"}
                                            </span>
                                        </p>

                                        <p className="flex items-start gap-2 text-xs leading-5 text-muted sm:text-sm">
                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary/80" />
                                            <span>
                                                {startDate
                                                    ? `${startDate}${endDate ? ` – ${endDate}` : ""}`
                                                    : "Date to be confirmed"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3 mt-4">
                                        <span className="min-w-0 truncate text-xs font-semibold text-primary sm:text-sm">
                                            {event.registration_status || "Explore event"}
                                        </span>
                                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background/60 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground">
                                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border bg-surface/60 px-5 py-10 text-center shadow-sm backdrop-blur-xl sm:px-8 sm:py-12">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-primary">
                            {hasFilters ? (
                                <Search className="h-5 w-5" />
                            ) : (
                                <CalendarDays className="h-5 w-5" />
                            )}
                        </div>

                        <h3 className="mt-4 text-lg font-bold sm:text-xl">
                            {hasFilters
                                ? "No matching events found"
                                : "New opportunities are on the way"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                            {hasFilters
                                ? "Try another search term or remove a filter to explore more verified events."
                                : "There are no verified events to display right now. Please check back later."}
                        </p>

                        {hasFilters && (
                            <Link
                                href="/events"
                                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                                <X className="h-4 w-4" />
                                Clear all filters
                            </Link>
                        )}
                    </div>
                )}
            </section>

            {/* Compact closing CTA */}
            <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 sm:pb-16 lg:px-8">
                <div className="relative isolate overflow-hidden rounded-2xl border border-primary/20 bg-surface/70 px-5 py-6 backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-7">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.08] via-transparent to-cyan-400/[0.07]"
                    />

                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary sm:text-xs">
                            <Sparkles className="h-3.5 w-3.5" />
                            Your next opportunity
                        </div>
                        <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                            Need help attending an event?
                        </h2>
                        <p className="mt-1.5 text-sm leading-6 text-muted">
                            TISA can help you explore registration and international travel support.
                        </p>
                    </div>

                    <Link
                        href="/request"
                        className="group mt-4 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:mt-0"
                    >
                        Request assistance
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
