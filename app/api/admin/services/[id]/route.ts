import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  const { id } = await params;

  const supabase = await createClient();

  const body = await request.json();

  if (typeof body.active !== "boolean") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "A valid active value is required.",
        },
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("service_catalog")
    .update({
      active: body.active,
    })
    .eq("id", id)
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
    .maybeSingle();

  if (error) {
    console.error(
      `PATCH /api/admin/services/${id} failed`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to update service.",
        },
      },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Service not found.",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}