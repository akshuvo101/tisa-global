export type PackageTravelStyle =
  | "budget"
  | "balanced"
  | "comfort"
  | "luxury";

export type TravelPackage = {
  id: string;

  title: string;
  destination: string;
  destinationId: string;
  country: string;

  imageUrl: string;

  durationDays: number;
  durationNights: number;

  departureCity: string;

  travelStyle: PackageTravelStyle;

  price: number;
  currency: string;
  pricePerPerson?: boolean;

  description: string;

  featured?: boolean;

  inclusions: string[];
  exclusions: string[];

  itinerary: {
    day: number;
    title: string;
    activities: string[];
  }[];

  accommodation?: {
    name: string;
    nights: number;
    roomType?: string;
  };

  transportation?: string[];

  visaAssistance?: boolean;

  cancellationPolicy?: string;

  agency: {
    name: string;
    description?: string;
  };

  availability?: string;
};