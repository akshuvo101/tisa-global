import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  return normalize(value).split(" ").filter((token) => token.length >= 3);
}

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  country: string | null;
  city: string | null;
  start_date: string | null;
  end_date: string | null;
  organizer_name: string | null;
  category: string | null;
  event_type: string | null;
  registration_status: string | null;
  registration_url: string | null;
  last_verified_at: string | null;
};

type SourceRow = {
  event_id: string;
  source_name: string;
  source_url: string;
  is_primary: boolean;
  last_verified_at: string | null;
};

type InvitationRow = {
  event_id: string;
  availability: string | null;
  invitation_type: string | null;
  eligibility: string | null;
  requirements: string | null;
  official_information_url: string | null;
  last_verified_at: string | null;
};

export async function getVerifiedEventIntelligence(message: string, limit = 12) {
  const eventIntent = /\b(conference|conferences|event|events|summit|workshop|expo|exhibition|symposium|congress|speaker|presenter|academic|medical conference|research conference|invitation)\b/i.test(message);
  if (!eventIntent) {
    return "No event search requested.";
  }

  const supabase = await createClient();
  const now = new Date().toISOString().slice(0, 10);
  const queryTokens = tokens(message).slice(0, 10);

  const { data, error } = await supabase
    .from("events")
    .select("id,title,slug,description,country,city,start_date,end_date,organizer_name,category,event_type,registration_status,registration_url,last_verified_at")
    .eq("verification_status", "verified")
    .neq("status", "cancelled")
    .or(`end_date.gte.${now},end_date.is.null`)
    .order("start_date", { ascending: true, nullsFirst: false })
    .limit(60);

  const events = (data ?? []) as EventRow[];
  if (error || !events.length) {
    return "No matching verified TISA events are currently available.";
  }

  const scored = events
    .map((event: EventRow) => {
      const haystack = normalize([
        event.title,
        event.description,
        event.country,
        event.city,
        event.category,
        event.event_type,
        event.organizer_name,
      ].filter(Boolean).join(" "));
      const score = queryTokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      return { event, score };
    })
    .sort((a: { event: EventRow; score: number }, b: { event: EventRow; score: number }) => b.score - a.score || String(a.event.start_date ?? "9999").localeCompare(String(b.event.start_date ?? "9999")))
    .slice(0, limit)
    .map(({ event }: { event: EventRow }) => event);

  if (!scored.length) return "No matching verified TISA events are currently available.";

  const ids = scored.map((event: EventRow) => event.id);
  const [{ data: sourceData }, { data: invitationData }] = await Promise.all([
    supabase.from("event_sources").select("event_id,source_name,source_url,is_primary,last_verified_at").in("event_id", ids).order("is_primary", { ascending: false }),
    supabase.from("event_invitations").select("event_id,availability,invitation_type,eligibility,requirements,official_information_url,last_verified_at").in("event_id", ids),
  ]);

  const sources = (sourceData ?? []) as SourceRow[];
  const invitations = (invitationData ?? []) as InvitationRow[];
  const sourceMap = new Map<string, SourceRow>();
  for (const source of sources) if (!sourceMap.has(source.event_id)) sourceMap.set(source.event_id, source);
  const invitationMap = new Map<string, InvitationRow>();
  for (const invitation of invitations) invitationMap.set(invitation.event_id, invitation);

  return scored.map((event: EventRow) => {
    const source = sourceMap.get(event.id);
    const invitation = invitationMap.get(event.id);
    return JSON.stringify({
      id: event.id,
      title: event.title,
      slug: event.slug,
      country: event.country,
      city: event.city,
      startDate: event.start_date,
      endDate: event.end_date,
      category: event.category,
      eventType: event.event_type,
      organizer: event.organizer_name,
      registrationStatus: event.registration_status,
      registrationUrl: event.registration_url,
      invitationAvailability: invitation?.availability ?? null,
      invitationType: invitation?.invitation_type ?? null,
      invitationEligibility: invitation?.eligibility ?? null,
      invitationRequirements: invitation?.requirements ?? null,
      invitationInfoUrl: invitation?.official_information_url ?? null,
      lastVerifiedAt: event.last_verified_at ?? source?.last_verified_at ?? null,
      sourceName: source?.source_name ?? null,
      sourceUrl: source?.source_url ?? null,
    });
  }).join("\n");
}
