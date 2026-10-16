
import { NextResponse } from "next/server";
import { notifyCustomer } from "@/lib/notifications/notify";
import { createClient } from "@/lib/supabase/server";

async function ctx() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("[Document Request] Auth error:", authError);
  }

  if (!user) {
    return { supabase, user: null, role: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[Document Request] Profile lookup error:", {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
    });
  }

  return {
    supabase,
    user,
    role: profile?.role ?? null,
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase, user, role } = await ctx();

    // 1. Authentication
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Please sign in.",
          },
        },
        { status: 401 }
      );
    }

    // 2. Authorization
    if (role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Operations access required.",
          },
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    let body: {
      document_type?: string;
      due_date?: string | null;
      notes?: string | null;
    };

    try {
      body = await req.json();
    } catch (error) {
      console.error("[Document Request] Invalid JSON:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_JSON",
            message: "The request body must contain valid JSON.",
          },
        },
        { status: 400 }
      );
    }

    const documentType = body.document_type?.trim();

    if (!documentType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Document type is required.",
          },
        },
        { status: 422 }
      );
    }

    // 4. Verify service request
    const {
      data: serviceRequest,
      error: requestError,
    } = await supabase
      .from("service_requests")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      console.error("[Document Request] Service request lookup failed:", {
        code: requestError.code,
        message: requestError.message,
        details: requestError.details,
        hint: requestError.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REQUEST_LOOKUP_FAILED",
            message: "Could not look up the service request.",
            details: requestError.message,
            databaseCode: requestError.code,
          },
        },
        { status: 500 }
      );
    }

    if (!serviceRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Request not found.",
          },
        },
        { status: 404 }
      );
    }

    // 5. Insert requested document
    const {
      data: document,
      error: insertError,
    } = await supabase
      .from("request_documents")
      .insert({
        request_id: id,
        user_id: serviceRequest.user_id,
        document_type: documentType,
        file_name: null,
        storage_path: null,
        status: "required",
        required: true,
        requested_by: user.id,
        due_date: body.due_date || null,
        notes: body.notes?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Document Request] Database insert failed:", {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Unable to request the document.",
            details: insertError.message,
            databaseCode: insertError.code,
            hint: insertError.hint,
          },
        },
        { status: 500 }
      );
    }

    // 6. Notify customer
    try {
      await notifyCustomer({
        userId: serviceRequest.user_id,
        type: "document_required",
        title: "Document required",
        message: `TISA needs your ${documentType} for request ${id
          .slice(0, 8)
          .toUpperCase()}.`,
        relatedRequestId: id,
        channels: ["in_app", "email", "whatsapp"],
      });
    } catch (notificationError) {
      // Document creation has succeeded, so don't report the whole
      // operation as failed just because notification delivery failed.
      console.error("[Document Request] Notification failed:", notificationError);
    }

    // 7. Log activity
    const { error: activityError } = await supabase
      .from("activity_logs")
      .insert({
        actor_id: user.id,
        entity_type: "request_document",
        entity_id: document.id,
        action: "document_requested",
        metadata: {
          request_id: id,
          document_type: documentType,
        },
      });

    if (activityError) {
      console.error("[Document Request] Activity log failed:", {
        code: activityError.code,
        message: activityError.message,
        details: activityError.details,
        hint: activityError.hint,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: document,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Document Request] Unexpected server error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected server error occurred.",
        },
      },
      { status: 500 }
    );
  }
}
