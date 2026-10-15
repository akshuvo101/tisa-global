import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getAuthenticatedProfile } from "@/lib/auth/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile, role, error } = await getAuthenticatedProfile();

  if (!user) {
    redirect("/login?redirect=%2Fadmin");
  }

  if (error) {
    console.error("Admin layout profile lookup failed:", error);
    redirect("/login?error=profile_unavailable");
  }

  if (!profile || role !== "admin") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="relative min-h-screen">

        {/* Sidebar */}

        <AdminSidebar />

        {/* Main application area */}

        <div className="min-w-0 lg:pl-[260px]">

          {/* Topbar */}

          <AdminTopbar />

          {/* Page content */}

          <main
            className="
              relative
              min-h-[calc(100vh-64px)]
              min-w-0
              overflow-x-hidden
              border-l
              border-white/[0.06]
              bg-background
            "
          >
            {/* Subtle ambient background */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-64
                bg-[radial-gradient(circle_at_70%_0%,rgba(14,165,233,0.045),transparent_55%)]
              "
            />

            <div className="relative min-w-0 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}