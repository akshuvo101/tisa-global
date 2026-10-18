
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   Configuration
========================================================= */

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 20;
const MAX_DATABASE_ROWS = 60;
const MAX_QUERY_TOKENS = 12;

/**
 * English and Bangla words that do not help distinguish
 * one event from another.
 */
const STOP_WORDS = new Set([
  // English
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "find",
  "show",
  "give",
  "want",
  "need",
  "please",
  "search",
  "looking",
  "about",
  "information",
  "details",
  "available",
  "upcoming",
  "near",
  "best",
  "me",
  "my",
  "can",
  "you",
  "are",
  "what",
  "which",
  "where",
  "when",
  "how",
  "get",
  "attend",
  "join",
  "international",
  "conference",
  "conferences",
  "event",
  "events",
  "summit",
  "workshop",
  "expo",
  "exhibition",
  "symposium",
  "congress",
  "invitation",
  "invitations",
  "academic",
  "research",
  "medical",
  "speaker",
  "presenter",

  // Bangla
  "এবং",
  "অথবা",
  "জন্য",
  "আমার",
  "আমাকে",
  "আমরা",
  "আমাদের",
  "আপনি",
  "আপনার",
  "একটি",
  "একটা",
  "কিছু",
  "কোন",
  "কোনো",
  "কোথায়",
  "কখন",
  "কিভাবে",
  "কীভাবে",
  "কি",
  "কী",
  "দাও",
  "দিন",
  "চাই",
  "খুঁজে",
  "দেখাও",
  "জানতে",
  "জানাও",
  "তথ্য",
  "বিস্তারিত",
  "সম্মেলন",
  "কনফারেন্স",
  "ইভেন্ট",
  "আমাকে",
]);

/* =========================================================
   Types
========================================================= */

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

type ScoredEvent = {
  event: EventRow;
  score: number;
};

/* =========================================================
   Text normalization and matching
========================================================= */

/**
 * Preserve Unicode letters and numbers so Bangla, English,
 * and other supported writing systems can be searched.
 */
function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  const normalized = normalize(value);

  return [
    ...new Set(
      normalized
        .split(/\s+/)
        .filter(
          (token) =>
            [...token].length >= 2 &&
            !STOP_WORDS.has(token),
        ),
    ),
  ].slice(0, MAX_QUERY_TOKENS);
}

/**
 * Recognize event-related requests in both English and Bangla.
 */
function hasEventIntent(message: string): boolean {
  const normalized = normalize(message);

  const englishIntent =
    /\b(conference|conferences|event|events|summit|workshop|expo|exhibition|symposium|congress|speaker|presenter|academic|invitation|invitations)\b/i.test(
      normalized,
    );

  const banglaIntent =
    /(সম্মেলন|কনফারেন্স|ইভেন্ট|অনুষ্ঠান|সেমিনার|প্রদর্শনী|আমন্ত্রণ|গবেষণা সম্মেলন)/u.test(
      normalized,
    );

  return englishIntent || banglaIntent;
}

function getEventSearchText(event: EventRow): string {
  return normalize(
    [
      event.title,
      event.description,
      event.country,
      event.city,
      event.category,
      event.event_type,
      event.organizer_name,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function scoreEvent(
  event: EventRow,
  queryTokens: string[],
): number {
  if (queryTokens.length === 0) {
    return 0;
  }

  const eventText = getEventSearchText(event);
  const eventTokens = new Set(tokens(eventText));

  return queryTokens.reduce((score, token) => {
    if (eventTokens.has(token)) {
      return score + 2;
    }

    // Allow a partial match for longer words, such as
    // "Singapore" appearing in a longer location field.
    if (
      [...token].length >= 5 &&
      eventText.includes(token)
    ) {
      return score + 1;
    }

    return score;
  }, 0);
}

/* =========================================================
   Safe empty result
========================================================= */

function noMatchingEvents(): string {
  return JSON.stringify({
    message:
      "No matching verified TISA events are currently available.",
    events: [],
  });
}

/* =========================================================
   Main event intelligence function
========================================================= */

export async function getVerifiedEventIntelligence(
  message: string,
  limit = DEFAULT_LIMIT,
): Promise<string> {
  if (!message.trim() || !hasEventIntent(message)) {
    return JSON.stringify({
      message: "No event search requested.",
      events: [],
    });
  }

  const safeLimit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(limit) || DEFAULT_LIMIT),
  );

  const queryTokens = tokens(message);

  try {
    const supabase = await createClient();

    // Only dated events starting after today qualify as upcoming.
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("events")
      .select(
        [
          "id",
          "title",
          "slug",
          "description",
          "country",
          "city",
          "start_date",
          "end_date",
          "organizer_name",
          "category",
          "event_type",
          "registration_status",
          "registration_url",
          "last_verified_at",
        ].join(","),
      )
      .eq("verification_status", "verified")
      .neq("status", "cancelled")
      .gt("start_date", today)
      .order("start_date", {
        ascending: true,
        nullsFirst: false,
      })
      .limit(MAX_DATABASE_ROWS);

    if (error) {
      console.error(
        "[TISA Events] Failed to fetch verified events.",
        error.message,
      );

      return noMatchingEvents();
    }

    const events: EventRow[] = (data ?? []) as unknown as EventRow[];

    if (events.length === 0) {
      return noMatchingEvents();
    }

    /* -----------------------------------------------------
       Rank matching events
    ----------------------------------------------------- */

    const rankedEvents: ScoredEvent[] = events
      .map((event) => ({
        event,
        score: scoreEvent(event, queryTokens),
      }))
      .filter(
        ({ score }) =>
          queryTokens.length === 0 || score > 0,
      )
      .sort((a, b) => {
        // More relevant events first.
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        // Earlier upcoming events first when relevance ties.
        return String(
          a.event.start_date ?? "9999-12-31",
        ).localeCompare(
          String(b.event.start_date ?? "9999-12-31"),
        );
      })
      .slice(0, safeLimit);

    if (rankedEvents.length === 0) {
      return noMatchingEvents();
    }

    const selectedEvents = rankedEvents.map(
      ({ event }) => event,
    );

    const eventIds = selectedEvents.map(
      (event) => event.id,
    );

    /* -----------------------------------------------------
       Fetch sources and invitation information
    ----------------------------------------------------- */

    const [
      { data: sourceData, error: sourceError },
      { data: invitationData, error: invitationError },
    ] = await Promise.all([
      supabase
        .from("event_sources")
        .select(
          "event_id,source_name,source_url,is_primary,last_verified_at",
        )
        .in("event_id", eventIds)
        .order("is_primary", { ascending: false }),

      supabase
        .from("event_invitations")
        .select(
          [
            "event_id",
            "availability",
            "invitation_type",
            "eligibility",
            "requirements",
            "official_information_url",
            "last_verified_at",
          ].join(","),
        )
        .in("event_id", eventIds),
    ]);

    if (sourceError) {
      console.error(
        "[TISA Events] Failed to fetch event sources.",
        sourceError.message,
      );
    }

    if (invitationError) {
      console.error(
        "[TISA Events] Failed to fetch invitation details.",
        invitationError.message,
      );
    }

    /* -----------------------------------------------------
       Index related data
    ----------------------------------------------------- */

    const sourceMap = new Map<string, SourceRow>();
    const invitationMap = new Map<string, InvitationRow>();

    for (const source of (sourceData ?? []) as SourceRow[]) {
      // Sources are ordered by primary status, so the first
      // source for an event is preferred.
      if (!sourceMap.has(source.event_id)) {
        sourceMap.set(source.event_id, source);
      }
    }

    const invitations: InvitationRow[] = (invitationData ??
      []) as unknown as InvitationRow[];

    for (const invitation of invitations) {
      if (!invitationMap.has(invitation.event_id)) {
        invitationMap.set(
          invitation.event_id,
          invitation,
        );
      }
    }

    /* -----------------------------------------------------
       Return structured, grounded event data
    ----------------------------------------------------- */

    const result = selectedEvents.map((event) => {
      const source = sourceMap.get(event.id);
      const invitation = invitationMap.get(event.id);

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        country: event.country,
        city: event.city,
        startDate: event.start_date,
        endDate: event.end_date,
        category: event.category,
        eventType: event.event_type,
        organizer: event.organizer_name,
        registrationStatus: event.registration_status,
        registrationUrl: event.registration_url,

        invitationAvailability:
          invitation?.availability ?? null,

        invitationType:
          invitation?.invitation_type ?? null,

        invitationEligibility:
          invitation?.eligibility ?? null,

        invitationRequirements:
          invitation?.requirements ?? null,

        invitationInfoUrl:
          invitation?.official_information_url ?? null,

        lastVerifiedAt:
          event.last_verified_at ??
          source?.last_verified_at ??
          invitation?.last_verified_at ??
          null,

        sourceName: source?.source_name ?? null,
        sourceUrl: source?.source_url ?? null,
      };
    });

    return JSON.stringify({
      message: "Verified TISA event search results.",
      count: result.length,
      events: result,
    });
  } catch (error) {
    console.error(
      "[TISA Events] Event intelligence failed.",
      error instanceof Error ? error.message : "Unknown error",
    );

    return noMatchingEvents();
  }
}
