import { createClient } from "@/lib/supabase/client";

const TABLE_NAME = "saved_destinations";

async function getCurrentUser(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw new Error(error.message);
  }

  return user;
}

export async function saveDestination(destinationId: string) {
  const supabase = createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    throw new Error("You must be logged in to save a destination.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      user_id: user.id,
      destination_id: destinationId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function removeSavedDestination(destinationId: string) {
  const supabase = createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    throw new Error("You must be logged in to remove a saved destination.");
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("user_id", user.id)
    .eq("destination_id", destinationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function isDestinationSaved(destinationId: string) {
  const supabase = createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id")
    .eq("user_id", user.id)
    .eq("destination_id", destinationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function getSavedDestinationIds() {
  const supabase = createClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("destination_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item) => item.destination_id);
}