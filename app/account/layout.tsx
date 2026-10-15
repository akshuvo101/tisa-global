import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/auth/server";
import CustomerDashboardShell from "@/components/account/CustomerDashboardShell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile, role, error } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/login?redirect=%2Faccount");
  }

  if (error) {
    console.error("Account layout profile lookup failed:", error);
    redirect("/login?error=profile_unavailable");
  }

  if (!profile || role !== "customer") {
    redirect("/admin");
  }

  return <CustomerDashboardShell>{children}</CustomerDashboardShell>;
}
