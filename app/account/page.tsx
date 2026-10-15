"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import type { RequestStatus } from "@/types/tisa";
import type {
  CustomerDashboardData,
} from "@/types/customer-dashboard";
import { getDestinationLabel } from "@/lib/data/destination-label";

const requestStages: RequestStatus[] = [
  "requested",
  "reviewing",
  "need_documents",
  "documents_received",
  "quoted",
  "quote_accepted",
  "processing",
  "confirmed",
  "completed",
];

const stageLabels: Record<RequestStatus, string> = {
  requested: "Received",
  reviewing: "In review",
  need_documents: "Documents needed",
  documents_received: "Documents received",
  quoted: "Quote ready",
  quote_accepted: "Quote accepted",
  processing: "Processing",
  confirmed: "Confirmed",
  completed: "Complete",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

async function readJson<T>(response: Response, fallback: string): Promise<T> {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || fallback);
  }
  return result.data as T;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccountPage() {
  const { user, profile } = useAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/account/dashboard");
        const dashboard = await readJson<CustomerDashboardData>(
          response,
          "Unable to load your travel dashboard. Please try again.",
        );

        if (active) {
          setData(dashboard);
        }
      } catch (loadError) {
        console.error("Customer dashboard data load failed:", loadError);
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your travel dashboard. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const allQuotes = useMemo(
    () => data?.requests.flatMap((request) => request.quotes ?? []) ?? [],
    [data],
  );
  const allDocuments = useMemo(
    () =>
      data?.requests.flatMap((request) =>
        (request.request_documents ?? []).map((document) => ({
          ...document,
          requestId: request.id,
          destination: getDestinationLabel(
            request.destination_city,
            request.destination_country,
            "International journey",
          ),
        })),
      ) ?? [],
    [data],
  );
  const openRequests =
    data?.requests.filter(
      (request) => !["completed", "cancelled"].includes(request.status),
    ) ?? [];
  const pendingActions =
    allDocuments.filter(
      (document) =>
        document.required &&
        ["required", "rejected", "expired"].includes(document.status),
    ).length + allQuotes.filter((quote) => quote.status === "sent").length;
  const awaitingQuotes = allQuotes.filter(
    (quote) => quote.status === "sent",
  ).length;
  const confirmedBookings =
    data?.bookings.filter(
      (booking) =>
        ["confirmed", "travel_ready"].includes(booking.status) &&
        booking.confirmation_status === "confirmed",
    ).length ?? 0;
  const conversations =
    data?.requests.filter((request) => request.request_messages.length > 0)
      .length ?? 0;

  const upcomingJourneys = data?.upcomingJourneys ?? [];

  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "Traveler";

  const metrics = [
    {
      label: "Active requests",
      value: openRequests.length,
      note: "Your journeys in progress",
      href: "/account/requests",
      icon: "↗",
      tone: "cyan",
    },
    {
      label: "Pending actions",
      value: pendingActions,
      note: "Documents or quotes to review",
      href: "/account/documents",
      icon: "✳",
      tone: "amber",
    },
    {
      label: "Conversations",
      value: conversations,
      note: "Requests with team messages",
      href: "/account/messages",
      icon: "◌",
      tone: "violet",
    },
    {
      label: "Quotes to review",
      value: awaitingQuotes,
      note: "Ready for your response",
      href: "/account/quotes",
      icon: "◇",
      tone: "blue",
    },
    {
      label: "Confirmed bookings",
      value: confirmedBookings,
      note: "Services confirmed by TISA",
      href: "/account/bookings",
      icon: "✓",
      tone: "green",
    },
    {
      label: "Upcoming journeys",
      value: upcomingJourneys.length,
      note: "Confirmed bookings with future dates",
      href: "/account/trips",
      icon: "✈",
      tone: "rose",
    },
  ] as const;

  return (
    <main className="space-y-7">
      <section className="dashboard-enter relative isolate overflow-hidden rounded-[28px] border border-cyan-100/[0.12] bg-[#0d1a25] px-6 py-8 sm:px-9 sm:py-10 lg:px-11 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_8%,rgba(45,212,191,0.18),transparent_32%),radial-gradient(ellipse_at_100%_100%,rgba(56,189,248,0.14),transparent_44%),linear-gradient(118deg,#101c28_0%,#0c1721_55%,#10232b_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-14 -top-20 -z-10 h-72 w-72 rounded-full border border-cyan-100/[0.08] sm:right-[9%] sm:top-[-110px] sm:h-[420px] sm:w-[420px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[7%] top-1/2 -z-10 hidden h-32 w-52 -translate-y-1/2 rotate-[-18deg] border-t border-dashed border-cyan-100/20 sm:block"
        />
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Your journey, thoughtfully handled
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-[42px]">
            Welcome back, {displayName}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300/75 sm:text-[15px]">
            Your personal space for every detail, update, and next step in your
            international travel plans.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/planner"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-200 px-5 text-sm font-semibold text-[#09202a] shadow-[0_7px_28px_rgba(103,232,249,0.14)] transition hover:-translate-y-0.5 hover:bg-cyan-100 active:translate-y-0"
            >
              Plan a Trip <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href="/account/requests"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/[0.12] bg-white/[0.035] px-5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Track a request
            </Link>
          </div>
        </div>
        <div className="absolute bottom-5 right-7 hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-100/30 sm:flex">
          <span className="h-px w-8 bg-cyan-100/30" /> TISA · Your world awaits
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.06] px-5 py-4 text-sm text-rose-200"
        >
          {error}
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="rounded-lg border border-rose-200/15 px-3 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-200/[0.08]"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div
          aria-label="Loading your travel dashboard"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="h-[130px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            />
          ))}
        </div>
      ) : data ? (
        <>
          <section
            aria-label="Travel summary"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            {metrics.map((metric, index) => (
              <Link
                key={metric.label}
                href={metric.href}
                style={{ animationDelay: `${index * 55}ms` }}
                className="dashboard-enter group flex min-h-[130px] items-start justify-between rounded-2xl border border-white/[0.075] bg-[#0c131d] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#101a26] sm:p-6"
              >
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-[30px] font-semibold leading-none tracking-tight text-white">
                    {metric.value}
                  </p>
                  <p className="mt-3 text-[11px] text-slate-600">
                    {metric.note}
                  </p>
                </div>
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl border text-base transition group-hover:scale-105 ${metric.tone === "cyan" ? "border-cyan-200/10 bg-cyan-200/[0.08] text-cyan-200" : metric.tone === "amber" ? "border-amber-200/10 bg-amber-200/[0.08] text-amber-200" : metric.tone === "violet" ? "border-violet-200/10 bg-violet-200/[0.08] text-violet-200" : metric.tone === "blue" ? "border-sky-200/10 bg-sky-200/[0.08] text-sky-200" : metric.tone === "green" ? "border-emerald-200/10 bg-emerald-200/[0.08] text-emerald-200" : "border-rose-200/10 bg-rose-200/[0.08] text-rose-200"}`}
                  aria-hidden="true"
                >
                  {metric.icon}
                </span>
              </Link>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
            <section className="rounded-2xl border border-white/[0.075] bg-[#0c131d] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                    Your journeys
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Recent requests
                  </h2>
                </div>
                <Link
                  href="/account/requests"
                  className="text-xs font-medium text-cyan-200 transition hover:text-white"
                >
                  View all <span aria-hidden="true">→</span>
                </Link>
              </div>

              {data?.requests.length ? (
                <div className="mt-6 space-y-4">
                  {data.requests.slice(0, 4).map((request) => {
                    const stage = requestStages.indexOf(request.status);
                    const location = getDestinationLabel(
                      request.destination_city,
                      request.destination_country,
                    );
                    return (
                      <Link
                        key={request.id}
                        href={`/account/requests/${request.id}`}
                        className="group block rounded-xl border border-white/[0.06] bg-white/[0.018] p-4 transition hover:border-cyan-200/15 hover:bg-white/[0.035] sm:p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-cyan-100">
                              {location}
                            </p>
                            <p className="mt-1.5 text-[11px] text-slate-500">
                              {request.id.slice(0, 8).toUpperCase()} ·{" "}
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium text-slate-300">
                            {stageLabels[request.status]}
                          </span>
                        </div>
                        <div
                          className="mt-5 flex items-center"
                          aria-label={`Journey progress: ${stage < 0 ? "status update pending" : `${stage + 1} of ${requestStages.length} steps`}`}
                        >
                          {requestStages.map((step, stepIndex) => {
                            const complete =
                              stage >= 0 && stepIndex <= stage;
                            return (
                              <div
                                key={step}
                                className="flex min-w-0 flex-1 items-center last:flex-none"
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${complete ? "bg-cyan-200" : "bg-white/15"}`}
                                />
                                {stepIndex < requestStages.length - 1 && (
                                  <span
                                    className={`h-px flex-1 ${stage > stepIndex ? "bg-cyan-200/45" : "bg-white/[0.08]"}`}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-white/[0.09] px-5 py-9 text-center">
                  <p className="text-sm font-medium text-slate-200">
                    Your first journey starts here
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                    Tell us where you&apos;re going and what kind of travel
                    assistance you need.
                  </p>
                  <Link
                    href="/request"
                    className="mt-5 inline-flex rounded-lg bg-cyan-200 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-100"
                  >
                    Create a request
                  </Link>
                </div>
              )}

              {data?.requests.length ? (
                <div className="mt-5 border-t border-white/[0.06] pt-4">
                  <Link
                    href="/account/saved"
                    className="text-xs text-slate-500 transition hover:text-cyan-200"
                  >
                    Revisit your saved destinations <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : null}
            </section>

            <div className="space-y-6">
              <section className="rounded-2xl border border-white/[0.075] bg-[#0c131d] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                      Next steps
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      Needs your attention
                    </h2>
                  </div>
                  <Link
                    href="/account/notifications"
                    aria-label={`${data?.unreadNotifications ?? 0} unread notifications`}
                    className="grid h-9 min-w-9 place-items-center rounded-full border border-cyan-200/10 bg-cyan-200/[0.07] px-2 text-xs font-semibold text-cyan-100"
                  >
                    {data?.unreadNotifications ?? 0}
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {allDocuments
                    .filter(
                      (document) =>
                        document.required &&
                        ["required", "rejected", "expired"].includes(
                          document.status,
                        ),
                    )
                    .slice(0, 2)
                    .map((document) => (
                      <Link
                        key={document.id}
                        href={`/account/requests/${document.requestId}`}
                        className="flex items-start gap-3 rounded-xl border border-white/[0.055] p-3.5 transition hover:bg-white/[0.035]"
                      >
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-300" />
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-slate-200">
                            {document.status === "rejected"
                              ? "Document update requested"
                              : document.status === "expired"
                                ? "Document expired"
                                : "Document required"}
                          </span>
                          <span className="mt-1 block truncate text-[11px] text-slate-500">
                            {document.document_type} · {document.destination}
                          </span>
                        </span>
                      </Link>
                    ))}
                  {allQuotes
                    .filter((quote) => quote.status === "sent")
                    .slice(0, 2)
                    .map((quote) => (
                      <Link
                        key={quote.id}
                        href="/account/quotes"
                        className="flex items-start gap-3 rounded-xl border border-white/[0.055] p-3.5 transition hover:bg-white/[0.035]"
                      >
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-cyan-200" />
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-slate-200">
                            Quote ready to review
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-500">
                            {quote.quote_number} · {quote.currency}{" "}
                            {Number(quote.total_amount).toLocaleString()}
                          </span>
                        </span>
                      </Link>
                    ))}
                  {!pendingActions && (
                    <p className="rounded-xl border border-white/[0.055] px-4 py-5 text-center text-xs text-slate-500">
                      You&apos;re all caught up. We&apos;ll let you know when
                      there&apos;s a new step.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.075] bg-[#0c131d] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/70">
                      On the horizon
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-white">
                      Upcoming trips
                    </h2>
                  </div>
                  <Link
                    href="/account/trips"
                    className="text-xs text-slate-500 transition hover:text-cyan-200"
                  >
                    All trips
                  </Link>
                </div>
                {upcomingJourneys.length ? (
                  <div className="mt-5 space-y-3">
                    {upcomingJourneys.slice(0, 2).map((journey) => (
                      <Link
                        key={journey.id}
                        href={`/account/requests/${journey.request_id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] p-4 transition hover:border-emerald-200/15"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-white">
                            {getDestinationLabel(
                              journey.destination_city,
                              journey.destination_country,
                              "International journey",
                            )}
                          </span>
                          <span className="mt-1 block text-[11px] text-slate-500">
                            {formatDate(journey.start_date)}
                            {journey.end_date
                              ? ` – ${formatDate(journey.end_date)}`
                              : ""}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-emerald-200">
                          View <span aria-hidden="true">↗</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-white/[0.08] px-4 py-6 text-center">
                    <p className="text-xs text-slate-500">
                      Confirmed travel dates will appear here.
                    </p>
                    <Link
                      href="/planner"
                      className="mt-3 inline-block text-xs font-medium text-cyan-200 hover:text-white"
                    >
                      Explore trip planning
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </div>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/explore"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-cyan-200/15 hover:bg-white/[0.035]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Discover
              </span>
              <span className="mt-2 flex items-center justify-between text-sm font-medium text-slate-200">
                Explore destinations
                <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/account/bookings"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-cyan-200/15 hover:bg-white/[0.035]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Confirmations
              </span>
              <span className="mt-2 flex items-center justify-between text-sm font-medium text-slate-200">
                Review bookings
                <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/account/profile"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-cyan-200/15 hover:bg-white/[0.035]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Your details
              </span>
              <span className="mt-2 flex items-center justify-between text-sm font-medium text-slate-200">
                Review travel profile
                <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/account/saved"
              className="group rounded-xl border border-white/[0.07] bg-white/[0.018] p-4 transition hover:border-cyan-200/15 hover:bg-white/[0.035]"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Your collection
              </span>
              <span className="mt-2 flex items-center justify-between text-sm font-medium text-slate-200">
                Saved destinations
                <span className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200">
                  →
                </span>
              </span>
            </Link>
          </section>
        </>
      ) : null}
    </main>
  );
}
