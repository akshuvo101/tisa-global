import type { RequestStatus } from "@/types/tisa";

export type CustomerDashboardRequest = {
  id: string;
  status: RequestStatus;
  destination_country: string | null;
  destination_city: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  created_at: string;
  request_documents: Array<{
    id: string;
    document_type: string;
    status: string;
    required: boolean;
  }>;
  request_messages: Array<{ id: string }>;
  quotes: Array<{
    id: string;
    request_id: string;
    quote_number: string;
    status: string;
    total_amount: number;
    currency: string;
    valid_until: string | null;
  }>;
};


export type CustomerDashboardBooking = {
  id: string;
  request_id: string;
  status:
    | "pending"
    | "processing"
    | "confirmed"
    | "travel_ready"
    | "completed"
    | "cancelled"
    | "on_hold";
  confirmation_status: string;
  booking_reference: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type CustomerDashboardJourney = {
  id: string;
  request_id: string;
  booking_reference: string | null;
  destination_city: string | null;
  destination_country: string | null;
  start_date: string;
  end_date: string | null;
};


export type CustomerDashboardData = {
  requests: CustomerDashboardRequest[];
  bookings: CustomerDashboardBooking[];
  upcomingJourneys: CustomerDashboardJourney[];
  unreadNotifications: number;
};
