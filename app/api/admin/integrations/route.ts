import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { integrationSources } from "@/lib/integrations/registry";
import { runEventSync } from "@/lib/integrations/sync/runSync";

async function authorized() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null };
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, role: data?.role ?? null };
}

export async function GET() {
  const { supabase, user, role } = await authorized();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Operations access required." } }, { status: 403 });
  const { data, error } = await supabase.from("integration_sync_runs").select("id,provider,kind,status,started_at,completed_at,records_found,records_created,records_updated,records_skipped,error_message").order("started_at", { ascending: false }).limit(40);
  if (error) {
    console.error("[Integrations GET] Database query failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to load integration runs.",
        },
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true, data: { sources: integrationSources, runs: data ?? [] } });
}

export async function POST(request: Request) {
  const { user, role } = await authorized();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } }, { status: 401 });
  if (role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Operations access required." } }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { action?: string };
  if (body.action !== "sync_events") return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Unsupported integration action." } }, { status: 422 });
  try {
    const result = await runEventSync();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "SYNC_FAILED", message: error instanceof Error ? error.message : "Integration sync failed." } }, { status: 500 });
  }
}
