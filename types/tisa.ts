export const serviceCategories = [
  "conferences",
  "visa",
  "flights",
  "medical",
  "education",
  "packages",
  "custom",
] as const;

export type ServiceCategory = (typeof serviceCategories)[number];

export const requestStatuses = [
  "requested",
  "reviewing",
  "need_documents",
  "documents_received",
  "quoted",
  "quote_accepted",
  "processing",
  "confirmed",
  "completed",
  "cancelled",
  "on_hold",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export const requestPriorities = ["normal", "high", "urgent"] as const;
export type RequestPriority = (typeof requestPriorities)[number];

export interface ServiceCatalogItem {
  id: string;
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string | null;
  short_description: string | null;
  icon: string | null;
  active: boolean;
  sort_order: number;
}

export interface ServiceRequestInput {
  event_id?: string | null;
  destination_country?: string | null;
  destination_city?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  traveler_count?: number;
  priority?: RequestPriority;
  description: string;
  service_ids: string[];
}
