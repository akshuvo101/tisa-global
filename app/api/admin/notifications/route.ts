import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Operations access required." } }, { status: 403 });
  const { data, error } = await supabase.from("notification_deliveries").select("id,notification_id,channel,status,attempts,started_at,completed_at,error_message,created_at,notifications(user_id,type,title,message,related_request_id)").order("created_at", { ascending: false }).limit(100);
  if (error) {
    console.error("[Admin Notifications GET] Database query failed:", {
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
          message: "Unable to load delivery logs.",
        },
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true, data: data ?? [] });
}
