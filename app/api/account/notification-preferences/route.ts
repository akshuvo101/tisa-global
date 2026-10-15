import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } }, { status: 401 });
  const { data, error } = await supabase.from("notification_preferences").select("id,notification_type,channel,enabled").eq("user_id", user.id).order("notification_type");
  if (error) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Unable to load preferences." } }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { notification_type?: string; channel?: string; enabled?: boolean };
  if (!body.notification_type || !["in_app", "email", "whatsapp"].includes(body.channel ?? "") || typeof body.enabled !== "boolean") return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "notification_type, channel and enabled are required." } }, { status: 422 });
  const { data, error } = await supabase.from("notification_preferences").upsert({ user_id: user.id, notification_type: body.notification_type, channel: body.channel, enabled: body.enabled, updated_at: new Date().toISOString() }, { onConflict: "user_id,notification_type,channel" }).select().single();
  if (error) return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Unable to save preference." } }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
