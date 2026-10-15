import { createClient } from "@/lib/supabase/server";
import { httpJsonEventProvider } from "@/lib/integrations/events/providers/http-json";
import { createSyncRun, finishSyncRun } from "@/lib/integrations/sync/recordSync";
import type { NormalizedEvent, SyncStats } from "@/lib/integrations/types";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export async function runEventSync() {
  const runId = await createSyncRun(httpJsonEventProvider.key, "events");
  const stats: SyncStats = { recordsFound: 0, recordsCreated: 0, recordsUpdated: 0, recordsSkipped: 0 };
  try {
    if (!httpJsonEventProvider.configured()) {
      await finishSyncRun(runId, "not_configured", stats, "TISA_EVENT_PROVIDER_URL is not configured.");
      return { runId, status: "not_configured" as const, stats };
    }

    const events = await httpJsonEventProvider.fetchEvents();
    stats.recordsFound = events.length;
    const supabase = await createClient();

    for (const item of events) {
      const result = await upsertNormalizedEvent(supabase, item);
      stats.recordsCreated += result === "created" ? 1 : 0;
      stats.recordsUpdated += result === "updated" ? 1 : 0;
      stats.recordsSkipped += result === "skipped" ? 1 : 0;
    }

    await finishSyncRun(runId, "completed", stats);
    return { runId, status: "completed" as const, stats };
  } catch (error) {
    await finishSyncRun(runId, "failed", stats, error instanceof Error ? error.message : "Unknown sync error");
    throw error;
  }
}

async function upsertNormalizedEvent(supabase: Awaited<ReturnType<typeof createClient>>, item: NormalizedEvent) {
  const externalKey = `${httpJsonEventProvider.key}:${item.externalId}`;
  const { data: existing } = await supabase.from("events").select("id,slug,verification_status").eq("external_source_key", externalKey).maybeSingle();
  if (existing?.verification_status === "verified") return "skipped" as const;

  let slug = item.slug || slugify(item.title);
  const { data: slugMatch } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
  if (slugMatch && slugMatch.id !== existing?.id) slug = `${slug}-${item.externalId.slice(0, 8).toLowerCase()}`;

  const payload = {
    external_source_key: externalKey,
    title: item.title,
    slug,
    description: item.description ?? null,
    country: item.country ?? null,
    city: item.city ?? null,
    venue: item.venue ?? null,
    start_date: item.startDate ?? null,
    end_date: item.endDate ?? null,
    organizer_name: item.organizerName ?? null,
    organizer_website: item.organizerWebsite ?? null,
    event_type: item.eventType ?? null,
    category: item.category ?? null,
    registration_status: item.registrationStatus ?? null,
    registration_url: item.registrationUrl ?? null,
    status: "draft",
    verification_status: "under_review",
    last_verified_at: null,
    verification_notes: "Imported from external source; requires TISA verification before publication.",
  };

  const { data: event, error } = existing
    ? await supabase.from("events").update(payload).eq("id", existing.id).select("id").single()
    : await supabase.from("events").insert(payload).select("id").single();
  if (error || !event) throw error ?? new Error("Unable to store normalized event.");

  await supabase.from("event_sources").upsert({ event_id: event.id, source_name: item.sourceName, source_url: item.sourceUrl, source_type: item.sourceType, is_primary: true }, { onConflict: "event_id,source_url" });
  if (item.invitation) {
    await supabase.from("event_invitations").upsert({ event_id: event.id, availability: item.invitation.availability ?? "unknown", invitation_type: item.invitation.invitationType ?? null, eligibility: item.invitation.eligibility ?? null, requirements: item.invitation.requirements ?? null, official_information_url: item.invitation.officialInformationUrl ?? null }, { onConflict: "event_id" });
  }
  return existing ? "updated" as const : "created" as const;
}
