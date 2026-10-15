import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateRequestInput } from "./schema";

export async function createServiceRequest(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRequestInput
) {
  const { data: services, error: servicesError } = await supabase
    .from("service_catalog")
    .select("id")
    .in("id", input.service_ids)
    .eq("active", true);

  if (servicesError) throw servicesError;

  if (!services || services.length !== new Set(input.service_ids).size) {
    const error = new Error("One or more selected services are unavailable.");
    error.name = "INVALID_SERVICES";
    throw error;
  }

  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .insert({
      user_id: userId,
      event_id: input.event_id ?? null,
      destination_country: input.destination_country || null,
      destination_city: input.destination_city || null,
      travel_start_date: input.travel_start_date || null,
      travel_end_date: input.travel_end_date || null,
      traveler_count: input.traveler_count,
      priority: input.priority,
      description: input.description,
      status: "requested",
    })
    .select()
    .single();

  if (requestError) throw requestError;

  const requestServices = input.service_ids.map((service_id) => ({
    request_id: request.id,
    service_id,
    status: "pending",
  }));

  const { error: requestServicesError } = await supabase
    .from("request_services")
    .insert(requestServices);

  if (requestServicesError) {
    await supabase.from("service_requests").delete().eq("id", request.id);
    throw requestServicesError;
  }

  return request;
}
