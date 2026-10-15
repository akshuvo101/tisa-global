import { NextResponse } from "next/server";
import { requireCustomerApi } from "@/lib/auth/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireCustomerApi();
    if (!auth.ok) {
      return auth.response;
    }

    const body = (await request.json()) as {
      action?: string;
      message?: string;
    };

    const { data: quote, error: quoteError } = await auth.supabase
      .from("quotes")
      .select(
        "id,request_id,quote_number,status,service_requests!quotes_request_id_fkey(user_id,status)",
      )
      .eq("id", id)
      .maybeSingle();

    if (quoteError) {
      console.error("PATCH /api/quotes/[id] quote lookup failed:", quoteError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Unable to load quote." },
        },
        { status: 500 },
      );
    }

    const serviceRequest = Array.isArray(quote?.service_requests)
      ? quote.service_requests[0]
      : quote?.service_requests;

    if (!quote || !serviceRequest || serviceRequest.user_id !== auth.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Quote not found." },
        },
        { status: 404 },
      );
    }

    if (body.action !== "accept" && body.action !== "changes") {
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

    if (quote.status !== "sent") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATE",
            message:
              body.action === "accept"
                ? "This quote is not awaiting acceptance."
                : "Only a sent quote can receive change requests.",
          },
        },
        { status: 409 },
      );
    }

    const nextStatus =
      body.action === "accept" ? "accepted" : "changes_requested";
    const { data, error } = await auth.supabase
      .from("quotes")
      .update({ status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/quotes/[id] update failed:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Unable to update quote." },
        },
        { status: 500 },
      );
    }

    if (body.action === "accept") {
      const { error: requestError } = await auth.supabase
        .from("service_requests")
        .update({ status: "quote_accepted" })
        .eq("id", quote.request_id)
        .eq("user_id", auth.user.id);

      if (requestError) {
        console.error(
          "PATCH /api/quotes/[id] request status update failed:",
          requestError,
        );
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "The quote was accepted but the request status did not update.",
            },
          },
          { status: 500 },
        );
      }
    } else {
      const message =
        body.message?.trim() || "I would like to discuss changes to this quote.";
      const { error: messageError } = await auth.supabase
        .from("request_messages")
        .insert({
          request_id: quote.request_id,
          sender_id: auth.user.id,
          message,
        });

      if (messageError) {
        console.error(
          "PATCH /api/quotes/[id] change-request message failed:",
          messageError,
        );
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: "Your change request could not be sent.",
            },
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PATCH /api/quotes/[id] failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Unable to update quote.",
        },
      },
      { status: 500 },
    );
  }
}
