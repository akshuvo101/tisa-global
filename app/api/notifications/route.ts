import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  logSupabaseDiagnostic,
  logSupabaseException,
} from "@/lib/supabase/diagnostics";

const notificationReadContext = {
  operation: "GET",
  table: "notifications",
  select: "id,type,title,message,related_request_id,read,created_at",
  filters: ["user_id = authenticated user", "created_at DESC", "limit 30"],
} as const;

const notificationUpdateContext = {
  operation: "PATCH",
  table: "notifications",
  select: "UPDATE read = true",
  filters: ["id and authenticated user, or unread rows for authenticated user"],
} as const;

function databaseErrorResponse(message: string) {
  return NextResponse.json(
    { success: false, error: { code: "DATABASE_ERROR", message } },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in." },
        },
        { status: 401 },
      );
    }
    if (authError) {
      logSupabaseDiagnostic(
        "notification auth lookup failed",
        {
          ...notificationReadContext,
          operation: "GET auth.getUser",
        },
        authError,
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Unable to verify your session.",
          },
        },
        { status: 401 },
      );
    }

    let result;
    try {
      result = await supabase
        .from("notifications")
        .select(
          "id,type,title,message,related_request_id,read,created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
    } catch (error) {
      logSupabaseException(
        "notifications select",
        notificationReadContext,
        error,
      );
      return databaseErrorResponse("Unable to load notifications.");
    }

    const queryContext = {
      ...notificationReadContext,
      response: {
        status: result.status,
        statusText: result.statusText,
        count: result.count,
      },
    };
    if (result.error) {
      logSupabaseDiagnostic(
        "notifications select returned an error",
        queryContext,
        result.error,
      );
      return databaseErrorResponse("Unable to load notifications.");
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    logSupabaseException(
      "notifications GET handler",
      notificationReadContext,
      error,
    );
    return databaseErrorResponse("Unable to load notifications.");
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in." },
        },
        { status: 401 },
      );
    }
    if (authError) {
      logSupabaseDiagnostic(
        "notification auth lookup failed",
        { ...notificationUpdateContext, operation: "PATCH auth.getUser" },
        authError,
      );
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Unable to verify your session.",
          },
        },
        { status: 401 },
      );
    }

    let body: { id?: string; mark_all?: boolean };
    try {
      body = (await request.json()) as { id?: string; mark_all?: boolean };
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
        },
        { status: 400 },
      );
    }

    if (!body.mark_all && !body.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Notification id is required.",
          },
        },
        { status: 422 },
      );
    }

    let updateQuery = supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id);
    if (body.mark_all) {
      updateQuery = updateQuery.eq("read", false);
    } else {
      updateQuery = updateQuery.eq("id", body.id!);
    }

    let result;
    try {
      result = await updateQuery;
    } catch (error) {
      logSupabaseException(
        "notifications update",
        notificationUpdateContext,
        error,
      );
      return databaseErrorResponse("Unable to update notifications.");
    }

    const queryContext = {
      ...notificationUpdateContext,
      response: {
        status: result.status,
        statusText: result.statusText,
        count: result.count,
      },
    };
    if (result.error) {
      logSupabaseDiagnostic(
        "notifications update returned an error",
        queryContext,
        result.error,
      );
      return databaseErrorResponse("Unable to update notifications.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logSupabaseException(
      "notifications PATCH handler",
      notificationUpdateContext,
      error,
    );
    return databaseErrorResponse("Unable to update notifications.");
  }
}
