"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2, Compass, FileCheck2, Plane } from "lucide-react";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import { getDestinationCountryLabel, getDestinationLabel } from "@/lib/data/destination-label";

type Trip = {
  id: string;
  title: string;
  status: string;
  readiness_status: string;
  request: {
    id: string;
    destination_country: string | null;
    destination_city: string | null;
    travel_start_date: string | null;
    travel_end_date: string | null;
    status: string;
  };
  readiness: {
    requiredDocuments: number;
    acceptedDocuments: number;
    activeBookings: number;
    confirmedBookings: number;
  };
};

export default function AccountTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadTrips() {
      try {
        const response = await fetch("/api/account/trips");
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Unable to load trips.");
        }
        if (active) setTrips(body.data ?? []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load trips.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadTrips();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PortalPageHeader
          eyebrow="YOUR TRAVEL WORKSPACE"
          title="My trips"
          description="Follow the real TISA journeys connected to your requests, with documents, service bookings, and progress together."
        >
          <div className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
            <Compass aria-hidden="true" className="h-4 w-4" />
            {trips.length} trip{trips.length === 1 ? "" : "s"}
          </div>
        </PortalPageHeader>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-700 dark:text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading trips">
            {[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-[22px] border border-border bg-surface motion-reduce:animate-none" />)}
          </div>
        ) : trips.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {trips.map((trip) => {
              const destination = getDestinationLabel(trip.request.destination_city, trip.request.destination_country, "International");
              const readinessLabel = trip.readiness_status.replaceAll("_", " ");
              const startDate = trip.request.travel_start_date;
              const endDate = trip.request.travel_end_date;
              return (
                <Link key={trip.id} href={`/account/trips/${trip.id}`} className="group overflow-hidden rounded-[22px] border border-border bg-surface/90 shadow-[0_10px_28px_rgba(1,9,17,0.12)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400/25 motion-reduce:transform-none">
                  <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_at_85%_12%,rgba(134,224,192,0.16),transparent_50%),linear-gradient(120deg,var(--surface),var(--surface-light))] px-4 py-5 sm:px-5">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-7 -top-10 h-36 w-36 rounded-full border border-emerald-300/10 before:absolute before:inset-4 before:rounded-full before:border before:border-emerald-300/10 after:absolute after:inset-8 after:rounded-full after:border after:border-emerald-300/10" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-background/55 text-emerald-600 dark:text-emerald-200"><Plane aria-hidden="true" className="h-5 w-5" /></span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                            {getDestinationLabel(trip.request.destination_city, null, "International")}
                            {trip.request.destination_country ? ` · ${getDestinationCountryLabel(trip.request.destination_country)}` : ""}
                          </p>
                          <h2 className="mt-1 truncate text-lg font-semibold text-foreground">{destination} journey</h2>
                        </div>
                      </div>
                      <PortalStatusBadge status={trip.readiness_status} label={readinessLabel} />
                    </div>
                    <p className="relative mt-4 inline-flex items-center gap-1.5 text-xs text-muted">
                      <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
                      {startDate ? new Date(`${startDate}T00:00:00`).toLocaleDateString() : "Travel date not set"}
                      {endDate ? ` – ${new Date(`${endDate}T00:00:00`).toLocaleDateString()}` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3.5 sm:p-4">
                    <TripMetric icon={FileCheck2} label="Documents accepted" value={`${trip.readiness.acceptedDocuments} / ${trip.readiness.requiredDocuments}`} tone="violet" />
                    <TripMetric icon={CheckCircle2} label="Bookings confirmed" value={`${trip.readiness.confirmedBookings} / ${trip.readiness.activeBookings}`} tone="mint" />
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <span className="text-[11px] capitalize text-muted">Request · {trip.request.status.replaceAll("_", " ")}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Open trip <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <PortalEmptyState
            icon={Compass}
            emoji="🗺️"
            title="No TISA trips yet"
            description="Your trip workspace appears when a travel assistance request has been made. Submit a request to get started."
            action={{ label: "Get travel assistance", href: "/request" }}
          />
        )}
      </section>
    </main>
  );
}

function TripMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileCheck2;
  label: string;
  value: string;
  tone: "violet" | "mint";
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background/45 p-3">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone === "violet" ? "bg-violet-400/10 text-violet-700 dark:text-violet-200" : "bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"}`}>
        <Icon aria-hidden="true" className="h-4 w-4" />
      </span>
      <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{value}</span><span className="block truncate text-[10px] text-muted">{label}</span></span>
    </div>
  );
}
