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
import {
  Bell,
  CalendarCheck,
  Compass,
  FileText,
  House,
  LogOut,
  Menu,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from "lucide-react";
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
  overview: House,
  requests: MessageCircle,
  documents: FileText,
  quotes: FileText,
  bookings: CalendarCheck,
  trips: Compass,
  messages: MessageCircle,
  notifications: Bell,
  profile: UserRound,
  logout: LogOut,
  menu: Menu,
  collapse: PanelLeftClose,
  expand: PanelLeftOpen,
  close: X,
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
  const IconComponent = name === "home" ? House : icons[name];
  return (
    <IconComponent
      aria-hidden="true"
      className={className}
      strokeWidth={1.7}
    />
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
  const currentPage =
    navigation.find(
      (item) => item.href !== "/" && isActive(pathname, item),
    )?.label ?? "Overview";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="customer-portal min-h-screen overflow-x-hidden bg-background text-foreground">
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
          "customer-portal__sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border shadow-[8px_0_28px_rgba(15,35,55,0.04)]",
          "bg-surface transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
          "w-[288px]",
          collapsed ? "lg:w-[84px]" : "lg:w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-border px-5">
          <Link
            href="/account"
            aria-label="TISA Global customer overview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary-soft text-sm font-extrabold text-primary shadow-sm"
          >
            T
          </Link>
          <div className={collapsed ? "lg:hidden" : ""}>
            <p className="text-xs font-bold tracking-[0.14em] text-foreground">
              TISA GLOBAL
            </p>
            <p className="mt-1 text-[10px] tracking-wide text-muted">
              Your travel concierge
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            ref={drawerCloseRef}
            aria-label="Close customer navigation"
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          >
            <Icon name="close" />
          </button>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="ml-auto hidden h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:grid"
          >
            <Icon name={collapsed ? "expand" : "collapse"} className="h-4 w-4" />
          </button>
        </div>

        <nav
          aria-label="Customer navigation"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5"
        >
          <p
            className={`px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted ${collapsed ? "lg:hidden" : ""}`}
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
                    ? "bg-primary-soft text-primary"
                    : "text-muted hover:bg-surface-light hover:text-foreground",
                  collapsed ? "lg:justify-center lg:px-0" : "",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-primary" />
                )}
                <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                {badge !== null && badge > 0 && (
                  <span
                    aria-label={`${badge} unread notifications`}
                    className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div
            className={`mb-2 flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3 ${collapsed ? "lg:justify-center lg:px-1" : ""}`}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary-soft text-xs font-semibold text-primary">
              {initials || "T"}
            </div>
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-xs font-medium text-foreground">
                {displayName}
              </p>
              <p className="mt-1 truncate text-[10px] text-muted">
                {profile?.email || user?.email || "TISA traveler"}
              </p>
            </div>
          </div>
          {signOutError && (
            <p role="alert" className="px-2 py-2 text-xs text-rose-600 dark:text-rose-300">
              {signOutError}
            </p>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            title={collapsed ? "Log out" : undefined}
            className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-muted transition hover:bg-rose-500/10 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 dark:hover:text-rose-200 ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
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
        <header className="customer-portal__topbar sticky top-0 z-30 flex h-[68px] items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              ref={menuButtonRef}
              aria-label="Open customer navigation"
              aria-controls="customer-sidebar"
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            >
              <Icon name="menu" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {currentPage}
              </p>
              <p className="mt-1 hidden text-[11px] text-muted sm:block">
                TISA Global <span aria-hidden="true">·</span> Personal travel workspace
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
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-light hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Icon name="notifications" />
              {unreadNotifications !== null && unreadNotifications > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
              )}
            </Link>
          </div>
        </header>

        <div className="customer-portal__content mx-auto min-h-[calc(100vh-68px)] w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
