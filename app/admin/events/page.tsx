import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateEventForm from "@/components/admin/CreateEventForm";
// import CreateEventForm from "@/components/admin/CreateEventForm";

type SearchParams = {
  q?: string;
  verification?: string;
  status?: string;
  category?: string;
  eventType?: string;
  timing?: string;
  page?: string;
};

const PAGE_SIZE = 20;

const verificationOptions = [
  "unverified",
  "under_review",
  "verified",
  "needs_reverification",
  "expired",
];

const statusOptions = [
  "draft",
  "published",
  "cancelled",
  "archived",
];

function formatLabel(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string | null | undefined) {
  if (!value) return "TBC";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function verificationClass(status: string | null | undefined) {
  switch (status) {
    case "verified":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "under_review":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "needs_reverification":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "expired":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    default:
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }
}

function statusClass(status: string | null | undefined) {
  switch (status) {
    case "published":
      return "text-emerald-300";

    case "cancelled":
      return "text-rose-300";

    case "archived":
      return "text-slate-500";

    default:
      return "text-slate-400";
  }
}

function buildQuery(params: URLSearchParams) {
  const query = params.toString();

  return query ? `/admin/events?${query}` : "/admin/events";
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  const page = Math.max(1, Number(params.page) || 1);

  const search = params.q?.trim() || "";
  const verification = params.verification || "all";
  const status = params.status || "all";
  const category = params.category || "all";
  const eventType = params.eventType || "all";
  const timing = params.timing || "all";

  let query = supabase
    .from("events")
    .select(
      `
        id,
        title,
        slug,
        country,
        city,
        start_date,
        end_date,
        organizer_name,
        event_type,
        category,
        registration_status,
        status,
        verification_status,
        last_verified_at,
        created_at
      `,
      { count: "exact" },
    );

  if (search) {
    const safeSearch = search.replace(/,/g, " ");

    query = query.or(
      [
        `title.ilike.%${safeSearch}%`,
        `country.ilike.%${safeSearch}%`,
        `city.ilike.%${safeSearch}%`,
        `organizer_name.ilike.%${safeSearch}%`,
      ].join(","),
    );
  }

  if (verification !== "all") {
    query = query.eq("verification_status", verification);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (category !== "all") {
    query = query.eq("category", category);
  }

  if (eventType !== "all") {
    query = query.eq("event_type", eventType);
  }

  const today = new Date().toISOString().slice(0, 10);

  if (timing === "upcoming") {
    query = query.gte("start_date", today);
  }

  if (timing === "past") {
    query = query.lt("start_date", today);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: events,
    count,
    error,
  } = await query
    .order("start_date", {
      ascending: true,
    })
    .range(from, to);

  if (error) {
    console.error("Admin events query error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  const rows = events ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { data: filterEvents } = await supabase
    .from("events")
    .select("category,event_type");

  const categories = Array.from(
    new Set(
      (filterEvents ?? [])
        .map((event) => event.category)
        .filter(Boolean),
    ),
  ).sort();

  const eventTypes = Array.from(
    new Set(
      (filterEvents ?? [])
        .map((event) => event.event_type)
        .filter(Boolean),
    ),
  ).sort();

  const [
    totalResult,
    verifiedResult,
    reviewResult,
    reverificationResult,
    upcomingResult,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "verified"),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "under_review"),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "needs_reverification"),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("start_date", today),
  ]);

  const summary = [
    {
      label: "All events",
      value: totalResult.count ?? 0,
    },
    {
      label: "Verified",
      value: verifiedResult.count ?? 0,
    },
    {
      label: "Under review",
      value: reviewResult.count ?? 0,
    },
    {
      label: "Needs reverification",
      value: reverificationResult.count ?? 0,
    },
    {
      label: "Upcoming",
      value: upcomingResult.count ?? 0,
    },
  ];

  function pageUrl(targetPage: number) {
    const next = new URLSearchParams();

    if (search) next.set("q", search);
    if (verification !== "all") {
      next.set("verification", verification);
    }
    if (status !== "all") {
      next.set("status", status);
    }
    if (category !== "all") {
      next.set("category", category);
    }
    if (eventType !== "all") {
      next.set("eventType", eventType);
    }
    if (timing !== "all") {
      next.set("timing", timing);
    }

    next.set("page", String(targetPage));

    return buildQuery(next);
  }

  const hasFilters =
    Boolean(search) ||
    verification !== "all" ||
    status !== "all" ||
    category !== "all" ||
    eventType !== "all" ||
    timing !== "all";

  const firstResult = total === 0 ? 0 : from + 1;
  const lastResult = Math.min(from + rows.length, total);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-400">
              Event intelligence
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
              Conference operations
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Research, verify and publish trusted international events
              that can become TISA travel opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              ← Admin dashboard
            </Link>

            <a
              href="#create-event"
              className="inline-flex h-11 items-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              + Add event
            </a>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summary.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
            >
              <p className="text-xs text-slate-500">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Create event */}
        <section
          id="create-event"
          className="mt-8 scroll-mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-6"
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.16em] text-sky-400">
              Event intake
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Add international event
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Create the event as a draft first. After creation,
              verify its sources and publish it when the information
              is trusted.
            </p>
          </div>

          <CreateEventForm />
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <form
            method="GET"
            action="/admin/events"
            className="grid gap-4 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <label className="text-xs font-medium text-slate-400">
                Search
              </label>

              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Event, city, country or organizer..."
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Verification
              </label>

              <select
                name="verification"
                defaultValue={verification}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              >
                <option value="all">
                  All verification
                </option>

                {verificationOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Event status
              </label>

              <select
                name="status"
                defaultValue={status}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              >
                <option value="all">
                  All statuses
                </option>

                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Category
              </label>

              <select
                name="category"
                defaultValue={category}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              >
                <option value="all">
                  All categories
                </option>

                {categories.map((option) => (
                  <option key={option} value={option as string}>
                    {formatLabel(option as string)}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-400">
                Timing
              </label>

              <select
                name="timing"
                defaultValue={timing}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              >
                <option value="all">All dates</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="text-xs font-medium text-slate-400">
                Event type
              </label>

              <select
                name="eventType"
                defaultValue={eventType}
                className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none"
              >
                <option value="all">
                  All event types
                </option>

                {eventTypes.map((option) => (
                  <option key={option} value={option as string}>
                    {formatLabel(option as string)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 lg:col-span-5">
              <button
                type="submit"
                className="h-11 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Apply filters
              </button>

              {hasFilters && (
                <Link
                  href="/admin/events"
                  className="flex h-11 items-center rounded-full border border-white/10 px-5 text-sm text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Results header */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              Event queue
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {total === 0
                ? "No matching events"
                : `Showing ${firstResult}–${lastResult} of ${total} events`}
            </p>
          </div>

          {hasFilters && (
            <p className="text-xs text-sky-300">
              Filters active
            </p>
          )}
        </div>

        {/* Event table */}
        <section className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="hidden grid-cols-[minmax(0,2.3fr)_1.15fr_1fr_1.2fr_1.2fr_0.7fr] gap-4 border-b border-white/10 px-6 py-4 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-600 lg:grid">
            <span>Event</span>
            <span>Date</span>
            <span>Type</span>
            <span>Status</span>
            <span>Verification</span>
            <span>Action</span>
          </div>

          {rows.map((event) => {
            const needsAttention =
              event.verification_status === "needs_reverification" ||
              event.verification_status === "expired" ||
              event.verification_status === "under_review";

            return (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="block border-b border-white/5 px-6 py-5 transition last:border-b-0 hover:bg-white/[0.035]"
              >
                <div className="hidden grid-cols-[minmax(0,2.3fr)_1.15fr_1fr_1.2fr_1.2fr_0.7fr] items-center gap-4 lg:grid">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {needsAttention && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-orange-400"
                          title="Needs attention"
                        />
                      )}

                      <p className="truncate font-medium text-white">
                        {event.title}
                      </p>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {[event.city, event.country]
                        .filter(Boolean)
                        .join(", ") || "International"}
                    </p>

                    {event.organizer_name && (
                      <p className="mt-1 truncate text-[11px] text-slate-600">
                        {event.organizer_name}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-slate-400">
                    <p>{formatDate(event.start_date)}</p>

                    {event.end_date && (
                      <p className="mt-1 text-xs text-slate-600">
                        → {formatDate(event.end_date)}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs text-slate-400">
                      {formatLabel(event.event_type)}
                    </p>

                    {event.category && (
                      <p className="mt-1 truncate text-[11px] text-slate-600">
                        {formatLabel(event.category)}
                      </p>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-xs ${statusClass(
                        event.status,
                      )}`}
                    >
                      {formatLabel(event.status)}
                    </p>

                    {event.registration_status && (
                      <p className="mt-1 text-[11px] text-slate-600">
                        {formatLabel(event.registration_status)}
                      </p>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${verificationClass(
                        event.verification_status,
                      )}`}
                    >
                      {formatLabel(event.verification_status)}
                    </span>

                    <p className="mt-2 text-[11px] text-slate-600">
                      {event.last_verified_at
                        ? `Verified ${formatDate(
                            event.last_verified_at,
                          )}`
                        : "Never verified"}
                    </p>
                  </div>

                  <div className="text-right text-xs text-sky-400">
                    Open →
                  </div>
                </div>

                <div className="lg:hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {needsAttention && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                        )}

                        <p className="font-medium text-white">
                          {event.title}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {[event.city, event.country]
                          .filter(Boolean)
                          .join(", ") || "International"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] ${verificationClass(
                        event.verification_status,
                      )}`}
                    >
                      {formatLabel(event.verification_status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-600">Date</p>
                      <p className="mt-1 text-slate-300">
                        {formatDate(event.start_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">Status</p>
                      <p
                        className={`mt-1 ${statusClass(
                          event.status,
                        )}`}
                      >
                        {formatLabel(event.status)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">Type</p>
                      <p className="mt-1 text-slate-300">
                        {formatLabel(event.event_type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600">
                        Last verified
                      </p>
                      <p className="mt-1 text-slate-300">
                        {event.last_verified_at
                          ? formatDate(event.last_verified_at)
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-sky-400">
                    Open event operations →
                  </div>
                </div>
              </Link>
            );
          })}

          {!rows.length && (
            <div className="px-6 py-16 text-center">
              <p className="text-sm font-medium text-white">
                No events found
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Create your first event using the intake form above.
              </p>

              <a
                href="#create-event"
                className="mt-5 inline-flex rounded-full bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                + Add first event
              </a>
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              Page {page} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {page > 1 && (
                <Link
                  href={pageUrl(page - 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  ← Previous
                </Link>
              )}

              {Array.from(
                { length: Math.min(totalPages, 7) },
                (_, index) => {
                  let pageNumber = index + 1;

                  if (totalPages > 7) {
                    if (page <= 4) {
                      pageNumber = index + 1;
                    } else if (page >= totalPages - 3) {
                      pageNumber = totalPages - 6 + index;
                    } else {
                      pageNumber = page - 3 + index;
                    }
                  }

                  return pageNumber;
                },
              ).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={pageUrl(pageNumber)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs transition ${
                    pageNumber === page
                      ? "bg-sky-400 font-semibold text-slate-950"
                      : "border border-white/10 text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {pageNumber}
                </Link>
              ))}

              {page < totalPages && (
                <Link
                  href={pageUrl(page + 1)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}