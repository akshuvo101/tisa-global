import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { requireCustomerApi } from "@/lib/auth/api";
import type {
  CustomerDashboardBooking,
  CustomerDashboardData,
  CustomerDashboardJourney,
  CustomerDashboardRequest,
} from "@/types/customer-dashboard";
import {
  logSupabaseDiagnostic,
  logSupabaseException,
} from "@/lib/supabase/diagnostics";

function logQueryError(
  queryName: string,
  error: PostgrestError,
  response?: Pick<QueryResult, "status" | "statusText" | "count">,
): void {
  logSupabaseDiagnostic(
    "GET /api/account/dashboard query returned an error",
    {
      operation: "GET",
      table: queryName,
      select: "customer dashboard summary columns",
      filters: ["authenticated customer-owned rows"],
      response,
    },
    error,
  );
}

type QueryResult = {
  error: PostgrestError | null;
  status?: number;
  statusText?: string;
  count?: number | null;
};

async function traceQuery<Result extends QueryResult>(
  queryName: string,
  query: PromiseLike<Result>,
): Promise<Result> {
  try {
    const result = await query;
    if (result.error) {
      logQueryError(queryName, result.error, result);
    }
    return result;
  } catch (error) {
    logSupabaseException(
      `GET /api/account/dashboard ${queryName}`,
      {
        operation: "GET",
        table: queryName,
        select: "customer dashboard summary columns",
        filters: ["authenticated customer-owned rows"],
      },
      error,
    );
    throw error;
  }
}

function databaseFailure(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to load your travel dashboard. Please try again.",
      },
    },
    { status: 500 },
  );
}

export async function GET() {
  const auth = await requireCustomerApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const requestsResult = await traceQuery(
      "service_requests",
      auth.supabase
        .from("service_requests")
        .select(
          "id,status,destination_country,destination_city,travel_start_date,travel_end_date,created_at",
        )
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false }),
    );

    if (requestsResult.error) {
      return databaseFailure();
    }

    const requests = requestsResult.data ?? [];
    const requestIds = requests.map((request) => request.id);

    let dashboardRequests: CustomerDashboardRequest[] = requests.map(
      (request) => ({
        ...request,
        request_documents: [],
        request_messages: [],
        quotes: [],
      }),
    );
    let bookings: CustomerDashboardBooking[] = [];
    let upcomingJourneys: CustomerDashboardJourney[] = [];
    let unreadNotifications = 0;

    const notificationsResult = await traceQuery(
      "notifications",
      auth.supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("read", false),
    );

    if (notificationsResult.error) {
      return databaseFailure();
    }
    unreadNotifications = notificationsResult.count ?? 0;

    if (requestIds.length > 0) {
      const [
        documentsResult,
        messagesResult,
        quotesResult,
        bookingsResult,
      ] = await Promise.all([
        traceQuery(
          "request_documents",
          auth.supabase
            .from("request_documents")
            .select("id,request_id,document_type,status,required")
            .eq("user_id", auth.user.id)
            .in("request_id", requestIds),
        ),
        traceQuery(
          "request_messages",
          auth.supabase
            .from("request_messages")
            .select("id,request_id")
            .in("request_id", requestIds),
        ),
        traceQuery(
          "quotes",
          auth.supabase
            .from("quotes")
            .select(
              "id,request_id,quote_number,status,total_amount,currency,valid_until",
            )
            .in("request_id", requestIds),
        ),
        traceQuery(
          "bookings",
          auth.supabase
            .from("bookings")
            .select(
              "id,request_id,status,confirmation_status,booking_reference,start_date,end_date",
            )
            .in("request_id", requestIds)
            .order("start_date", { ascending: true, nullsFirst: false }),
        ),
      ]);

      const childQueryErrors = [
        ["request_documents", documentsResult.error],
        ["request_messages", messagesResult.error],
        ["quotes", quotesResult.error],
        ["bookings", bookingsResult.error],
      ] as const;
      let hasQueryErrors = false;
      for (const [, error] of childQueryErrors) {
        if (error) {
          hasQueryErrors = true;
        }
      }
      if (hasQueryErrors) {
        return databaseFailure();
      }

      const documentsByRequest = new Map<
        string,
        CustomerDashboardRequest["request_documents"]
      >();
      for (const document of documentsResult.data ?? []) {
        const documents = documentsByRequest.get(document.request_id) ?? [];
        documents.push({
          id: document.id,
          document_type: document.document_type,
          status: document.status,
          required: document.required,
        });
        documentsByRequest.set(document.request_id, documents);
      }

      const messagesByRequest = new Map<
        string,
        CustomerDashboardRequest["request_messages"]
      >();
      for (const message of messagesResult.data ?? []) {
        const messages = messagesByRequest.get(message.request_id) ?? [];
        messages.push({ id: message.id });
        messagesByRequest.set(message.request_id, messages);
      }

      const quotesByRequest = new Map<
        string,
        CustomerDashboardRequest["quotes"]
      >();
      for (const quote of quotesResult.data ?? []) {
        const quotes = quotesByRequest.get(quote.request_id) ?? [];
        quotes.push({
          id: quote.id,
          request_id: quote.request_id,
          quote_number: quote.quote_number,
          status: quote.status,
          total_amount: Number(quote.total_amount),
          currency: quote.currency,
          valid_until: quote.valid_until,
        });
        quotesByRequest.set(quote.request_id, quotes);
      }

      dashboardRequests = dashboardRequests.map((request) => ({
        ...request,
        request_documents: documentsByRequest.get(request.id) ?? [],
        request_messages: messagesByRequest.get(request.id) ?? [],
        quotes: quotesByRequest.get(request.id) ?? [],
      }));
      bookings = (bookingsResult.data ?? []).map((booking) => ({
        id: booking.id,
        request_id: booking.request_id,
        status: booking.status,
        confirmation_status: booking.confirmation_status,
        booking_reference: booking.booking_reference,
        start_date: booking.start_date,
        end_date: booking.end_date,
      }));

      const requestById = new Map(
        dashboardRequests.map((request) => [request.id, request]),
      );
      const today = new Date().toISOString().slice(0, 10);
      const journeyByRequest = new Map<string, CustomerDashboardJourney>();

      for (const booking of bookings) {
        const isTravelConfirmed =
          ["confirmed", "travel_ready"].includes(booking.status) &&
          booking.confirmation_status === "confirmed";
        if (
          !isTravelConfirmed ||
          !booking.start_date ||
          booking.start_date <= today ||
          (booking.end_date !== null &&
            (booking.end_date < booking.start_date ||
              booking.end_date < today)) ||
          journeyByRequest.has(booking.request_id)
        ) {
          continue;
        }

        const request = requestById.get(booking.request_id);
        if (!request) continue;

        journeyByRequest.set(booking.request_id, {
          id: booking.id,
          request_id: booking.request_id,
          booking_reference: booking.booking_reference,
          destination_city: request.destination_city,
          destination_country: request.destination_country,
          start_date: booking.start_date,
          end_date: booking.end_date,
        });
      }

      upcomingJourneys = [...journeyByRequest.values()];
    }

    const data: CustomerDashboardData = {
      requests: dashboardRequests,
      bookings,
      upcomingJourneys,
      unreadNotifications,
    };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logSupabaseException(
      "GET /api/account/dashboard handler",
      {
        operation: "GET",
        table: "dashboard",
        select: "customer dashboard summary",
        filters: ["authenticated customer-owned rows"],
      },
      error,
    );
    return databaseFailure();
  }
}
