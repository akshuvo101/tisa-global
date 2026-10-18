"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getDestinationCountryLabel,
  getDestinationLabel,
} from "@/lib/data/destination-label";

type Data = any;

export default function TripWorkspacePage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Data>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/account/trips/${params.id}`).then(async (response) => {
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error?.message || "Trip not found.");
      setData(body.data);
    }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load trip."));
  }, [params.id]);

  if (error) return <main className="portal-page min-h-screen bg-background text-foreground"><div className="mx-auto max-w-5xl px-6 py-20"><p className="text-red-300">{error}</p><Link href="/account/trips" className="mt-4 inline-block text-primary">← My Trips</Link></div></main>;
  if (!data) return <main className="portal-page min-h-screen bg-background text-foreground"><div className="mx-auto max-w-5xl px-6 py-20 text-sm text-muted">Loading your trip workspace…</div></main>;

  const { trip, request, profile, readiness, timeline } = data;
  const docs = request.request_documents || [];
  const bookings = request.bookings || [];
  const quotes = request.quotes || [];

  return <main className="portal-page min-h-screen bg-background text-foreground"><section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
    <Link href="/account/trips" className="text-sm text-muted hover:text-white">← My Trips</Link>
    <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-primary">Trip workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{getDestinationLabel(request.destination_city, request.destination_country, "International")} journey</h1><p className="mt-2 text-sm text-muted">{getDestinationLabel(request.destination_city, null, "International")}{request.destination_country ? `, ${getDestinationCountryLabel(request.destination_country)}` : ""} · {request.travel_start_date || "Date TBD"}{request.travel_end_date ? ` → ${request.travel_end_date}` : ""}</p></div><span className="rounded-full border border-white/10 px-4 py-2 text-sm capitalize text-slate-300">{trip.readiness_status.replaceAll("_", " ")}</span></div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Documents" value={`${readiness.acceptedDocuments}/${readiness.requiredDocuments || 0}`} /><Stat label="Missing / pending" value={String(readiness.missingDocuments)} /><Stat label="Confirmed bookings" value={`${readiness.confirmedBookings}/${readiness.activeBookings}`} /><Stat label="Traveler count" value={String(request.traveler_count || 1)} /></div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[1.45fr_.85fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Travel timeline" subtitle="Track the major steps in your TISA journey." /><div className="mt-7 space-y-5">{timeline.map((item: any, index: number)=><div key={item.label} className="flex gap-4"><div className="flex flex-col items-center"><span className={`mt-1 h-3 w-3 rounded-full ${item.done ? "bg-primary" : "border border-white/20 bg-background"}`} />{index < timeline.length - 1 && <span className="mt-2 h-full min-h-7 w-px bg-white/10" />}</div><div className="pb-2"><p className={`text-sm font-medium ${item.done ? "text-white" : "text-slate-500"}`}>{item.label}</p><p className="mt-1 text-xs text-muted">{item.date ? new Date(item.date).toLocaleString() : "Pending"}</p></div></div>)}</div></section>

        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Services" subtitle="Services included in this request." /><div className="mt-5 grid gap-3 sm:grid-cols-2">{(request.request_services || []).map((service: any)=><div key={service.id} className="rounded-2xl border border-white/8 bg-background/40 p-4"><p className="text-sm font-medium">{service.service_catalog?.name || "Travel service"}</p><p className="mt-1 text-xs capitalize text-muted">{service.status.replaceAll("_", " ")}</p></div>)}</div></section>

        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Documents" subtitle="Uploaded documents and their review status." /><div className="mt-5 space-y-3">{docs.length ? docs.map((doc: any)=><div key={doc.id} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{doc.document_type}</p><p className="mt-1 text-xs text-muted">{doc.file_name || "No file uploaded"}{doc.due_date ? ` · Due ${doc.due_date}` : ""}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-400">{doc.status.replaceAll("_", " ")}</span></div>) : <p className="text-sm text-muted">No documents have been requested yet.</p>}</div><Link href={`/account/requests/${request.id}`} className="mt-5 inline-block text-sm text-primary">Open request workspace →</Link></section>

        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Bookings" subtitle="Confirmed services and provider references." /><div className="mt-5 space-y-3">{bookings.length ? bookings.map((booking: any)=><div key={booking.id} className="rounded-2xl border border-white/8 bg-background/40 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium">{booking.booking_reference || booking.id.slice(0,8)}</p><p className="mt-1 text-xs text-muted">{booking.start_date || request.travel_start_date || "Date TBD"}{booking.end_date ? ` → ${booking.end_date}` : ""}</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-slate-400">{booking.status.replaceAll("_", " ")}</span></div>{(booking.booking_items || []).length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{booking.booking_items.map((item: any)=><div key={item.id} className="rounded-xl border border-white/6 p-3"><p className="text-xs text-slate-300">{item.service_catalog?.name || "Service"}</p><p className="mt-1 text-[11px] text-muted">{item.provider_name || "TISA coordinating"}{item.provider_reference ? ` · ${item.provider_reference}` : ""}</p></div>)}</div>}</div>) : <p className="text-sm text-muted">No booking has been created yet.</p>}</div></section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl border border-primary/20 bg-primary-soft/30 p-6"><p className="text-xs uppercase tracking-[0.16em] text-primary">Travel readiness</p><h2 className="mt-2 text-xl font-semibold">{trip.readiness_status === "travel_ready" ? "You're travel ready" : "A few steps remain"}</h2><p className="mt-3 text-sm leading-6 text-muted">{readiness.missingDocuments > 0 ? `${readiness.missingDocuments} required document${readiness.missingDocuments > 1 ? "s" : ""} still need attention.` : readiness.activeBookings === 0 ? "Your service bookings are not confirmed yet." : readiness.confirmedBookings < readiness.activeBookings ? "Some bookings are still being processed." : "Your active travel services are confirmed."}</p><Link href={`/account/requests/${request.id}`} className="mt-5 inline-flex rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">Review next steps</Link></section>

        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Your travel profile" subtitle="Information TISA can use for coordination." /><div className="mt-5 space-y-4"><Info label="Name" value={profile?.full_name || "Not set"}/><Info label="Nationality" value={profile?.nationality || "Not set"}/><Info label="Residence" value={[profile?.city, profile?.country].filter(Boolean).join(", ") || "Not set"}/><Info label="Passport expiry" value={profile?.passport_expiry || "Not set"}/><Info label="Contact" value={profile?.preferred_contact_channel || "email"}/><Link href="/account/profile" className="block pt-2 text-sm text-primary">Update profile →</Link></div></section>

        <section className="rounded-3xl border border-white/8 bg-surface p-6"><SectionTitle title="Quotes" subtitle="Commercial proposals linked to this journey." /><div className="mt-5 space-y-3">{quotes.length ? quotes.map((quote: any)=><div key={quote.id} className="rounded-2xl border border-white/8 p-4"><div className="flex justify-between gap-3"><p className="text-sm font-medium">{quote.quote_number}</p><span className="text-xs capitalize text-muted">{quote.status.replaceAll("_", " ")}</span></div><p className="mt-2 text-lg font-semibold">{quote.currency} {Number(quote.total_amount || 0).toLocaleString()}</p></div>) : <p className="text-sm text-muted">No quote yet.</p>}<Link href="/account/quotes" className="inline-block pt-2 text-sm text-primary">View all quotes →</Link></div></section>
      </aside>
    </div>
  </section></main>;
}

function SectionTitle({title,subtitle}:{title:string;subtitle:string}){return <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-muted">{subtitle}</p></div>}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/8 bg-surface p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-xl font-semibold capitalize">{value}</p></div>}
function Info({label,value}:{label:string;value:string}){return <div><p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-1 break-words text-sm">{value}</p></div>}
