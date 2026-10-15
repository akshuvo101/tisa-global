import type { NormalizedEvent } from "@/lib/integrations/types";

export function normalizeEvent(input: Record<string, unknown>, source: { name: string; type: string; url: string }): NormalizedEvent | null {
  const title = String(input.title ?? input.name ?? "").trim();
  const externalId = String(input.externalId ?? input.external_id ?? input.id ?? "").trim();
  if (!title || !externalId) return null;

  const date = (value: unknown) => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  };

  return {
    externalId,
    title,
    slug: input.slug ? String(input.slug) : undefined,
    description: input.description ? String(input.description) : null,
    country: input.country ? String(input.country) : null,
    city: input.city ? String(input.city) : null,
    venue: input.venue ? String(input.venue) : null,
    startDate: date(input.startDate ?? input.start_date),
    endDate: date(input.endDate ?? input.end_date),
    organizerName: input.organizerName ? String(input.organizerName) : input.organizer_name ? String(input.organizer_name) : null,
    organizerWebsite: input.organizerWebsite ? String(input.organizerWebsite) : input.organizer_website ? String(input.organizer_website) : null,
    eventType: input.eventType ? String(input.eventType) : input.event_type ? String(input.event_type) : null,
    category: input.category ? String(input.category) : null,
    registrationStatus: input.registrationStatus ? String(input.registrationStatus) : input.registration_status ? String(input.registration_status) : null,
    registrationUrl: input.registrationUrl ? String(input.registrationUrl) : input.registration_url ? String(input.registration_url) : null,
    sourceUrl: String(input.sourceUrl ?? input.source_url ?? source.url),
    sourceName: source.name,
    sourceType: source.type,
    invitation: input.invitation && typeof input.invitation === "object" ? {
      availability: String((input.invitation as Record<string, unknown>).availability ?? "unknown"),
      invitationType: (input.invitation as Record<string, unknown>).invitationType ? String((input.invitation as Record<string, unknown>).invitationType) : null,
      eligibility: (input.invitation as Record<string, unknown>).eligibility ? String((input.invitation as Record<string, unknown>).eligibility) : null,
      requirements: (input.invitation as Record<string, unknown>).requirements ? String((input.invitation as Record<string, unknown>).requirements) : null,
      officialInformationUrl: (input.invitation as Record<string, unknown>).officialInformationUrl ? String((input.invitation as Record<string, unknown>).officialInformationUrl) : null,
    } : undefined,
  };
}
