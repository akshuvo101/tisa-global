import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function auth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
      role: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    role: profile?.role,
  };
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { supabase, user, role } = await auth();

  // ------------------------------------------------------------
  // Authentication
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Authorization
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Parse request body
  // ------------------------------------------------------------

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Invalid request body.",
        },
      },
      { status: 400 }
    );
  }

  // ------------------------------------------------------------
  // Load current event
  // ------------------------------------------------------------

  const { data: current, error: currentError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (currentError || !current) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Event not found.",
        },
      },
      { status: 404 }
    );
  }

  // ============================================================
  // ACTION: VERIFY EVENT
  // ============================================================

  if (body.action === "verify") {
    const verificationStatus =
      typeof body.verification_status === "string" &&
      body.verification_status.trim()
        ? body.verification_status.trim()
        : "verified";

    const allowedVerificationStatuses = [
      "unverified",
      "under_review",
      "verified",
      "needs_reverification",
      "expired",
    ];

    if (!allowedVerificationStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid verification status.",
          },
        },
        { status: 422 }
      );
    }

    const verificationNotes =
      typeof body.verification_notes === "string"
        ? body.verification_notes.trim() || null
        : null;

    const { data, error } = await supabase
      .from("events")
      .update({
        verification_status: verificationStatus,
        last_verified_at: new Date().toISOString(),
        verified_by: user.id,
        verification_notes: verificationNotes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Activity log
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      entity_type: "event",
      entity_id: id,
      action: "event_verification_updated",
      metadata: {
        from: current.verification_status,
        to: verificationStatus,
      },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  }

  // ============================================================
  // ACTION: ADD TRUSTED SOURCE
  // ============================================================

  if (body.action === "source") {
    const sourceName =
      typeof body.source_name === "string"
        ? body.source_name.trim()
        : "";

    const sourceUrl =
      typeof body.source_url === "string"
        ? body.source_url.trim()
        : "";

    const sourceType =
      typeof body.source_type === "string"
        ? body.source_type.trim()
        : "";

    if (!sourceName || !sourceUrl || !sourceType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Source name, URL and type are required.",
          },
        },
        { status: 422 }
      );
    }

    // Validate URL
    try {
      new URL(sourceUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid source URL.",
          },
        },
        { status: 422 }
      );
    }

    const { data, error } = await supabase
      .from("event_sources")
      .insert({
        event_id: id,
        source_name: sourceName,
        source_url: sourceUrl,
        source_type: sourceType,
        is_primary: Boolean(body.is_primary),
        last_verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Activity log
    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      entity_type: "event",
      entity_id: id,
      action: "event_source_added",
      metadata: {
        source_name: sourceName,
        source_type: sourceType,
        source_url: sourceUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  }

  // ============================================================
  // ACTION: ADD EVENT UPDATE
  // ============================================================

  if (body.action === "update") {
    const updateType =
      typeof body.update_type === "string"
        ? body.update_type.trim()
        : "";

    const oldValue =
      typeof body.old_value === "string"
        ? body.old_value.trim() || null
        : null;

    const newValue =
      typeof body.new_value === "string"
        ? body.new_value.trim()
        : "";

    const sourceUrl =
      typeof body.source_url === "string"
        ? body.source_url.trim()
        : "";

    // ----------------------------------------------------------
    // Validate update type
    // ----------------------------------------------------------

    const allowedUpdateTypes = [
      "date_changed",
      "venue_changed",
      "registration_opened",
      "registration_deadline_changed",
      "organizer_update",
      "invitation_update",
      "general_update",
    ];

    if (!updateType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Update type is required.",
          },
        },
        { status: 422 }
      );
    }

    if (!allowedUpdateTypes.includes(updateType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid event update type.",
          },
        },
        { status: 422 }
      );
    }

    // ----------------------------------------------------------
    // New information is required
    // ----------------------------------------------------------

    if (!newValue) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New information is required.",
          },
        },
        { status: 422 }
      );
    }

    // ----------------------------------------------------------
    // Source is required for a public event update
    // ----------------------------------------------------------

    if (!sourceUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "A source URL is required before publishing an event update.",
          },
        },
        { status: 422 }
      );
    }

    // ----------------------------------------------------------
    // Validate source URL
    // ----------------------------------------------------------

    try {
      new URL(sourceUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Please provide a valid source URL.",
          },
        },
        { status: 422 }
      );
    }

    // ----------------------------------------------------------
    // Insert event update
    // ----------------------------------------------------------

    const verifiedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("event_updates")
      .insert({
        event_id: id,
        update_type: updateType,
        old_value: oldValue,
        new_value: newValue,
        source_url: sourceUrl,
        verified_at: verifiedAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // Activity log
    // ----------------------------------------------------------

    await supabase.from("activity_logs").insert({
      actor_id: user.id,
      entity_type: "event",
      entity_id: id,
      action: "event_update_added",
      metadata: {
        update_type: updateType,
        old_value: oldValue,
        new_value: newValue,
        source_url: sourceUrl,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  }

  // ============================================================
  // GENERIC EVENT UPDATE
  // ============================================================

  const allowedFields = [
    "title",
    "slug",
    "description",
    "country",
    "city",
    "venue",
    "start_date",
    "end_date",
    "organizer_name",
    "organizer_website",
    "event_type",
    "category",
    "registration_status",
    "registration_url",
    "status",
  ];

  const update = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key))
  );

  // Nothing to update
  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "No valid event fields were provided.",
        },
      },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("events")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  // Activity log
  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    entity_type: "event",
    entity_id: id,
    action: "event_updated",
    metadata: {
      fields: Object.keys(update),
    },
  });

  return NextResponse.json({
    success: true,
    data,
  });
}