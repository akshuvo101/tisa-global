"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading, error } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError("");
    let authError: Error | null;
    try {
      const result = await supabase.auth.signOut();
      authError = result.error;
    } catch (error) {
      console.error("Supabase sign-out request failed:", error);
      setSignOutError("Unable to sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    if (authError) {
      console.error("Supabase sign-out failed:", authError);
      setSignOutError("Unable to sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (loading && !user) {
    return (
      <span
        aria-label="Loading account"
        className="inline-block h-9 w-20 animate-pulse rounded-full bg-white/[0.05]"
      />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center rounded-full px-4 text-sm font-medium text-slate-300 transition-colors hover:text-white"
      >
        Sign in
      </Link>
    );
  }

  const displayName =
    profile?.full_name?.trim() || user.email || "TISA account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profileHref =
    profile?.role === "admin" ? "/admin/profile" : "/account/profile";
  const dashboardHref =
    profile?.role === "admin" ? "/admin" : profile?.role === "customer" ? "/account" : null;
  const isOnDashboard = pathname === dashboardHref;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 max-w-52 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.07]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-400/15 text-[11px] font-semibold text-sky-200">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 object-cover"
            />
          ) : (
            initials || "T"
          )}
        </span>
        <span className="truncate">{displayName}</span>
        <span aria-hidden="true" className="text-[10px] text-slate-500">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0c121d] p-2 shadow-2xl shadow-black/40"
        >
          <div className="border-b border-white/[0.07] px-3 py-3">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {profile?.email || user.email}
            </p>
            {error && (
              <p role="alert" className="mt-2 text-xs text-amber-300">
                {error}
              </p>
            )}
          </div>

          {dashboardHref && (
            <Link
              role="menuitem"
              href={isOnDashboard ? "/" : dashboardHref}
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {isOnDashboard
                ? "Home"
                : profile?.role === "admin"
                  ? "Admin dashboard"
                  : "My account"}
            </Link>
          )}
          {profile && (
            <Link
              role="menuitem"
              href={profileHref}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Profile settings
            </Link>
          )}

          {signOutError && (
            <p role="alert" className="px-3 py-2 text-xs text-red-300">
              {signOutError}
            </p>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={signingOut}
            className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-60"
          >
            {signingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
