import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/auth/server";

export default async function RequestLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile, role, error } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/login?redirect=%2Frequest");
  }

  if (error) {
    console.error("Request layout profile lookup failed:", error);
    redirect("/login?error=profile_unavailable");
  }

  if (!profile || role !== "customer") {
    redirect("/admin");
  }

  return children;
}
