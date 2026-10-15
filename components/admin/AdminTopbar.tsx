"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/auth/UserMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/requests": "Requests",
  "/admin/customers": "Customers",
  "/admin/events": "Events",
  "/admin/bookings": "Bookings",
  "/admin/services": "Services",
  "/admin/packages": "Packages",
  "/admin/quotes": "Quotes",
  "/admin/documents": "Documents",
  "/admin/integrations": "Integrations",
  "/admin/notifications": "Notifications",
};

export default function AdminTopbar() {
  const pathname = usePathname();

  const title =
    titles[pathname] ||
    Object.entries(titles).find(
      ([key]) =>
        key !== "/admin" &&
        pathname.startsWith(`${key}/`),
    )?.[1] ||
    "Administration";

  function openMobileMenu() {
    window.dispatchEvent(
      new Event("tisa-admin-open-menu"),
    );
  }

  return (
    <header
      className="
        sticky
        top-0
        z-30
        h-16
        border-b
        border-white/[0.07]
        bg-background/95
        backdrop-blur-xl
      "
    >
      <div className="
        flex
        h-full
        min-w-0
        items-center
        justify-between
        gap-3
        px-3
        sm:px-5
        lg:px-7
      ">

        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="flex min-w-0 items-center gap-3">

          {/* Mobile menu */}

          <button
            type="button"
            onClick={openMobileMenu}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              text-slate-400
              transition
              hover:bg-white/[0.05]
              hover:text-white
              active:scale-[0.97]
              lg:hidden
            "
            aria-label="Open admin navigation"
          >
            <span className="sr-only">
              Open navigation
            </span>

            <span className="flex flex-col gap-[3px]">
              <span className="block h-[1.5px] w-4 rounded-full bg-current" />
              <span className="block h-[1.5px] w-3 rounded-full bg-current" />
              <span className="block h-[1.5px] w-4 rounded-full bg-current" />
            </span>
          </button>

          {/* Mobile brand */}

          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <div className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-sky-400
              text-[10px]
              font-bold
              text-slate-950
            ">
              T
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold tracking-wide text-white">
                TISA GLOBAL
              </p>

              <p className="truncate text-[8px] uppercase tracking-[0.15em] text-slate-700">
                Admin
              </p>
            </div>
          </div>

          {/* Desktop / page title */}

          <div className="
            hidden
            min-w-0
            lg:block
          ">
            <p className="truncate text-sm font-medium text-white">
              {title}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-slate-600">
              TISA Global operations
            </p>
          </div>

          {/* Mobile page title */}

          <div className="
            min-w-0
            lg:hidden
          ">
            <div className="h-5 w-px bg-white/[0.08]" />
          </div>

          <div className="min-w-0 lg:hidden">
            <p className="truncate text-xs font-medium text-slate-300">
              {title}
            </p>
          </div>
        </div>

        {/* ===================================================
            RIGHT ACTIONS
        ==================================================== */}

        <div className="
          flex
          shrink-0
          items-center
          gap-2
          sm:gap-2
        ">

          {/* Desktop search */}

          <button
            type="button"
            className="
              hidden
              h-9
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              px-3
              text-xs
              text-slate-600
              transition
              hover:border-white/10
              hover:bg-white/[0.04]
              hover:text-slate-300
              md:flex
            "
          >
            <span className="text-sm">
              ⌕
            </span>

            <span>Search</span>

            <kbd className="
              ml-3
              rounded-md
              border
              border-white/10
              px-1.5
              py-0.5
              text-[9px]
              text-slate-700
            ">
              /
            </kbd>
          </button>

          {/* Notifications */}

          <Link
            href="/admin/notifications"
            className="
              relative
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.02]
              text-sm
              text-slate-500
              transition
              hover:bg-white/[0.05]
              hover:text-white
              active:scale-[0.97]
            "
            aria-label="Notifications"
          >
            ♢

            <span
              className="
                absolute
                right-2
                top-2
                h-1.5
                w-1.5
                rounded-full
                bg-sky-400
                shadow-[0_0_7px_rgba(56,189,248,0.45)]
              "
            />
          </Link>

          <ThemeToggle />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}