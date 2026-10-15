import { NextResponse } from "next/server";
import { requireCustomerApi } from "@/lib/auth/api";
import { createServiceRequest } from "@/lib/requests/createRequest";
import { createRequestSchema } from "@/lib/requests/schema";

export async function POST(request: Request) {
  try {
    const auth = await requireCustomerApi();
    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();
    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid request." } },
        { status: 422 }
      );
    }

    const serviceRequest = await createServiceRequest(
      auth.supabase,
      auth.user.id,
      parsed.data,
    );

    return NextResponse.json({ success: true, data: serviceRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "INVALID_SERVICES") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_SERVICES", message: error.message } },
        { status: 422 }
      );
    }

    console.error("POST /api/requests failed", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Unable to create the service request." } },
      { status: 500 }
    );
  }
}

export async function GET() {
  const auth = await requireCustomerApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("service_requests")
    .select("*, request_services(*, service_catalog(*))")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/requests failed", error);
    return NextResponse.json(
      { success: false, error: { code: "DATABASE_ERROR", message: "Unable to load your requests." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
