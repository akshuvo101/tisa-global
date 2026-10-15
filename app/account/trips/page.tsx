"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getDestinationCountryLabel,
  getDestinationLabel,
} from "@/lib/data/destination-label";

type Trip = {
  id: string;
  title: string;
  status: string;
  readiness_status: string;
  request: { id: string; destination_country: string | null; destination_city: string | null; travel_start_date: string | null; travel_end_date: string | null; status: string };
  readiness: { requiredDocuments: number; acceptedDocuments: number; activeBookings: number; confirmedBookings: number };
};

const readinessLabel: Record<string, string> = { not_ready: "Not ready", needs_attention: "Needs attention", almost_ready: "Almost ready", travel_ready: "Travel ready" };

export default function AccountTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/trips")
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(body.error?.message || "Unable to load trips.");
        setTrips(body.data || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load trips."))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-background text-foreground"><section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
    <Link href="/account" className="text-sm text-muted hover:text-white">← Back to account</Link>
    <div className="mt-7"><p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Travel workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My TISA Trips</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Your real TISA service journeys, bookings, documents and travel-readiness progress in one place.</p></div>

    {loading && <div className="mt-10 grid gap-5 lg:grid-cols-2">{[1,2].map((n)=><div key={n} className="h-52 animate-pulse rounded-3xl border border-white/8 bg-white/[0.025]" />)}</div>}
    {error && <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">{error}</div>}
    {!loading && !error && trips.length === 0 && <div className="mt-10 rounded-3xl border border-dashed border-white/10 p-10 text-center"><h2 className="text-lg font-semibold">No TISA service trips yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Once you submit a travel assistance request, its operational workspace will appear here.</p><Link href="/request" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">Get Assistance</Link></div>}
    {!loading && trips.length > 0 && <div className="mt-10 grid gap-5 lg:grid-cols-2">{trips.map((trip)=><Link key={trip.id} href={`/account/trips/${trip.id}`} className="rounded-3xl border border-white/8 bg-surface p-6 transition hover:border-primary/25 hover:bg-surface-light"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-muted">{getDestinationLabel(trip.request.destination_city, null, "International")}{trip.request.destination_country ? ` · ${getDestinationCountryLabel(trip.request.destination_country)}` : ""}</p><h2 className="mt-2 text-xl font-semibold">{getDestinationLabel(trip.request.destination_city, trip.request.destination_country, "International")} journey</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-300">{readinessLabel[trip.readiness_status] || trip.readiness_status.replaceAll("_", " ")}</span></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Request" value={trip.request.status.replaceAll("_", " ")} /><Metric label="Docs" value={`${trip.readiness.acceptedDocuments}/${trip.readiness.requiredDocuments || 0}`} /><Metric label="Bookings" value={`${trip.readiness.confirmedBookings}/${trip.readiness.activeBookings}`} /><Metric label="Travel" value={trip.request.travel_start_date || "TBD"} /></div><p className="mt-6 text-sm font-medium text-primary">Open trip workspace →</p></Link>)}</div>}
  </section></main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/8 bg-background/40 p-3"><p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-2 truncate text-sm font-medium capitalize">{value}</p></div>; }
