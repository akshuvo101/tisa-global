import type { TravelProfile } from "@/types/ai";

export type SavedTripItineraryDay = {
  day: number;
  title: string;
  activities: string[];
};

export type SavedTripCostEstimate = {
  currency: string;

  total: {
    min: number;
    max: number;
  };

  /*
   * Detailed cost categories can be added later when
   * TISA receives verified breakdown data.
   */
  flight?: {
    min: number;
    max: number;
  };

  accommodation?: {
    min: number;
    max: number;
  };

  food?: {
    min: number;
    max: number;
  };

  transport?: {
    min: number;
    max: number;
  };

  activities?: {
    min: number;
    max: number;
  };

  visaAndFees?: {
    min: number;
    max: number;
  };

  insurance?: {
    min: number;
    max: number;
  };

  misc?: {
    min: number;
    max: number;
  };

  note: string;
};

export type SavedTripDocument = {
  name: string;
  description: string;
  status: "likely" | "depends" | "verify";
};

export type SavedTrip = {
  id: string;

  title: string;

  profile: TravelProfile;

  itinerary: SavedTripItineraryDay[];

  costEstimate: SavedTripCostEstimate;

  /*
   * Documents are optional for now because the Planner
   * does not yet receive the AI document data.
   */
  documents?: SavedTripDocument[];

  createdAt: string;
  updatedAt: string;
};