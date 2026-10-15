"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteTrip, getTrips } from "@/lib/trips/storage";
import type { SavedTrip } from "@/types/trip";
import Navbar from "@/components/layout/Navbar";

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
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

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTrips(getTrips());
    setLoaded(true);
  }, []);

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved trip?"
    );

    if (!confirmed) {
      return;
    }

    deleteTrip(id);

    setTrips((currentTrips) =>
      currentTrips.filter((trip) => trip.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-8">
        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Your travel plans
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            My Trips
          </h1>

          <p className="mt-4 text-base leading-7 text-muted sm:text-lg">
            Your saved journeys, ready whenever you are.
          </p>
        </div>

        {/* Loading */}
        {!loaded && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-sm text-muted">Loading your trips...</p>
          </div>
        )}

        {/* Empty state */}
        {loaded && trips.length === 0 && (
          <div className="rounded-3xl border border-border bg-surface px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-light text-2xl">
              ✈️
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              No saved trips yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
              Start planning your next journey and save it here so you can
              come back to it anytime.
            </p>

            <Link
              href="/planner"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              Plan a Trip
            </Link>
          </div>
        )}

        {/* Trips */}
        {loaded && trips.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {trips.map((trip) => {
              const destination = trip.profile.destination || "Unknown destination";

              const duration = trip.profile.durationDays
                ? `${trip.profile.durationDays} ${
                    trip.profile.durationDays === 1 ? "day" : "days"
                  }`
                : "Flexible duration";

              const travelers = trip.profile.travelers
                ? `${trip.profile.travelers} ${
                    trip.profile.travelers === 1 ? "traveler" : "travelers"
                  }`
                : "Travelers not set";

              return (
                <article
                  key={trip.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-surface transition hover:border-primary/30"
                >
                  {/* Top */}
                  <div className="border-b border-border bg-surface-light p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                          Saved trip
                        </p>

                        <h2 className="mt-2 truncate text-2xl font-semibold">
                          {trip.title}
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                          {destination}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
                        {formatDate(trip.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-border bg-surface-light p-4">
                        <p className="text-xs text-muted">Duration</p>
                        <p className="mt-1 text-sm font-medium">
                          {duration}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-surface-light p-4">
                        <p className="text-xs text-muted">Travelers</p>
                        <p className="mt-1 text-sm font-medium">
                          {travelers}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-surface-light p-4">
                        <p className="text-xs text-muted">Style</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatTravelStyle(trip.profile.travelStyle)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-surface-light p-4">
                        <p className="text-xs text-muted">From</p>
                        <p className="mt-1 truncate text-sm font-medium">
                          {trip.profile.departureCity || "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="mt-4 rounded-2xl border border-border bg-surface-light p-5">
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted">
                            Estimated trip cost
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            {trip.costEstimate.currency}{" "}
                            {trip.costEstimate.total.min.toLocaleString()}{" "}
                            –{" "}
                            {trip.costEstimate.currency}{" "}
                            {trip.costEstimate.total.max.toLocaleString()}
                          </p>
                        </div>

                        {trip.profile.budget && (
                          <div className="text-right">
                            <p className="text-xs text-muted">
                              Your budget
                            </p>

                            <p className="mt-1 text-sm font-semibold text-secondary">
                              {trip.profile.currency}{" "}
                              {trip.profile.budget.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-muted">
                        {trip.costEstimate.note}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
                      >
                        View Trip
                        <span className="ml-2">→</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(trip.id)}
                        className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:border-red-400/30 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}