
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateRequestInput } from "./schema";

export async function createServiceRequest(
  supabase: SupabaseClient,
  _userId: string,
  input: CreateRequestInput
) {
  const { data, error } = await supabase.rpc("create_service_request", {
    p_event_id: input.event_id ?? null,
    p_destination_country: input.destination_country || null,
    p_destination_city: input.destination_city || null,
    p_travel_start_date: input.travel_start_date || null,
    p_travel_end_date: input.travel_end_date || null,
    p_traveler_count: input.traveler_count,
    p_priority: input.priority,
    p_description: input.description,
    p_service_ids: input.service_ids,
  });

  if (error) {
    const message = error.message ?? "Unable to create service request.";

    if (message.includes("INVALID_SERVICES")) {
      const invalidServicesError = new Error(
        "One or more selected services are unavailable."
      );
      invalidServicesError.name = "INVALID_SERVICES";
      throw invalidServicesError;
    }

    if (message.includes("INVALID_EVENT")) {
      const invalidEventError = new Error(
        "This event is no longer available."
      );
      invalidEventError.name = "INVALID_EVENT";
      throw invalidEventError;
    }

    if (message.includes("AUTH_REQUIRED")) {
      const authError = new Error(
        "Please sign in to submit a request."
      );
      authError.name = "AUTH_REQUIRED";
      throw authError;
    }

    throw error;
  }

  if (
    !data ||
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new Error("The request could not be confirmed.");
  }

  return data;
}
