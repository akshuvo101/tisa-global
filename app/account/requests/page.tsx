
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  MapPin,
  Plane,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import DestinationCover from "@/components/account/DestinationCover";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import type { RequestPriority, RequestStatus } from "@/types/tisa";
import { getDestinationLabel } from "@/lib/data/destination-label";

type RequestRow = {
  id: string;
  destination_country: string | null;
  destination_city: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  description: string;
  created_at: string;
  request_services: Array<{
    service_catalog: { name: string } | null;
  }>;
};

const statusLabel: Record<RequestStatus, string> = {
  requested: "Request received",
  reviewing: "Under review",
  need_documents: "Documents needed",
  documents_received: "Documents received",
  quoted: "Quote ready",
  quote_accepted: "Quote accepted",
  processing: "Processing",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityClass(priority: RequestPriority) {
  if (priority === "urgent") {
    return "request-priority request-priority--urgent";
  }

  if (priority === "high") {
    return "request-priority request-priority--high";
  }

  return "request-priority request-priority--normal";
}

function priorityEmoji(priority: RequestPriority) {
  if (priority === "urgent") return "🚨";
  if (priority === "high") return "⚡";
  return "🌿";
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/requests");
        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.error?.message ?? "Unable to load your requests.",
          );
        }

        if (active) {
          setRequests(result.data ?? []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your requests.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const stats = useMemo(
    () => [
      {
        label: "Total requests",
        value: requests.length,
        emoji: "🧳",
        icon: Compass,
        tone: "sky",
      },
      {
        label: "In progress",
        value: requests.filter(
          (request) =>
            !["completed", "cancelled"].includes(request.status),
        ).length,
        emoji: "🧭",
        icon: Clock3,
        tone: "violet",
      },
      {
        label: "Completed",
        value: requests.filter(
          (request) => request.status === "completed",
        ).length,
        emoji: "🎉",
        icon: CheckCircle2,
        tone: "mint",
      },
    ],
    [requests],
  );

  return (
    <main className="portal-page request-page min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* Hero section */}
        <div className="request-page__hero">
          <div
            className="request-page__hero-decoration"
            aria-hidden="true"
          >
            <Plane className="request-page__hero-plane" />
            <span className="request-page__hero-orbit request-page__hero-orbit--one" />
            <span className="request-page__hero-orbit request-page__hero-orbit--two" />
          </div>

          <div className="relative z-10">
            <div className="request-page__eyebrow">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              YOUR TRAVEL COMMAND CENTER
            </div>

            <PortalPageHeader
              eyebrow="MY REQUESTS"
              title="Your TISA journeys"
              description="Every travel request, document requirement, quote, and update — organized in one place."
            >
              <Link
                href="/request"
                className="request-page__primary-action"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Start a new request
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </PortalPageHeader>

            <div className="request-page__hero-chips">
              <span>
                <Plane aria-hidden="true" className="h-3.5 w-3.5" />
                Travel assistance
              </span>

              <span>
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                Your destinations
              </span>

              <span>
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                Request updates
              </span>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div role="alert" className="request-page__error mt-6">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                We couldn&apos;t load your requests.
              </p>

              <p className="mt-1 break-words text-xs opacity-85">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="request-page__retry"
            >
              <RefreshCw
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
              Try again
            </button>
          </div>
        )}

        {/* Request statistics */}
        {!loading && !error && requests.length > 0 && (
          <section
            aria-label="Request statistics"
            className="request-page__stats mt-4"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  data-tone={stat.tone}
                  className="request-stat-card"
                >
                  <span className="request-stat-card__icon">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold leading-7 text-foreground">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {stat.label}
                    </p>
                  </div>

                  <span
                    aria-hidden="true"
                    className="request-stat-card__emoji"
                  >
                    {stat.emoji}
                  </span>
                </article>
              );
            })}
          </section>
        )}

        {/* Requests heading */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="request-page__section-label">
              YOUR TRAVEL ACTIVITY
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              All requests

              {!loading && !error && (
                <span className="request-page__count">
                  {requests.length}
                </span>
              )}
            </h2>
          </div>

          {!loading && !error && requests.length > 0 && (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted">
              <CheckCircle2
                aria-hidden="true"
                className="h-3.5 w-3.5 text-primary"
              />
              Your requests, all in one place
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div
            className="request-journey-grid mt-5"
            aria-label="Loading your requests"
            aria-busy="true"
          >
            {[0, 1, 2].map((item) => (
              <div key={item} className="request-skeleton">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-foreground/[0.06]" />

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-4 w-36 max-w-full rounded-full bg-foreground/[0.06]" />
                  <div className="h-5 w-56 max-w-full rounded-full bg-foreground/[0.06]" />
                  <div className="h-3 w-4/5 max-w-full rounded-full bg-foreground/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="request-page__retry-state mt-5">
            <span className="text-3xl" aria-hidden="true">
              🔄
            </span>

            <h3 className="mt-3 font-semibold text-foreground">
              Your journeys are waiting
            </h3>

            <p className="mt-1 text-sm text-muted">
              Try loading your requests again.
            </p>

            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="request-page__primary-action mt-4"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Reload requests
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="request-page__empty-wrap mt-5">
            <PortalEmptyState
              icon={Plane}
              emoji="🧭"
              title="Your next journey starts here"
              description="Tell us where you want to go and what kind of travel support you need. Your requests and updates will be collected here."
              action={{
                label: "Tell TISA what you need",
                href: "/request",
              }}
            />
          </div>
        ) : (
          /* Request cards */
          <div className="request-journey-grid mt-5">
            {requests.map((request, index) => {
              const services = (request.request_services ?? [])
                .map((item) => item.service_catalog?.name)
                .filter((name): name is string => Boolean(name));

              return (
                <article
                  key={request.id}
                  className="request-journey-card group"
                  style={{
                    animationDelay: `${Math.min(index, 6) * 45}ms`,
                  }}
                >
                  <DestinationCover
                    city={request.destination_city}
                    country={request.destination_country}
                  />

                  <Link
                    href={`/account/requests/${request.id}`}
                    className="request-journey-card__content"
                    aria-label={`View request for ${getDestinationLabel(
                      request.destination_city,
                      request.destination_country,
                    )}`}
                  >
                    <div className="request-journey-card__panel">
                      <div className="request-journey-card__topline">
                        <PortalStatusBadge
                          status={request.status}
                          label={statusLabel[request.status]}
                        />
                        <span className={priorityClass(request.priority)}>
                          <span aria-hidden="true">{priorityEmoji(request.priority)}</span>
                          {request.priority} priority
                        </span>
                      </div>

                      <div className="request-journey-card__main">
                        <h3 className="request-journey-card__destination">
                          <span>
                            {getDestinationLabel(
                              request.destination_city,
                              request.destination_country,
                            )}
                          </span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 text-white/75 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </h3>

                        <p className="request-journey-card__description">
                          {request.description}
                        </p>

                        {services.length > 0 && (
                          <div className="request-journey-card__services" aria-label="Requested services">
                            {services.slice(0, 2).map((name, serviceIndex) => (
                              <span
                                key={`${name}-${serviceIndex}`}
                                className="request-service-chip"
                              >
                                {name}
                              </span>
                            ))}
                            {services.length > 2 && (
                              <span className="request-service-chip">
                                +{services.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="request-journey-card__footer">
                        <span className="request-journey-card__date">
                          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                          <span className="request-journey-card__date-copy">
                            <span className="request-journey-card__date-label">
                              Submitted
                            </span>
                            <time dateTime={request.created_at}>
                              {formatDate(request.created_at)}
                            </time>
                          </span>
                        </span>
                        <span className="request-journey-card__details">
                          View details
                          <ArrowRight
                            aria-hidden="true"
                            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom call to action */}
        {!loading && !error && requests.length > 0 && (
          <section className="request-page__bottom-cta mt-6">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">
              <span className="request-page__bottom-cta-icon">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-foreground">
                  Planning another adventure? ✈️
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Start a new request and let the TISA team help with your next step.
                </p>
              </div>

              <Link
                href="/request"
                className="request-page__bottom-cta-link"
              >
                New request

                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </Link>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
