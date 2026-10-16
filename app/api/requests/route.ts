
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "Request body must contain valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    const parsed = createRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              parsed.error.issues[0]?.message ?? "Invalid request.",
          },
        },
        { status: 422 }
      );
    }

    const serviceRequest = await createServiceRequest(
      auth.supabase,
      auth.user.id,
      parsed.data
    );

    return NextResponse.json(
      {
        success: true,
        data: serviceRequest,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "INVALID_SERVICES") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_SERVICES",
              message: error.message,
            },
          },
          { status: 422 }
        );
      }

      if (error.name === "INVALID_EVENT") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_EVENT",
              message: error.message,
            },
          },
          { status: 422 }
        );
      }

      if (error.name === "AUTH_REQUIRED") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTH_REQUIRED",
              message: error.message,
            },
          },
          { status: 401 }
        );
      }
    }

    console.error("POST /api/requests failed", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to create the service request.",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Unable to load your requests.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET /api/requests failed", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to load your requests.",
        },
      },
      { status: 500 }
    );
  }
}
