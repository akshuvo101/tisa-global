import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDestinationLabel } from "@/lib/data/destination-label";

function deriveReadiness(args: {
  requiredDocuments: number;
  acceptedDocuments: number;
  activeBookings: number;
  confirmedBookings: number;
  requestStatus: string;
}) {
  const {
    requiredDocuments,
    acceptedDocuments,
    activeBookings,
    confirmedBookings,
    requestStatus,
  } = args;

  if (requestStatus === "cancelled") return "not_ready";

  if (requiredDocuments > 0 && acceptedDocuments < requiredDocuments) {
    return acceptedDocuments >= Math.max(1, requiredDocuments - 1)
      ? "almost_ready"
      : "needs_attention";
  }

  if (activeBookings === 0 || confirmedBookings < activeBookings) {
    return "almost_ready";
  }

  return "travel_ready";
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: requests, error } = await supabase
    .from("service_requests")
    .select(`
      id,
      destination_country,
      destination_city,
      travel_start_date,
      travel_end_date,
      traveler_count,
      status,
      priority,
      description,
      created_at,
      updated_at,

      request_services(
        id,
        status,
        quantity,
        service_catalog(
          id,
          name,
          slug,
          category
        )
      ),

      request_documents(
        id,
        document_type,
        status,
        required,
        due_date,
        file_name,
        uploaded_at
      ),

      quotes(
        id,
        quote_number,
        status,
        total_amount,
        currency,
        valid_until,
        created_at
      ),

      bookings(
        id,
        booking_reference,
        status,
        total_amount,
        currency,
        start_date,
        end_date,
        created_at,

        booking_items(
          id,
          status,
          provider_name,
          provider_reference,
          amount,
          scheduled_at,
          service_catalog(
            id,
            name
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/account/trips - REQUEST QUERY ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      },
      { status: 500 }
    );
  }

  const trips = [];

  for (const request of requests ?? []) {
    const requestDocuments = Array.isArray(request.request_documents)
      ? request.request_documents
      : [];

    const requiredDocuments = requestDocuments.filter(
      (doc) => doc.required
    ).length;

    const acceptedDocuments = requestDocuments.filter(
      (doc) => doc.required && doc.status === "accepted"
    ).length;

    const bookings = Array.isArray(request.bookings)
      ? request.bookings
      : [];

    const activeBookings = bookings.filter(
      (booking) =>
        !["cancelled", "completed"].includes(booking.status)
    ).length;

    const confirmedBookings = bookings.filter((booking) =>
      ["confirmed", "travel_ready", "completed"].includes(booking.status)
    ).length;

    const readinessStatus = deriveReadiness({
      requiredDocuments,
      acceptedDocuments,
      activeBookings,
      confirmedBookings,
      requestStatus: request.status,
    });

    const title = `${getDestinationLabel(
      request.destination_city,
      request.destination_country,
      "International",
    )} journey`;

    const tripStatus =
      request.status === "completed"
        ? "completed"
        : request.status === "cancelled"
          ? "cancelled"
          : bookings.some(
                (booking) => booking.status === "travel_ready"
              )
            ? "travel_ready"
            : ["confirmed", "processing", "on_hold"].includes(
                  request.status
                )
              ? request.status
              : "planning";

    // Find existing trip workspace
    let { data: trip, error: tripLookupError } = await supabase
      .from("travel_trips")
      .select(
        "id,title,status,readiness_status,notes,created_at,updated_at"
      )
      .eq("request_id", request.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (tripLookupError) {
      console.error(
        "GET /api/account/trips - TRAVEL TRIP LOOKUP ERROR:",
        {
          requestId: request.id,
          message: tripLookupError.message,
          details: tripLookupError.details,
          hint: tripLookupError.hint,
          code: tripLookupError.code,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: tripLookupError.message,
            details: tripLookupError.details,
            hint: tripLookupError.hint,
          },
        },
        { status: 500 }
      );
    }

    // Create trip workspace if it does not exist
    if (!trip) {
      const {
        data: createdTrip,
        error: createTripError,
      } = await supabase
        .from("travel_trips")
        .insert({
          user_id: user.id,
          request_id: request.id,
          title,
          status: tripStatus,
          readiness_status: readinessStatus,
        })
        .select(
          "id,title,status,readiness_status,notes,created_at,updated_at"
        )
        .single();

      if (createTripError) {
        console.error(
          "GET /api/account/trips - TRAVEL TRIP CREATE ERROR:",
          {
            requestId: request.id,
            userId: user.id,
            message: createTripError.message,
            details: createTripError.details,
            hint: createTripError.hint,
            code: createTripError.code,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DATABASE_ERROR",
              message: createTripError.message,
              details: createTripError.details,
              hint: createTripError.hint,
            },
          },
          { status: 500 }
        );
      }

      trip = createdTrip;
    }

    trips.push({
      ...trip,
      title,
      request,
      readiness: {
        requiredDocuments,
        acceptedDocuments,
        activeBookings,
        confirmedBookings,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: trips,
  });
}