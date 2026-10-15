import { createClient } from "@/lib/supabase/server";
import { isApplicationRole } from "@/lib/auth/roles";

export async function getAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      profile: null,
      role: null,
      error: userError,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isApplicationRole(profile.role)) {
    return {
      supabase,
      user,
      profile: null,
      role: null,
      error: profileError ?? new Error("The account profile is unavailable."),
    };
  }

  return {
    supabase,
    user,
    profile,
    role: profile.role,
    error: null,
  };
}
