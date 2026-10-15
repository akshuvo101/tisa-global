import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { notifyCustomer } from "@/lib/notifications/notify";

async function ctx() {
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
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;

  const {
    supabase,
    user,
    role,
  } = await ctx();

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Please sign in.",
        },
      },
      { status: 401 },
    );
  }

  if (role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Operations access required.",
        },
      },
      { status: 403 },
    );
  }

  const body = (await req.json()) as {
    action?: string;
  };

  const { data: quote, error: quoteError } =
    await supabase
      .from("quotes")
      .select(
        `
          *,
          service_requests!quotes_request_id_fkey(
            user_id,
            status
          )
        `,
      )
      .eq("id", id)
      .single();

  if (quoteError) {
    console.error(
      "Admin quote lookup failed:",
      quoteError,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Unable to load quote.",
        },
      },
      { status: 500 },
    );
  }

  if (!quote) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Quote not found.",
        },
      },
      { status: 404 },
    );
  }

  const request = Array.isArray(
    quote.service_requests,
  )
    ? quote.service_requests[0]
    : quote.service_requests;

  if (!request) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message:
            "The service request associated with this quote could not be found.",
        },
      },
      { status: 404 },
    );
  }

  /*
   * ------------------------------------------------------
   * SEND QUOTE
   * ------------------------------------------------------
   *
   * Allowed:
   *   draft
   *   changes_requested
   *
   * Result:
   *   quote            → sent
   *   request          → quoted
   *
   * Customer receives:
   *   quote_ready notification
   */
  if (body.action === "send") {
    if (
      quote.status !== "draft" &&
      quote.status !== "changes_requested"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message:
              "Only draft or changes-requested quotes can be sent.",
          },
        },
        { status: 409 },
      );
    }

    const {
      data: updatedQuote,
      error: updateError,
    } = await supabase
      .from("quotes")
      .update({
        status: "sent",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Quote send update failed:",
        updateError,
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message:
              "Unable to send the quote.",
          },
        },
        { status: 500 },
      );
    }

    const { error: requestUpdateError } =
      await supabase
        .from("service_requests")
        .update({
          status: "quoted",
          quoted_at: new Date().toISOString(),
        })
        .eq("id", quote.request_id);

    if (requestUpdateError) {
      console.error(
        "Request status update after quote send failed:",
        requestUpdateError,
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "REQUEST_UPDATE_FAILED",
            message:
              "Quote was sent, but the request status could not be updated.",
          },
        },
        { status: 500 },
      );
    }

    await notifyCustomer({
      userId: request.user_id,
      type: "quote_ready",
      title: "Your TISA quote is ready",
      message: `Quote ${quote.quote_number} is ready to review.`,
      relatedRequestId: quote.request_id,
      channels: [
        "in_app",
        "email",
        "whatsapp",
      ],
    });

    await supabase
      .from("activity_logs")
      .insert({
        actor_id: user.id,
        entity_type: "quote",
        entity_id: id,
        action: "quote_sent",
        metadata: {
          request_id: quote.request_id,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedQuote,
    });
  }

  /*
   * ------------------------------------------------------
   * CANCEL QUOTE
   * ------------------------------------------------------
   *
   * Cannot cancel:
   *   accepted
   *   cancelled
   *
   * Result:
   *   quote → cancelled
   */
  if (body.action === "cancel") {
    if (
      quote.status === "accepted" ||
      quote.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message:
              "This quote cannot be cancelled.",
          },
        },
        { status: 409 },
      );
    }

    const {
      data: updatedQuote,
      error: updateError,
    } = await supabase
      .from("quotes")
      .update({
        status: "cancelled",
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(
        "Quote cancellation failed:",
        updateError,
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message:
              "Unable to cancel the quote.",
          },
        },
        { status: 500 },
      );
    }

    await supabase
      .from("activity_logs")
      .insert({
        actor_id: user.id,
        entity_type: "quote",
        entity_id: id,
        action: "quote_cancelled",
        metadata: {
          request_id: quote.request_id,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedQuote,
    });
  }

  /*
   * ------------------------------------------------------
   * UNSUPPORTED ACTION
   * ------------------------------------------------------
   */
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Unsupported quote action.",
      },
    },
    { status: 422 },
  );
}