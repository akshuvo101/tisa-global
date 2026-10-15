import { createClient } from "@/lib/supabase/server";
import type { SyncStats, SyncStatus } from "@/lib/integrations/types";

export async function createSyncRun(provider: string, kind: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("integration_sync_runs").insert({ provider, kind, status: "running" }).select().single();
  if (error) throw error;
  return data.id as string;
}

export async function finishSyncRun(id: string, status: SyncStatus, stats: SyncStats, errorMessage?: string | null) {
  const supabase = await createClient();
  await supabase.from("integration_sync_runs").update({
    status,
    completed_at: new Date().toISOString(),
    records_found: stats.recordsFound,
    records_created: stats.recordsCreated,
    records_updated: stats.recordsUpdated,
    records_skipped: stats.recordsSkipped,
    error_message: errorMessage ?? null,
  }).eq("id", id);
}
