export type IntegrationKind = "events" | "flights" | "hotels" | "visa" | "email" | "whatsapp" | "social";
export type SyncStatus = "running" | "completed" | "failed" | "not_configured";

export type IntegrationSource = {
  key: string;
  name: string;
  kind: IntegrationKind;
  enabled: boolean;
  configured: boolean;
  description: string;
};

export type SyncStats = {
  recordsFound: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
};

export type NormalizedEvent = {
  externalId: string;
  title: string;
  slug?: string;
  description?: string | null;
  country?: string | null;
  city?: string | null;
  venue?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  organizerName?: string | null;
  organizerWebsite?: string | null;
  eventType?: string | null;
  category?: string | null;
  registrationStatus?: string | null;
  registrationUrl?: string | null;
  sourceUrl: string;
  sourceName: string;
  sourceType: string;
  invitation?: {
    availability?: string | null;
    invitationType?: string | null;
    eligibility?: string | null;
    requirements?: string | null;
    officialInformationUrl?: string | null;
  };
};

export type EventProvider = {
  key: string;
  name: string;
  configured(): boolean;
  fetchEvents(): Promise<NormalizedEvent[]>;
};
