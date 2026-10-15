import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  // ------------------------------------------------------------
  // 1. Load the customer's travel workspace
  // ------------------------------------------------------------

  const { data: trip, error: tripError } = await supabase
    .from("travel_trips")
    .select(
      "id,title,status,readiness_status,notes,created_at,updated_at,request_id"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (tripError) {
    console.error("GET /api/account/trips/[id] - TRIP QUERY ERROR:", {
      tripId: id,
      userId: user.id,
      message: tripError.message,
      details: tripError.details,
      hint: tripError.hint,
      code: tripError.code,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: tripError.message,
          details: tripError.details,
          hint: tripError.hint,
        },
      },
      { status: 500 }
    );
  }

  if (!trip) {
    console.error(
      "GET /api/account/trips/[id] - TRIP NOT FOUND:",
      {
        tripId: id,
        userId: user.id,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Trip workspace not found.",
        },
      },
      { status: 404 }
    );
  }

  // ------------------------------------------------------------
  // 2. Load the related service request
  // ------------------------------------------------------------

  const {
    data: request,
    error: requestError,
  } = await supabase
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
        description,
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
        uploaded_at,
        reviewed_at,
        rejection_reason
      ),

      quotes(
        id,
        quote_number,
        status,
        subtotal,
        service_fee,
        discount,
        tax,
        total_amount,
        currency,
        valid_until,
        created_at,
        updated_at,

        quote_items(
          id,
          description,
          quantity,
          unit_price,
          total_price,
          service_catalog(
            id,
            name
          )
        )
      ),

      bookings(
        id,
        booking_reference,
        status,
        total_amount,
        currency,
        start_date,
        end_date,
        notes,
        confirmed_at,
        created_at,
        updated_at,

        booking_items(
          id,
          item_type,
          status,
          provider_name,
          provider_reference,
          amount,
          scheduled_at,
          notes,
          service_catalog(
            id,
            name
          )
        )
      )
    `)
    .eq("id", trip.request_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (requestError) {
    console.error(
      "GET /api/account/trips/[id] - REQUEST QUERY ERROR:",
      {
        tripId: id,
        requestId: trip.request_id,
        userId: user.id,
        message: requestError.message,
        details: requestError.details,
        hint: requestError.hint,
        code: requestError.code,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: requestError.message,
          details: requestError.details,
          hint: requestError.hint,
        },
      },
      { status: 500 }
    );
  }

  if (!request) {
    console.error(
      "GET /api/account/trips/[id] - REQUEST NOT FOUND:",
      {
        tripId: id,
        requestId: trip.request_id,
        userId: user.id,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "The service request connected to this trip was not found.",
        },
      },
      { status: 404 }
    );
  }

  // ------------------------------------------------------------
  // 3. Load customer travel profile
  // ------------------------------------------------------------

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      full_name,
      email,
      phone,
      country,
      city,
      nationality,
      passport_expiry,
      emergency_contact_name,
      emergency_contact_phone,
      preferred_contact_channel
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "GET /api/account/trips/[id] - PROFILE QUERY ERROR:",
      {
        userId: user.id,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      }
    );
  }

  // ------------------------------------------------------------
  // 4. Calculate travel readiness
  // ------------------------------------------------------------

  const docs = Array.isArray(request.request_documents)
    ? request.request_documents
    : [];

  const requiredDocuments = docs.filter(
    (doc) => doc.required
  );

  const acceptedDocuments = requiredDocuments.filter(
    (doc) => doc.status === "accepted"
  );

  const bookings = Array.isArray(request.bookings)
    ? request.bookings
    : [];

  const activeBookings = bookings.filter(
    (booking) =>
      !["cancelled", "completed"].includes(booking.status)
  );

  const confirmedBookings = activeBookings.filter(
    (booking) =>
      ["confirmed", "travel_ready", "completed"].includes(
        booking.status
      )
  );

  const readiness = {
    requiredDocuments: requiredDocuments.length,
    acceptedDocuments: acceptedDocuments.length,
    missingDocuments: requiredDocuments.filter(
      (doc) => doc.status !== "accepted"
    ).length,
    activeBookings: activeBookings.length,
    confirmedBookings: confirmedBookings.length,
    status: trip.readiness_status,
  };

  // ------------------------------------------------------------
  // 5. Build trip timeline
  // ------------------------------------------------------------

  const quotes = Array.isArray(request.quotes)
    ? request.quotes
    : [];

  const timeline = [
    {
      label: "Request created",
      date: request.created_at,
      done: true,
    },
    {
      label: "Documents",
      date:
        docs.find((doc) => doc.uploaded_at)?.uploaded_at ?? null,
      done: readiness.missingDocuments === 0,
    },
    {
      label: "Quote",
      date:
        quotes.find((quote) => quote.status === "accepted")
          ?.created_at ??
        quotes[0]?.created_at ??
        null,
      done: quotes.some(
        (quote) => quote.status === "accepted"
      ),
    },
    {
      label: "Booking",
      date: activeBookings[0]?.created_at ?? null,
      done: confirmedBookings.length > 0,
    },
    {
      label: "Travel ready",
      date:
        activeBookings.find(
          (booking) => booking.status === "travel_ready"
        )?.updated_at ?? null,
      done: activeBookings.some(
        (booking) => booking.status === "travel_ready"
      ),
    },
  ];

  // ------------------------------------------------------------
  // 6. Return complete trip workspace
  // ------------------------------------------------------------

  return NextResponse.json({
    success: true,
    data: {
      trip,
      request,
      profile: profile ?? null,
      readiness,
      timeline,
    },
  });
}