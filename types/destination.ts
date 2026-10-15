export type DestinationCategory =
  | "city"
  | "beach"
  | "mountain"
  | "nature"
  | "culture"
  | "history"
  | "adventure"
  | "shopping"
  | "food"
  | "island"
  | "desert"
  | "religious"
  | "ski"
  | "wellness";

export type Destination = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city?: string;

  description: string;

  category: DestinationCategory[];

  bestTimeToVisit?: string;

  recommendedDays?: {
    min: number;
    max: number;
  };

  imageUrl: string;

  featured?: boolean;
};