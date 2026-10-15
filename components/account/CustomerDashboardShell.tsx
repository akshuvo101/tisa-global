"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { createClient } from "@/lib/supabase/client";
import {
  logSupabaseDiagnostic,
  logSupabaseException,
} from "@/lib/supabase/diagnostics";

type CustomerNavItem = {
  label: string;
  href: string;
  icon: IconName;
  exact?: boolean;
};

const icons = {
  overview: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6",
  requests: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  documents: "M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M9 13h6M9 17h6",
  quotes: "M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  bookings: "M4 5h16v15H4zM8 3v4M16 3v4M4 10h16M8 14h3",
  trips: "M2 12h20M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1",
  messages: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z",
  notifications: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  profile: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  logout: "M10 17l5-5-5-5M15 12H3M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6",
  menu: "M4 6h16M4 12h16M4 18h16",
  collapse: "M15 18l-6-6 6-6",
  expand: "m9 18 6-6-6-6",
  close: "M18 6 6 18M6 6l12 12",
} as const;

type IconName = keyof typeof icons | "home";

const navigation: CustomerNavItem[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Overview", href: "/account", icon: "overview", exact: true },
  { label: "My Requests", href: "/account/requests", icon: "requests" },
  { label: "Documents", href: "/account/documents", icon: "documents" },
  { label: "Quotes", href: "/account/quotes", icon: "quotes" },
  { label: "Bookings", href: "/account/bookings", icon: "bookings" },
  { label: "My Trips", href: "/account/trips", icon: "trips" },
  { label: "Messages", href: "/account/messages", icon: "messages" },
  {
    label: "Notifications",
    href: "/account/notifications",
    icon: "notifications",
  },
  { label: "My Profile", href: "/account/profile", icon: "profile" },
];

function Icon({
  name,
  className = "h-[18px] w-[18px]",
}: {
  name: IconName;
  className?: string;
}) {
  if (name === "home") {
    return <Home aria-hidden="true" className={className} strokeWidth={1.7} />;
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icons[name]} />
    </svg>
  );
}

function isActive(pathname: string, item: CustomerNavItem) {
  return item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function CustomerDashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number | null>(
    null,
  );
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const opener = menuButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    drawerCloseRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      opener?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    let active = true;

    async function loadUnreadCount() {
      if (!user) {
        setUnreadNotifications(null);
        return;
      }

      let result;
      try {
        result = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false);
      } catch (error) {
        logSupabaseException(
          "Customer unread notification count",
          {
            operation: "browser select head exact-count",
            table: "notifications",
            select: "id",
            filters: ["user_id = authenticated user", "read = false"],
          },
          error,
        );
        if (active) setUnreadNotifications(null);
        return;
      }

      if (!active) return;
      const queryContext = {
        operation: "browser select head exact-count",
        table: "notifications",
        select: "id",
        filters: ["user_id = authenticated user", "read = false"],
        response: {
          status: result.status,
          statusText: result.statusText,
          count: result.count,
        },
      };
      if (result.error) {
        logSupabaseDiagnostic(
          "Customer unread notification count returned an error",
          queryContext,
          result.error,
        );
        setUnreadNotifications(null);
        return;
      }
      setUnreadNotifications(result.count ?? 0);
    }

    const refreshUnreadCount = () => void loadUnreadCount();
    void loadUnreadCount();
    window.addEventListener(
      "tisa-notifications-updated",
      refreshUnreadCount,
    );
    return () => {
      active = false;
      window.removeEventListener(
        "tisa-notifications-updated",
        refreshUnreadCount,
      );
    };
  }, [pathname, supabase, user]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => !current);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Customer sign-out failed:", error);
        setSignOutError("Unable to sign out. Please try again.");
        setSigningOut(false);
        return;
      }
    } catch (error) {
      console.error("Customer sign-out request failed:", error);
      setSignOutError("Unable to sign out. Please try again.");
      setSigningOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  const displayName = profile?.full_name?.trim() || user?.email || "Traveler";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close customer navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="customer-sidebar"
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        aria-label={mobileOpen ? "Customer navigation" : undefined}
        onKeyDown={(event) => {
          if (!mobileOpen || event.key !== "Tab") return;
          const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not(:disabled)',
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.07]",
          "bg-surface transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
          "w-[288px]",
          collapsed ? "lg:w-[84px]" : "lg:w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-5">
          <Link
            href="/account"
            aria-label="TISA Global customer overview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-cyan-300 to-sky-500 text-sm font-extrabold text-slate-950 shadow-[0_7px_28px_rgba(56,189,248,0.18)]"
          >
            T
          </Link>
          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="text-xs font-bold tracking-[0.14em] text-white">
              TISA GLOBAL
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-slate-500">
              Your travel concierge
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            ref={drawerCloseRef}
            aria-label="Close customer navigation"
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <Icon name="close" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="ml-auto hidden h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white lg:grid"
          >
            <Icon name={collapsed ? "expand" : "collapse"} className="h-4 w-4" />
          </button>
        </div>

        <nav
          aria-label="Customer navigation"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5"
        >
          <p
            className={`px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600 ${collapsed ? "lg:hidden" : ""}`}
          >
            Your journey
          </p>
          {navigation.map((item) => {
            const active = isActive(pathname, item);
            const badge =
              item.href === "/account/notifications"
                ? unreadNotifications
                : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={[
                  "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-cyan-300/[0.11] text-cyan-200"
                    : "text-slate-400 hover:bg-white/[0.045] hover:text-white",
                  collapsed ? "lg:justify-center lg:px-0" : "",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-cyan-300" />
                )}
                <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                {badge !== null && badge > 0 && (
                  <span
                    aria-label={`${badge} unread notifications`}
                    className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-300/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-200"
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/[0.07] p-3">
          <div
            className={`mb-2 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 ${collapsed ? "lg:justify-center lg:px-1" : ""}`}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-200/20 bg-cyan-200/10 text-xs font-semibold text-cyan-100">
              {initials || "T"}
            </div>
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-xs font-medium text-white">
                {displayName}
              </p>
              <p className="mt-1 truncate text-[10px] text-slate-500">
                {profile?.email || user?.email || "TISA traveler"}
              </p>
            </div>
          </div>
          {signOutError && (
            <p role="alert" className="px-2 py-2 text-xs text-rose-300">
              {signOutError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            title={collapsed ? "Log out" : undefined}
            className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-slate-500 transition hover:bg-rose-400/[0.08] hover:text-rose-200 disabled:opacity-50 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
          >
            <Icon name="logout" className="h-[18px] w-[18px] shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>
              {signingOut ? "Signing out…" : "Logout"}
            </span>
          </button>
        </div>
      </aside>

      <div
        className={`min-h-screen transition-[padding] duration-300 motion-reduce:transition-none ${collapsed ? "lg:pl-[84px]" : "lg:pl-[264px]"}`}
      >
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              ref={menuButtonRef}
              aria-label="Open customer navigation"
              aria-controls="customer-sidebar"
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] text-slate-300 transition hover:bg-white/[0.05] lg:hidden"
            >
              <Icon name="menu" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                TISA Global
              </p>
              <p className="mt-1 hidden text-[11px] text-slate-500 sm:block">
                Your personal travel workspace
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Link
              href="/account/notifications"
              aria-label={
                unreadNotifications && unreadNotifications > 0
                  ? `Notifications, ${unreadNotifications} unread`
                  : "Notifications"
              }
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-light hover:text-foreground"
            >
              <Icon name="notifications" />
              {unreadNotifications !== null && unreadNotifications > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300 ring-2 ring-background" />
              )}
            </Link>
          </div>
        </header>

        <div className="mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
