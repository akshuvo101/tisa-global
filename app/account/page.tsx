
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Compass,
  FileText,
  MessageCircle,
  Plane,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import DestinationCover from "@/components/account/DestinationCover";
import { getDestinationLabel } from "@/lib/data/destination-label";
import type { CustomerDashboardData } from "@/types/customer-dashboard";
import type { RequestStatus } from "@/types/tisa";

const statusLabels: Record<RequestStatus, string> = {
  requested: "Request received",
  reviewing: "Being reviewed",
  need_documents: "Documents needed",
  documents_received: "Documents received",
  quoted: "Quote ready",
  quote_accepted: "Quote accepted",
  processing: "In progress",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

async function readJson<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error?.message || fallback);
  }

  return result.data as T;
}

function formatDate(value: string) {
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const features = [
  {
    title: "My requests",
    description: "Track your requests, updates, and next steps.",
    href: "/account/requests",
    icon: MessageCircle,
    emoji: "📋",
    accent: "sky",
    action: "View requests",
  },
  {
    title: "Explore destinations",
    description: "Discover new places and plan your next journey.",
    href: "/explore",
    icon: Compass,
    emoji: "🌍",
    accent: "mint",
    action: "Start exploring",
  },
  {
    title: "TISA AI",
    description: "Explore travel ideas, scholarships, and global events.",
    href: "/ai",
    icon: Sparkles,
    emoji: "✨",
    accent: "violet",
    action: "Ask TISA AI",
  },
  {
    title: "My profile",
    description: "Keep your details ready for a smoother experience.",
    href: "/account/profile",
    icon: UserRound,
    emoji: "👤",
    accent: "amber",
    action: "Edit profile",
  },
] as const;

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
        if (active) {
          setLoading(false);
        }
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

  const requiredDocuments = allDocuments.filter(
    (document) =>
      document.required &&
      ["required", "rejected", "expired"].includes(document.status),
  );

  const quotesToReview = allQuotes.filter(
    (quote) => quote.status === "sent",
  );

  const upcomingJourneys = data?.upcomingJourneys ?? [];
  const requestById = new Map(
    (data?.requests ?? []).map((request) => [request.id, request]),
  );

  const displayName =
    profile?.full_name?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "traveler";

  const nextStep = requiredDocuments[0]
    ? {
        kind: "document" as const,
        itemId: requiredDocuments[0].id,
        requestId: requiredDocuments[0].requestId,
        title:
          requiredDocuments[0].status === "rejected"
            ? "Update a requested document"
            : requiredDocuments[0].status === "expired"
              ? "Replace an expired document"
              : "Send a requested document",
        detail: `${requiredDocuments[0].document_type} · ${requiredDocuments[0].destination}`,
        label: "Open request",
        href: `/account/requests/${requiredDocuments[0].requestId}`,
        status:
          requiredDocuments[0].status === "rejected"
            ? "Needs update"
            : requiredDocuments[0].status === "expired"
              ? "Expired"
              : "Requested",
        requestStatus:
          requestById.get(requiredDocuments[0].requestId)?.status,
        icon: FileText,
        tone: "amber",
      }
    : quotesToReview[0]
      ? {
          kind: "quote" as const,
          itemId: quotesToReview[0].id,
          requestId: quotesToReview[0].request_id,
          title: "A quote is ready for your review",
          detail: `${quotesToReview[0].quote_number} · ${quotesToReview[0].currency} ${Number(quotesToReview[0].total_amount).toLocaleString()}`,
          label: "Review quote",
          href: "/account/quotes",
          status: "Sent",
          requestStatus:
            requestById.get(quotesToReview[0].request_id)?.status,
          icon: FileText,
          tone: "violet",
        }
      : openRequests[0]
        ? {
            kind: "request" as const,
            itemId: openRequests[0].id,
            requestId: openRequests[0].id,
            title: "Continue your request",
            detail: getDestinationLabel(
              openRequests[0].destination_city,
              openRequests[0].destination_country,
              "Your travel request",
            ),
            label: "View request",
            href: `/account/requests/${openRequests[0].id}`,
            status: statusLabels[openRequests[0].status],
            requestStatus: openRequests[0].status,
            icon: ArrowRight,
            tone: "sky",
          }
        : null;
  const NextStepIcon = nextStep?.icon ?? ArrowRight;
  const remainingDocuments = requiredDocuments.filter(
    (document) =>
      nextStep?.kind !== "document" || document.id !== nextStep.itemId,
  );
  const remainingQuotes = quotesToReview.filter(
    (quote) => nextStep?.kind !== "quote" || quote.id !== nextStep.itemId,
  );
  const recentRequests = (data?.requests ?? [])
    .filter(
      (request) =>
        !nextStep ||
        request.id !== nextStep.requestId,
    )
    .slice(0, 4);

  const summaries = [
    {
      label: "Active requests",
      value: openRequests.length,
      icon: MessageCircle,
      emoji: "🧭",
      tone: "sky",
    },
    {
      label: "Needs your input",
      value: requiredDocuments.length + quotesToReview.length,
      icon: FileText,
      emoji: "📝",
      tone: "amber",
    },
    ...(upcomingJourneys.length > 0
      ? [{
          label: "Upcoming trips",
          value: upcomingJourneys.length,
          icon: Plane,
          emoji: "✈️",
          tone: "mint",
        }]
      : []),
  ] as const;

  return (
    <main className="account-overview mx-auto w-full max-w-[1320px] space-y-6 sm:space-y-8">
      {/* Welcome hero */}
      <section className="account-overview-hero relative isolate overflow-hidden rounded-[28px] border border-border p-5 shadow-[0_18px_50px_rgba(15,35,55,0.08)] sm:p-7 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:p-9">
        <div
          aria-hidden="true"
          className="account-overview-hero__orb account-overview-hero__orb--one"
        />
        <div
          aria-hidden="true"
          className="account-overview-hero__orb account-overview-hero__orb--two"
        />

        <div className="relative z-10 min-w-0 flex-1">
          <span className="account-eyebrow">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            YOUR PERSONAL TRAVEL SPACE
          </span>

          <h1 className="mt-4 break-words text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
            Welcome back, {displayName}
            <span className="ml-2 inline-block origin-bottom-right animate-[wave_1.8s_ease-in-out_infinite] motion-reduce:animate-none">
              👋
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted sm:text-base">
            Your next adventure starts here. Manage your travel requests,
            discover exciting destinations, and let TISA help you plan your
            next move.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="account-hero-chip">
              <Plane aria-hidden="true" className="h-3.5 w-3.5" />
              Travel assistance
            </span>
            <span className="account-hero-chip">
              <Compass aria-hidden="true" className="h-3.5 w-3.5" />
              Global opportunities
            </span>
          </div>
        </div>

        <div className="relative z-10 mt-6 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
          <Link href="/request" className="account-secondary-action">
            <MessageCircle aria-hidden="true" className="h-4 w-4" />
            Start a new request
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 top-1/2 hidden -translate-y-1/2 opacity-[0.07] lg:block"
        >
          <Plane className="h-64 w-64 -rotate-12" />
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="min-h-10 rounded-lg border border-rose-500/20 px-3 text-xs font-semibold transition hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Try again
          </button>
        </div>
      )}

      {/* Feature cards */}
      <section
        aria-label="Customer features"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Link
              key={feature.title}
              href={feature.href}
              data-accent={feature.accent}
              className="account-feature-card group"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="account-feature-card__icon">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>

                <span
                  aria-hidden="true"
                  className="account-feature-card__emoji"
                >
                  {feature.emoji}
                </span>
              </div>

              <h2 className="mt-5 text-base font-semibold text-foreground">
                {feature.title}
              </h2>

              <p className="mt-2 text-xs leading-5 text-muted">
                {feature.description}
              </p>

              <span className="account-feature-card__action">
                {feature.action}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </section>

      {/* Loading state */}
      {loading ? (
        <section
          aria-label="Loading your travel dashboard"
          className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"
        >
          <div className="account-loading-card h-64" />
          <div className="account-loading-card h-64" />
        </section>
      ) : data ? (
        <>
          {/* Summary cards */}
          <section
            aria-label="Request summary"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {summaries.map((summary) => {
              const Icon = summary.icon;

              return (
                <div
                  key={summary.label}
                  data-accent={summary.tone}
                  className="account-mini-card"
                >
                  <span className="account-mini-card__icon">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-2xl font-bold leading-7 text-foreground">
                      {summary.value}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {summary.label}
                    </span>
                  </span>

                  <span aria-hidden="true" className="account-mini-card__emoji">
                    {summary.emoji}
                  </span>
                </div>
              );
            })}
          </section>

          {nextStep && (
            <section
              aria-labelledby="dashboard-next-step-title"
              className={`account-next-step account-next-step--${nextStep.tone}`}
            >
              <span className="account-next-step__icon">
                <NextStepIcon aria-hidden="true" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="account-section-label">YOUR NEXT STEP</p>
                <h2
                  id="dashboard-next-step-title"
                  className="mt-1 truncate text-sm font-bold text-foreground"
                >
                  {nextStep.title}
                </h2>
                <p className="mt-1 truncate text-xs text-muted">
                  {nextStep.detail}
                  {nextStep.requestStatus &&
                    nextStep.kind !== "request" &&
                    ` · ${statusLabels[nextStep.requestStatus]}`}
                </p>
              </div>
              <span className="account-next-step__status">
                {nextStep.status}
              </span>
              <Link
                href={nextStep.href}
                className="account-next-step__action"
              >
                {nextStep.label}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}

          {/* Requests and attention */}
          <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
            <section className="account-panel account-recent-requests-panel min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="account-section-label">YOUR JOURNEYS</p>
                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    Recent requests
                  </h2>
                </div>

                <Link
                  href="/account/requests"
                  className="account-text-link"
                >
                  View all
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentRequests.length > 0 ? (
                <div className="account-recent-request-grid mt-4">
                  {recentRequests.map((request, index) => {
                    const destination = getDestinationLabel(
                      request.destination_city,
                      request.destination_country,
                    );

                    return (
                      <article
                        key={request.id}
                        className="account-recent-request-card group"
                      >
                        <DestinationCover
                          city={request.destination_city}
                          country={request.destination_country}
                          variation={index}
                        />
                        <Link
                          href={`/account/requests/${request.id}`}
                          className="account-recent-request-card__link"
                          aria-label={`View ${destination} request: ${statusLabels[request.status]}, created ${formatDate(request.created_at)}`}
                        >
                          <span className="account-recent-request-card__status">
                            {statusLabels[request.status]}
                          </span>
                          <span className="account-recent-request-card__bottom">
                            <span className="account-recent-request-card__destination">
                              {destination}
                            </span>
                            <ArrowUpRight
                              aria-hidden="true"
                              className="account-recent-request-card__arrow"
                            />
                          </span>
                          <span className="account-recent-request-card__date">
                            <CalendarDays aria-hidden="true" />
                            <span>Created</span>
                            <time dateTime={request.created_at}>
                              {formatDate(request.created_at)}
                            </time>
                          </span>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="account-empty-state mt-5">
                  <span className="account-empty-state__emoji" aria-hidden="true">
                    🧳
                  </span>

                  <h3 className="mt-3 text-sm font-bold text-foreground">
                    {nextStep
                      ? "Your priority action is ready above"
                      : "Your next journey starts here"}
                  </h3>

                  <p className="mt-2 max-w-md text-xs leading-6 text-muted">
                    {nextStep
                      ? "We have highlighted the most important update for your travel request."
                      : "Tell us where you want to go and what kind of assistance you need. We'll help you figure out the next steps."}
                  </p>

                  {!nextStep && (
                    <Link href="/request" className="account-primary-action mt-4">
                      Start a request
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </section>

            {/* Needs your attention */}
            <section className="account-panel min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="account-section-label account-section-label--amber">
                    NEXT STEPS
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    Needs your attention
                  </h2>
                </div>

                {data.unreadNotifications > 0 && (
                  <Link
                    href="/account/notifications"
                    className="account-notification-pill"
                  >
                    <Bell aria-hidden="true" className="h-3.5 w-3.5" />
                    {data.unreadNotifications} new
                  </Link>
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                {remainingDocuments.slice(0, 3).map((document) => (
                  <Link
                    key={document.id}
                    href={`/account/requests/${document.requestId}`}
                    className="account-attention-item account-attention-item--amber"
                  >
                    <span className="account-attention-item__icon">
                      <FileText aria-hidden="true" className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground">
                        {document.status === "rejected"
                          ? "Update a document"
                          : document.status === "expired"
                            ? "Replace an expired document"
                            : "Send a requested document"}
                      </span>

                      <span className="mt-1 block truncate text-[11px] text-muted">
                        {document.document_type} · {document.destination}
                      </span>
                    </span>

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-muted"
                    />
                  </Link>
                ))}

                {remainingQuotes.slice(0, 2).map((quote) => (
                  <Link
                    key={quote.id}
                    href="/account/quotes"
                    className="account-attention-item account-attention-item--sky"
                  >
                    <span className="account-attention-item__icon">
                      <FileText aria-hidden="true" className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground">
                        Review your quote
                      </span>

                      <span className="mt-1 block truncate text-[11px] text-muted">
                        {quote.quote_number} · {quote.currency}{" "}
                        {Number(quote.total_amount).toLocaleString()}
                      </span>
                    </span>

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-muted"
                    />
                  </Link>
                ))}

                {remainingDocuments.length === 0 &&
                  remainingQuotes.length === 0 && (
                    <div className="account-all-caught-up">
                      <span className="account-all-caught-up__icon">
                        <Check aria-hidden="true" className="h-5 w-5" />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                          You&apos;re all caught up!
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted">
                          No other documents or quotes need your attention right now.
                        </p>
                      </div>

                      <span aria-hidden="true" className="ml-auto text-xl">
                        🎉
                      </span>
                    </div>
                  )}

                <Link
                  href="/account/notifications"
                  className="account-text-link mt-2"
                >
                  View notifications
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          </div>

          {/* Upcoming journeys */}
          {upcomingJourneys.length > 0 && (
            <section className="account-upcoming-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="account-section-label account-section-label--mint">
                    COMING UP
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-foreground">
                    Your upcoming journeys
                  </h2>
                </div>

                <Link href="/account/trips" className="account-text-link">
                  All trips
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {upcomingJourneys.slice(0, 2).map((journey) => (
                  <Link
                    key={journey.id}
                    href={`/account/requests/${journey.request_id}`}
                    className="account-upcoming-item group"
                  >
                    <span className="account-upcoming-item__icon">
                      <Plane
                        aria-hidden="true"
                        className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {getDestinationLabel(
                          journey.destination_city,
                          journey.destination_country,
                          "International journey",
                        )}
                      </span>

                      <span className="mt-1 block text-[11px] text-muted">
                        {formatDate(journey.start_date)}
                        {journey.end_date
                          ? ` – ${formatDate(journey.end_date)}`
                          : ""}
                      </span>
                    </span>

                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}
    </main>
  );
}
