"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  exact?: boolean;
};

const mainNavigation: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: "⌂",
    exact: true,
  },
  {
    label: "Requests",
    href: "/admin/requests",
    icon: "◫",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: "◎",
  },
  {
    label: "Events",
    href: "/admin/events",
    icon: "◇",
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: "▤",
  },
];

const fulfillmentNavigation: NavItem[] = [
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: "▣",
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: "✦",
  },
  {
    label: "Packages",
    href: "/admin/packages",
    icon: "▤",
  },
  {
    label: "Quotes",
    href: "/admin/quotes",
    icon: "◈",
  },
  {
    label: "Documents",
    href: "/admin/documents",
    icon: "□",
  },
];

const operationsNavigation: NavItem[] = [
  {
    label: "Integrations",
    href: "/admin/integrations",
    icon: "⌘",
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: "◉",
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * AdminTopbar dispatches this event when the mobile
   * hamburger button is pressed.
   */
  useEffect(() => {
    const openMenu = () => {
      setMobileOpen(true);
    };

    window.addEventListener(
      "tisa-admin-open-menu",
      openMenu,
    );

    return () => {
      window.removeEventListener(
        "tisa-admin-open-menu",
        openMenu,
      );
    };
  }, []);

  /*
   * Close mobile drawer whenever the route changes.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Prevent page scrolling while the mobile drawer is open.
   */
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* =====================================================
          MOBILE BACKDROP
      ====================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-[55]
            bg-black/65
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-[60]",
          "w-[288px] lg:w-[260px]",
          "border-r border-white/[0.07]",
          "bg-surface",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full min-h-0 flex-col">

          {/* =================================================
              BRAND
          ================================================== */}

          <div className="flex h-[72px] shrink-0 items-center border-b border-white/[0.07] px-4 sm:px-5">

            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-sky-400
                text-sm
                font-bold
                text-slate-950
                shadow-[0_0_24px_rgba(56,189,248,0.12)]
              ">
                T
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-wide text-white">
                  TISA GLOBAL
                </p>

                <p className="truncate text-[9px] uppercase tracking-[0.2em] text-slate-600">
                  Administration
                </p>
              </div>
            </Link>

            {/* Mobile close */}

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="
                ml-auto
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                text-lg
                text-slate-500
                transition
                hover:bg-white/[0.06]
                hover:text-white
                lg:hidden
              "
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <nav
            aria-label="Admin navigation"
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-3
              py-5
              [scrollbar-width:thin]
              [scrollbar-color:rgba(255,255,255,0.08)_transparent]
            "
          >
            <NavSection
              title="Workspace"
              items={mainNavigation}
              pathname={pathname}
              closeMobile={() =>
                setMobileOpen(false)
              }
            />

            <NavSection
              title="Fulfillment"
              items={fulfillmentNavigation}
              pathname={pathname}
              closeMobile={() =>
                setMobileOpen(false)
              }
            />

            <NavSection
              title="Operations"
              items={operationsNavigation}
              pathname={pathname}
              closeMobile={() =>
                setMobileOpen(false)
              }
            />
          </nav>

          {/* =================================================
              SIDEBAR FOOTER
          ================================================== */}

          <div className="shrink-0 border-t border-white/[0.07] p-3">

            {/* Website */}

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="
                flex
                min-h-[44px]
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                text-slate-500
                transition
                hover:bg-white/[0.04]
                hover:text-white
              "
            >
              <span className="flex h-5 w-5 items-center justify-center text-sm">
                ↗
              </span>

              <span>View website</span>
            </Link>

            {/* User */}

            <div className="
              mt-2
              flex
              min-h-[58px]
              items-center
              gap-3
              rounded-xl
              border
              border-white/[0.04]
              bg-white/[0.025]
              px-3
            ">
              <div className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-sky-400/10
                text-[10px]
                font-semibold
                text-sky-300
                ring-1
                ring-sky-400/10
              ">
                AS
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">
                  AK Shuvo
                </p>

                <p className="mt-0.5 text-[10px] text-slate-600">
                  Administrator
                </p>
              </div>

              <span
                className="
                  ml-auto
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.35)]
                "
                aria-label="Online"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =============================================================
   NAVIGATION SECTION
============================================================= */

function NavSection({
  title,
  items,
  pathname,
  closeMobile,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  closeMobile: () => void;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <p className="
        mb-2
        px-3
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.2em]
        text-slate-700
      ">
        {title}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(
            pathname,
            item,
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              aria-current={
                active ? "page" : undefined
              }
              className={[
                "group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3",
                "text-sm transition-all duration-150",
                active
                  ? "bg-sky-400/[0.10] text-sky-300"
                  : "text-slate-500 hover:bg-white/[0.035] hover:text-slate-200",
              ].join(" ")}
            >
              {/* Active indicator */}

              {active && (
                <span className="
                  absolute
                  left-0
                  top-1/2
                  h-5
                  w-[2px]
                  -translate-y-1/2
                  rounded-r-full
                  bg-sky-400
                " />
              )}

              {/* Icon */}

              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center text-[15px]",
                  "transition-colors",
                  active
                    ? "text-sky-300"
                    : "text-slate-600 group-hover:text-slate-300",
                ].join(" ")}
              >
                {item.icon}
              </span>

              {/* Label */}

              <span className="min-w-0 flex-1 truncate">
                {item.label}
              </span>

              {/* Active dot */}

              {active && (
                <span className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-sky-300
                " />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}