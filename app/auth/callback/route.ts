import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPostAuthPath, isApplicationRole } from "@/lib/auth/roles";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const requestedNext =
    requestUrl.searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              },
            );
          } catch {
            // Cookies may already be handled by the framework.
          }
        },
      },
    },
  );

  // --------------------------------------------------
  // 1. Exchange OAuth / email confirmation code
  // --------------------------------------------------

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error(
      "Auth callback exchange failed:",
      exchangeError.message,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  // --------------------------------------------------
  // 2. Get authenticated user
  // --------------------------------------------------

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Auth callback user lookup failed:",
      userError?.message,
    );

    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  // --------------------------------------------------
  // 3. Make sure a profile exists
  // --------------------------------------------------

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    null;

  const { data: existingProfile, error: profileLookupError } =
    await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileLookupError) {
    console.error(
      "Auth callback profile lookup failed:",
      profileLookupError.message,
    );
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Auth callback cleanup failed:", signOutError.message);
    }

    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  // New user:
  // Create a customer profile.
  //
  // We intentionally do NOT send role here.
  // The database default role is "customer".
  if (!existingProfile) {
    const { error: profileInsertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? null,
        full_name: fullName,
      });

    if (profileInsertError) {
      console.error(
        "Auth callback profile creation failed:",
        profileInsertError.message,
      );
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Auth callback cleanup failed:", signOutError.message);
      }

      return NextResponse.redirect(
        new URL(
          "/login?error=auth_callback_failed",
          requestUrl.origin,
        ),
      );
    }
  }

  // --------------------------------------------------
  // 4. Get the final role
  // --------------------------------------------------

  const { data: profile, error: finalProfileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

  if (finalProfileError || !profile) {
    console.error(
      "Auth callback final profile lookup failed:",
      finalProfileError?.message,
    );
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Auth callback cleanup failed:", signOutError.message);
    }

    return NextResponse.redirect(
      new URL(
        "/login?error=auth_callback_failed",
        requestUrl.origin,
      ),
    );
  }

  // --------------------------------------------------
  // 5. Decide destination from DATABASE ROLE
  // --------------------------------------------------

  const role = profile.role;

  if (isApplicationRole(role)) {
    return NextResponse.redirect(
      new URL(
        getPostAuthPath(role, requestedNext, requestUrl.origin),
        requestUrl.origin,
      ),
    );
  }

  // Unknown / invalid role
  console.error(
    "Auth callback encountered unsupported role:",
    role,
  );
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    console.error("Auth callback cleanup failed:", signOutError.message);
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=invalid_role",
      requestUrl.origin,
    ),
  );
}