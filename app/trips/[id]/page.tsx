"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteTrip, getTrip } from "@/lib/trips/storage";
import type { SavedTrip } from "@/types/trip";
import Navbar from "@/components/layout/Navbar";

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "Recently saved";
  }
}

function formatTravelStyle(style: SavedTrip["profile"]["travelStyle"]) {
  if (!style) return "Flexible";

  return style.charAt(0).toUpperCase() + style.slice(1);
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [loaded, setLoaded] = useState(false);

  const tripId = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    if (!tripId) {
      setLoaded(true);
      return;
    }

    const savedTrip = getTrip(tripId);

    setTrip(savedTrip);
    setLoaded(true);
  }, [tripId]);

  function handleDelete() {
    if (!trip) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved trip?"
    );

    if (!confirmed) {
      return;
    }

    deleteTrip(trip.id);
    router.push("/trips");
  }

  if (!loaded) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-8">
          <div className="rounded-3xl border border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted">Loading trip...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-20 text-center lg:px-8">
          <div className="rounded-3xl border border-border bg-surface px-6 py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-light text-2xl">
              🧭
            </div>

            <h1 className="mt-6 text-3xl font-semibold">
              Trip not found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              This saved trip may have been deleted or is no longer available
              on this device.
            </p>

            <Link
              href="/trips"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Back to My Trips
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const destination = trip.profile.destination || "Your destination";

  const duration = trip.profile.durationDays
    ? `${trip.profile.durationDays} ${
        trip.profile.durationDays === 1 ? "day" : "days"
      }`
    : "Flexible";

  const travelers = trip.profile.travelers
    ? `${trip.profile.travelers} ${
        trip.profile.travelers === 1 ? "traveler" : "travelers"
      }`
    : "Not specified";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-8">
        {/* Back */}
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <span>←</span>
          Back to My Trips
        </Link>

        {/* Hero */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="border-b border-border bg-surface-light px-6 py-8 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  Saved trip
                </div>

                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {trip.title}
                </h1>

                <p className="mt-3 text-base text-muted">
                  {destination}
                </p>
              </div>

              <div className="text-sm text-muted">
                Saved on {formatDate(trip.createdAt)}
              </div>
            </div>
          </div>

          {/* Trip summary */}
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            <div className="p-5 sm:p-6">
              <p className="text-xs text-muted">Duration</p>
              <p className="mt-1 text-base font-semibold">{duration}</p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs text-muted">Travelers</p>
              <p className="mt-1 text-base font-semibold">{travelers}</p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs text-muted">Departure</p>
              <p className="mt-1 truncate text-base font-semibold">
                {trip.profile.departureCity || "Not set"}
              </p>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs text-muted">Travel style</p>
              <p className="mt-1 text-base font-semibold">
                {formatTravelStyle(trip.profile.travelStyle)}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Itinerary */}
          <section>
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Your journey
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Trip Itinerary
              </h2>
            </div>

            <div className="space-y-4">
              {trip.itinerary.length > 0 ? (
                trip.itinerary.map((day) => (
                  <article
                    key={day.day}
                    className="rounded-3xl border border-border bg-surface p-6"
                  >
                    <div className="flex gap-5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary-soft text-sm font-semibold text-primary">
                        {day.day}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                          Day {day.day}
                        </p>

                        <h3 className="mt-1 text-lg font-semibold">
                          {day.title}
                        </h3>

                        {day.activities.length > 0 && (
                          <ul className="mt-4 space-y-2.5">
                            {day.activities.map((activity, index) => (
                              <li
                                key={`${day.day}-${index}`}
                                className="flex gap-3 text-sm leading-6 text-muted"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-border bg-surface p-8 text-center">
                  <p className="text-sm text-muted">
                    No itinerary details were saved for this trip.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Cost */}
            <section className="rounded-3xl border border-border bg-surface p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Budget
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Estimated Cost
              </h2>

              <div className="mt-5 rounded-2xl border border-border bg-surface-light p-5">
                <p className="text-xs text-muted">Total estimate</p>

                <p className="mt-1 text-2xl font-semibold">
                  {trip.costEstimate.currency}{" "}
                  {trip.costEstimate.total.min.toLocaleString()}
                  <span className="mx-1 text-muted">–</span>
                  {trip.costEstimate.currency}{" "}
                  {trip.costEstimate.total.max.toLocaleString()}
                </p>
              </div>

              {trip.profile.budget && (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-secondary/20 bg-secondary-soft px-4 py-3">
                  <span className="text-xs text-muted">Your budget</span>

                  <span className="text-sm font-semibold text-secondary">
                    {trip.profile.currency}{" "}
                    {trip.profile.budget.toLocaleString()}
                  </span>
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-muted">
                {trip.costEstimate.note}
              </p>
            </section>

            {/* Trip context */}
            <section className="rounded-3xl border border-border bg-surface p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Trip details
              </p>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">Destination</span>
                  <span className="text-right text-sm font-medium">
                    {destination}
                  </span>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">Departure</span>
                  <span className="text-right text-sm font-medium">
                    {trip.profile.departureCity || "Not set"}
                  </span>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">Travelers</span>
                  <span className="text-right text-sm font-medium">
                    {travelers}
                  </span>
                </div>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted">Style</span>
                  <span className="text-right text-sm font-medium">
                    {formatTravelStyle(trip.profile.travelStyle)}
                  </span>
                </div>
              </div>
            </section>

            {/* Actions */}
            <section className="rounded-3xl border border-border bg-surface p-6">
              <div className="space-y-3">
                <Link
                  href={`/planner?destination=${encodeURIComponent(
                    trip.profile.destinationId || destination
                  )}&departure=${encodeURIComponent(
                    trip.profile.departureCity || ""
                  )}&travelers=${trip.profile.travelers || 1}&duration=${
                    trip.profile.durationDays || ""
                  }&budget=${trip.profile.budget || ""}&style=${
                    trip.profile.travelStyle || ""
                  }`}
                  className="flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  Continue Planning
                </Link>

                <Link
                  href={`/ai?destination=${encodeURIComponent(
                    trip.profile.destinationId || destination
                  )}`}
                  className="flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/30 hover:text-primary"
                >
                  Ask TISA AI
                </Link>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-muted transition hover:text-red-400"
                >
                  Delete Trip
                </button>
              </div>
            </section>
          </aside>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl border border-border bg-surface px-5 py-4">
          <p className="text-xs leading-5 text-muted">
            TISA AI provides travel guidance and estimates. Always verify
            current visa, entry, pricing, and legal requirements with official
            sources before traveling.
          </p>
        </div>
      </section>
    </main>
  );
}