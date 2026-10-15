import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_catalog")
    .select("id,name,slug,category,short_description,icon")
    .eq("active", true)
    .order("sort_order");

  if (error) {
    console.error("GET /api/services failed", error);
    return NextResponse.json({ success: false, error: { code: "DATABASE_ERROR", message: "Unable to load services." } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
