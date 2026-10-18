"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Plane, ReceiptText } from "lucide-react";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import { getDestinationLabel } from "@/lib/data/destination-label";

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
  booking_items?: Array<{ id: string }>;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings");
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Unable to load bookings.");
        }
        if (active) setBookings(body.data ?? []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBookings();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PortalPageHeader
          eyebrow="TRAVEL FULFILLMENT"
          title="My bookings"
          description="A clear view of the travel services TISA is coordinating for your journeys."
        >
          <div className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3.5 text-xs font-semibold text-primary">
            <ReceiptText aria-hidden="true" className="h-4 w-4" />
            {bookings.length} booking{bookings.length === 1 ? "" : "s"}
          </div>
        </PortalPageHeader>

        {error && (
          <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-700 dark:text-rose-200">
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold underline underline-offset-4">Try again</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading bookings">
            {[0, 1].map((item) => <div key={item} className="h-48 animate-pulse rounded-[20px] border border-border bg-surface motion-reduce:animate-none" />)}
          </div>
        ) : bookings.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {bookings.map((booking) => {
              const request = booking.service_requests;
              const destination = getDestinationLabel(request?.destination_city, request?.destination_country, "International");
              const startDate = booking.start_date || request?.travel_start_date;
              const endDate = booking.end_date || request?.travel_end_date;
              return (
                <Link key={booking.id} href={`/account/bookings/${booking.id}`} className="group overflow-hidden rounded-[20px] border border-border bg-surface/90 shadow-[0_8px_24px_rgba(1,9,17,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 motion-reduce:transform-none">
                  <div className="relative overflow-hidden border-b border-border bg-[radial-gradient(ellipse_at_85%_10%,rgba(89,217,232,0.15),transparent_48%),linear-gradient(115deg,var(--surface),var(--surface-light))] px-4 py-4 sm:px-5">
                    <div aria-hidden="true" className="pointer-events-none absolute -right-3 -top-8 h-32 w-32 rounded-full border border-primary/10 before:absolute before:inset-3 before:rounded-full before:border before:border-primary/10 after:absolute after:inset-7 after:rounded-full after:border after:border-primary/10" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-background/55 text-primary"><Plane aria-hidden="true" className="h-[18px] w-[18px]" /></span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{destination}</p>
                          <p className="mt-1 truncate font-mono text-[10px] text-muted">{booking.booking_reference || `Booking ${booking.id.slice(0, 8).toUpperCase()}`}</p>
                        </div>
                      </div>
                      <PortalStatusBadge status={booking.status} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3.5 sm:p-4">
                    <BookingDetail icon={CalendarDays} label="Start" value={startDate ? new Date(`${startDate.slice(0, 10)}T00:00:00`).toLocaleDateString() : "Not set"} />
                    <BookingDetail icon={CalendarDays} label="End" value={endDate ? new Date(`${endDate.slice(0, 10)}T00:00:00`).toLocaleDateString() : "Not set"} />
                    <BookingDetail icon={MapPin} label="Destination" value={destination} />
                    <BookingDetail icon={ReceiptText} label="Services" value={`${booking.booking_items?.length ?? 0} listed`} />
                  </div>
                  <div className="flex items-center justify-between border-t border-border px-4 py-3">
                    <span className="text-xs font-medium text-foreground">
                      {booking.total_amount !== null && booking.total_amount !== undefined && booking.currency
                        ? `${booking.currency} ${Number(booking.total_amount).toLocaleString()}`
                        : "Price not listed"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Booking details <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <PortalEmptyState
            icon={Plane}
            emoji="✈️"
            title="Your bookings will land here"
            description="Once an accepted quote moves into fulfillment, TISA will add confirmed and in-progress service details to this page."
            action={{ label: "Explore my requests", href: "/account/requests" }}
          />
        )}
      </section>
    </main>
  );
}

function BookingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/40 p-2.5">
      <p className="flex items-center gap-1.5 text-[10px] text-muted"><Icon aria-hidden="true" className="h-3 w-3 text-primary" />{label}</p>
      <p className="mt-1 truncate text-xs font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
