import type { SavedTrip } from "@/types/trip";

const STORAGE_KEY = "travora_saved_trips";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getTrips(): SavedTrip[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as SavedTrip[];
  } catch (error) {
    console.error("[TISA] Failed to load saved trips:", error);
    return [];
  }
}

export function getTrip(id: string): SavedTrip | null {
  const trips = getTrips();

  return trips.find((trip) => trip.id === id) ?? null;
}

export function saveTrip(trip: SavedTrip): SavedTrip {
  if (!isBrowser()) {
    return trip;
  }

  try {
    const trips = getTrips();

    const existingIndex = trips.findIndex(
      (existingTrip) => existingTrip.id === trip.id,
    );

    let updatedTrips: SavedTrip[];

    if (existingIndex !== -1) {
      updatedTrips = [...trips];

      updatedTrips[existingIndex] = {
        ...trip,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedTrips = [
        {
          ...trip,
          createdAt: trip.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...trips,
      ];
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTrips),
    );

    return trip;
  } catch (error) {
    console.error("[TISA] Failed to save trip:", error);
    throw new Error("Unable to save trip.");
  }
}

export function deleteTrip(id: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const trips = getTrips();

    const updatedTrips = trips.filter(
      (trip) => trip.id !== id,
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedTrips),
    );
  } catch (error) {
    console.error("[TISA] Failed to delete trip:", error);
    throw new Error("Unable to delete trip.");
  }
}