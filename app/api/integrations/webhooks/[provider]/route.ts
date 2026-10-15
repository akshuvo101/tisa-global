import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const expected = process.env.TISA_WEBHOOK_SECRET;
  if (!expected) return NextResponse.json({ success: false, error: { code: "NOT_CONFIGURED", message: "Webhook secret is not configured." } }, { status: 503 });
  if (request.headers.get("x-tisa-webhook-secret") !== expected) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid webhook secret." } }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false, error: { code: "INVALID_PAYLOAD", message: "JSON payload required." } }, { status: 422 });

  const supabase = await createClient();
  const { error } = await supabase.from("integration_webhook_events").insert({ provider, payload: body });
  if (error) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Unable to record webhook." } }, { status: 500 });
  return NextResponse.json({ success: true, data: { accepted: true } }, { status: 202 });
}
