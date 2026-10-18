"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, Plane, ReceiptText, ShieldCheck } from "lucide-react";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import { getDestinationLabel } from "@/lib/data/destination-label";

type BookingItem = {
  id: string;
  status: string;
  provider_name: string | null;
  provider_reference: string | null;
  details: { description?: string } | null;
  service_catalog: { id: string; name: string } | null;
};

type Booking = {
  id: string;
  booking_reference: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  total_amount: number | string | null;
  currency: string | null;
  service_requests?: {
    destination_city: string | null;
    destination_country: string | null;
    travel_start_date: string | null;
    travel_end_date: string | null;
  };
  booking_items: BookingItem[];
};

export default function BookingDetail() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadBooking() {
      try {
        const response = await fetch(`/api/bookings/${params.id}`);
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Booking not found.");
        }
        if (active) setBooking(body.data);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load booking.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadBooking();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="portal-page min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="h-44 animate-pulse rounded-[22px] border border-border bg-surface motion-reduce:animate-none" />
          <div className="mt-4 h-64 animate-pulse rounded-[22px] border border-border bg-surface motion-reduce:animate-none" />
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="portal-page min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-700 dark:text-rose-200">
            {error || "Booking not found."}
            <Link href="/account/bookings" className="mt-4 inline-flex items-center gap-2 font-semibold text-primary"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to bookings</Link>
          </div>
        </div>
      </main>
    );
  }

  const request = booking.service_requests;
  const destination = getDestinationLabel(request?.destination_city, request?.destination_country, "International travel");
  const startDate = booking.start_date || request?.travel_start_date;
  const endDate = booking.end_date || request?.travel_end_date;

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link href="/account/bookings" className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-muted transition hover:bg-surface-light hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> My bookings
        </Link>
        <PortalPageHeader
          eyebrow="BOOKING DETAILS"
          title={booking.booking_reference || `Booking ${booking.id.slice(0, 8).toUpperCase()}`}
          description={destination}
        >
          <PortalStatusBadge status={booking.status} />
        </PortalPageHeader>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <section className="rounded-[22px] border border-border bg-surface/90 p-4 shadow-[0_10px_28px_rgba(1,9,17,0.11)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Services in this booking</h2>
                <p className="mt-1 text-xs text-muted">Provider details appear when they are available.</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><Plane aria-hidden="true" className="h-4 w-4" /></span>
            </div>
            {booking.booking_items?.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {booking.booking_items.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border bg-background/45 p-3.5 transition hover:border-primary/20">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-foreground">{item.service_catalog?.name || item.details?.description || "Travel service"}</h3>
                      <PortalStatusBadge status={item.status} />
                    </div>
                    <p className="mt-2 text-xs text-muted">{item.provider_name || "TISA is coordinating this service"}</p>
                    {item.provider_reference && <p className="mt-1 break-all font-mono text-[10px] text-muted">Provider reference · {item.provider_reference}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted">No service items are listed for this booking yet.</p>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-[22px] border border-primary/15 bg-surface/90 p-4 shadow-[0_10px_28px_rgba(1,9,17,0.11)] sm:p-5">
              <h2 className="text-sm font-semibold text-foreground">Journey at a glance</h2>
              <div className="mt-4 space-y-3">
                <TravelDetail icon={MapPin} label="Destination" value={destination} />
                <TravelDetail icon={CalendarDays} label="Start date" value={formatDate(startDate)} />
                <TravelDetail icon={CalendarDays} label="End date" value={formatDate(endDate)} />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted"><ReceiptText aria-hidden="true" className="h-3.5 w-3.5" />Booking total</span>
                <span className="text-sm font-semibold text-foreground">
                  {booking.total_amount !== null && booking.total_amount !== undefined && booking.currency
                    ? `${booking.currency} ${Number(booking.total_amount).toLocaleString()}`
                    : "Not listed"}
                </span>
              </div>
            </section>
            <section className="rounded-[22px] border border-emerald-400/15 bg-emerald-400/[0.045] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
                <ShieldCheck aria-hidden="true" className="h-4 w-4" />
                <h2 className="text-sm font-semibold">A helpful note</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                TISA will update the booking as service confirmations become available. Final provider and immigration decisions remain subject to the relevant provider or authority.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function TravelDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0"><p className="text-[10px] text-muted">{label}</p><p className="mt-0.5 break-words text-xs font-medium text-foreground">{value}</p></div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
