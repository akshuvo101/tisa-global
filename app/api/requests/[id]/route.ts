import { NextResponse } from "next/server";
import { requireCustomerApi } from "@/lib/auth/api";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const auth = await requireCustomerApi();
    if (!auth.ok) {
      return auth.response;
    }

    const { data, error } = await auth.supabase
      .from("service_requests")
      .select(
        "*, request_services(*, service_catalog(*)), request_documents(*), request_messages(*), quotes(*, quote_items(*)), bookings(*, booking_items(*))",
      )
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .single();

    if (error) {
      console.error("GET /api/requests/[id] database error:", {
        id,
        userId: auth.user.id,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code:
              error.code === "PGRST116"
                ? "NOT_FOUND"
                : error.code || "DATABASE_ERROR",
            message:
              error.code === "PGRST116"
                ? "Request not found."
                : error.message || "Unable to load this request.",
            details: error.details ?? null,
            hint: error.hint ?? null,
          },
        },
        {
          status: error.code === "PGRST116" ? 404 : 500,
        },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/requests/[id] failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code:
            error &&
              typeof error === "object" &&
              "code" in error
              ? String(error.code)
              : "UNKNOWN_ERROR",
          message:
            error instanceof Error
              ? error.message
              : String(error),
          details:
            error &&
              typeof error === "object" &&
              "details" in error
              ? String(error.details ?? "")
              : null,
          hint:
            error &&
              typeof error === "object" &&
              "hint" in error
              ? String(error.hint ?? "")
              : null,
        },
      },
      { status: 500 }
    );
  }
}
