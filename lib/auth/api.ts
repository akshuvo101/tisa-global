import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth/server";

export async function requireCustomerApi() {
  const context = await getAuthenticatedProfile();

  if (!context.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in." },
        },
        { status: 401 },
      ),
    };
  }

  if (context.error || context.role !== "customer" || !context.profile) {
    if (context.error) {
      console.error("Customer API profile verification failed:", context.error);
    }

    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "A customer account is required.",
          },
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    supabase: context.supabase,
    user: context.user,
    profile: context.profile,
  };
}

export async function requireAdminApi() {
  const context = await getAuthenticatedProfile();

  if (!context.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please sign in." },
        },
        { status: 401 },
      ),
    };
  }

  if (context.error || context.role !== "admin" || !context.profile) {
    if (context.error) {
      console.error("Admin API profile verification failed:", context.error);
    }

    return {
      ok: false as const,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access is required.",
          },
        },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    supabase: context.supabase,
    user: context.user,
    profile: context.profile,
  };
}
