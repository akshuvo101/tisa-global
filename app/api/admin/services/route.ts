import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("service_catalog")
    .select(`
      id,
      name,
      slug,
      category,
      short_description,
      description,
      icon,
      active,
      sort_order,
      created_at
    `)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("GET /api/admin/services failed", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to load services.",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: services ?? [],
  });
}