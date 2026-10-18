
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Plane,
  Sparkles,
  X,
} from "lucide-react";

import UserMenu from "@/components/auth/UserMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import TisaBrandMark from "@/components/layout/TisaBrandMark";

const navItems = [
  { label: "Services", href: "/services" },
  { label: "Conferences", href: "/events" },
  { label: "Destinations", href: "/explore" },
  { label: "Packages", href: "/packages" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({
  useWideBreakpoint = false,
}: {
  useWideBreakpoint?: boolean;
}) {
  const pathname = usePathname();
  return (
    <NavbarMenu
      key={pathname}
      pathname={pathname}
      useWideBreakpoint={useWideBreakpoint}
    />
  );
}

function NavbarMenu({
  pathname,
  useWideBreakpoint,
}: {
  pathname: string;
  useWideBreakpoint: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const suppressDropdownFocusRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (dropdownRef.current?.contains(document.activeElement)) {
          suppressDropdownFocusRef.current = true;
          desktopDropdownTriggerRef.current?.focus();
        } else if (
          document
            .getElementById("public-navigation")
            ?.contains(document.activeElement)
        ) {
          mobileMenuButtonRef.current?.focus();
        }
        setMobileOpen(false);
        setMobileDropdownOpen(false);
        setDesktopDropdownOpen(false);
      }
    }

    function handleOutsideClick(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDesktopDropdownOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleOutsideClick);

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function openDesktopDropdown() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setDesktopDropdownOpen(true);
  }

  function scheduleDesktopDropdownClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setDesktopDropdownOpen(false);
    }, 150);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
    setMobileDropdownOpen(false);
  }

  const linkClass = (active: boolean) =>
    [
      "relative inline-flex items-center gap-1.5 rounded-full",
      "px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-primary focus-visible:ring-offset-2",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted hover:bg-surface-light hover:text-foreground",
    ].join(" ");

  return (
    <header className="site-navbar sticky top-0 z-50 border-b border-border/70 text-foreground backdrop-blur-2xl transition-colors duration-300">
      <nav
        aria-label="Main navigation"
        className="site-navbar__container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="site-navbar__bar flex h-[68px] items-center justify-between gap-3 sm:h-[76px]">
          {/* Brand */}
          <Link
            href="/"
            aria-label="TISA Global home"
            className="site-navbar__brand group flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:gap-2.5"
          >
            <span
              aria-hidden="true"
              className="site-navbar__brand-mark transition-transform duration-200 group-hover:scale-[1.035]"
            >
              <TisaBrandMark />
            </span>

            <span className="flex flex-col">
              <span className="whitespace-nowrap text-[17px] font-extrabold leading-none tracking-[-0.045em] sm:text-xl">
                TISA
                <span className="ml-1.5 text-primary">GLOBAL</span>
              </span>

              <span className="site-navbar__tagline mt-1.5 whitespace-nowrap text-[7px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[8px] sm:tracking-[0.15em]">
                Explore · Connect · Experience
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <div
            className={[
              "hidden items-center gap-1",
              useWideBreakpoint ? "xl:flex 2xl:gap-1.5" : "xl:flex xl:gap-1.5",
            ].join(" ")}
          >
            {navItems.map((item) => {
              const active = isActiveRoute(pathname, item.href);

              if (item.href === "/explore") {
                return (
                  <div
                    key={item.href}
                    ref={dropdownRef}
                    className="site-navbar__dropdown relative py-2"
                    onMouseEnter={openDesktopDropdown}
                    onMouseLeave={scheduleDesktopDropdownClose}
                    onBlur={(event) => {
                      if (
                        !event.currentTarget.contains(
                          event.relatedTarget as Node | null,
                        )
                      ) {
                        setDesktopDropdownOpen(false);
                      }
                    }}
                  >
                    <button
                      ref={desktopDropdownTriggerRef}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={desktopDropdownOpen}
                      aria-controls="desktop-destinations-menu"
                      onClick={(event) => {
                        if (event.detail === 0) {
                          openDesktopDropdown();
                        } else if (desktopDropdownOpen) {
                          setDesktopDropdownOpen(false);
                        } else {
                          openDesktopDropdown();
                        }
                      }}
                      onFocus={(event) => {
                        if (suppressDropdownFocusRef.current) {
                          suppressDropdownFocusRef.current = false;
                          return;
                        }
                        if (event.currentTarget.matches(":focus-visible")) {
                          openDesktopDropdown();
                        }
                      }}
                      aria-current={active ? "page" : undefined}
                      className={`${linkClass(active)} site-navbar__link`}
                    >
                      Destinations

                      <ChevronDown
                        aria-hidden="true"
                        className={[
                          "h-3.5 w-3.5 transition-transform duration-300",
                          desktopDropdownOpen ? "rotate-180" : "",
                        ].join(" ")}
                      />
                    </button>

                    <div
                      id="desktop-destinations-menu"
                      className={[
                        "absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2",
                        "transition-[opacity,transform,visibility] duration-200 ease-out",
                        desktopDropdownOpen
                          ? "visible translate-y-0 opacity-100"
                          : "invisible pointer-events-none -translate-y-2 opacity-0",
                      ].join(" ")}
                    >
                      <div className="site-navbar__dropdown-panel overflow-hidden rounded-2xl border border-border/70 p-2 backdrop-blur-2xl">
                        <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                          Discover the world
                        </p>

                        <Link
                          href="/explore"
                          aria-current={
                            pathname === "/explore" ? "page" : undefined
                          }
                          onClick={() => setDesktopDropdownOpen(false)}
                          className={[
                            "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                            "site-navbar__dropdown-link",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-surface-light",
                          ].join(" ")}
                        >
                          <span className="site-navbar__dropdown-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                            <Plane aria-hidden="true" className="h-4 w-4" />
                          </span>

                          <span>
                            <span className="block text-sm font-semibold">
                              Explore Destinations
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              Find your next journey
                            </span>
                          </span>
                        </Link>

                        <Link
                          href="/packages"
                          aria-current={
                            isActiveRoute(pathname, "/packages")
                              ? "page"
                              : undefined
                          }
                          onClick={() => setDesktopDropdownOpen(false)}
                          className={[
                            "group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                            "site-navbar__dropdown-link",
                            isActiveRoute(pathname, "/packages")
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-surface-light",
                          ].join(" ")}
                        >
                          <span className="site-navbar__dropdown-icon grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                            <Sparkles
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          </span>

                          <span>
                            <span className="block text-sm font-semibold">
                              Travel Packages
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              Discover travel experiences
                            </span>
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${linkClass(active)} site-navbar__link`}
                >
                  {item.label}

                  <span
                    aria-hidden="true"
                    className={[
                      "absolute bottom-1 left-3 right-3 h-0.5 origin-left rounded-full bg-primary transition-transform duration-200",
                      active ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </div>

          {/* Desktop actions + mobile controls */}
          <div className="site-navbar__actions flex shrink-0 items-center gap-2">
            <ThemeToggle />

            <div
              className={[
                "hidden items-center gap-3",
                "xl:flex",
              ].join(" ")}
            >
              <Link
                href="/request"
                className="site-navbar__cta inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Get assistance
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>

              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-label={
                mobileOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileOpen}
              aria-controls="public-navigation"
              onClick={() => setMobileOpen((open) => !open)}
              className={[
                "site-navbar__menu-toggle grid h-10 w-10 place-items-center rounded-xl border border-border/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "xl:hidden",
              ].join(" ")}
            >
              {mobileOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          id="public-navigation"
          aria-label="Mobile navigation"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
          className={[
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out",
            "xl:hidden",
            mobileOpen
              ? "grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="site-navbar__mobile-panel border-t border-border/70 py-3">
              <div className="grid gap-1">
                {navItems.map((item) => {
                  const active = isActiveRoute(pathname, item.href);

                  if (item.href === "/explore") {
                    return (
                      <div key={item.href}>
                        <button
                          type="button"
                          aria-expanded={mobileDropdownOpen}
                          aria-controls="mobile-destinations-menu"
                          onClick={() =>
                            setMobileDropdownOpen((open) => !open)
                          }
                          className={[
                            "site-navbar__mobile-link flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-muted hover:bg-surface-light hover:text-foreground",
                          ].join(" ")}
                        >
                          Destinations

                          <ChevronDown
                            aria-hidden="true"
                            className={[
                              "h-4 w-4 transition-transform duration-300",
                              mobileDropdownOpen ? "rotate-180" : "",
                            ].join(" ")}
                          />
                        </button>

                        <div
                          id="mobile-destinations-menu"
                          className={[
                            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200",
                            mobileDropdownOpen
                              ? "grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0",
                          ].join(" ")}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="ml-4 mt-1 grid gap-1 border-l border-border pl-3">
                              <Link
                                href="/explore"
                                tabIndex={
                                  mobileOpen && mobileDropdownOpen ? 0 : -1
                                }
                                aria-current={
                                  pathname === "/explore" ? "page" : undefined
                                }
                                onClick={closeMobileMenu}
                                className="site-navbar__mobile-sub-link rounded-lg px-3 py-2.5 text-sm text-muted transition-colors"
                              >
                                Explore Destinations
                              </Link>

                              <Link
                                href="/packages"
                                tabIndex={
                                  mobileOpen && mobileDropdownOpen ? 0 : -1
                                }
                                aria-current={
                                  isActiveRoute(pathname, "/packages")
                                    ? "page"
                                    : undefined
                                }
                                onClick={closeMobileMenu}
                                className="site-navbar__mobile-sub-link rounded-lg px-3 py-2.5 text-sm text-muted transition-colors"
                              >
                                Travel Packages
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      tabIndex={mobileOpen ? 0 : -1}
                      aria-current={active ? "page" : undefined}
                      onClick={closeMobileMenu}
                      className={[
                        "site-navbar__mobile-link rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:bg-surface-light hover:text-foreground",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/request"
                tabIndex={mobileOpen ? 0 : -1}
                onClick={closeMobileMenu}
                className="site-navbar__cta site-navbar__cta--mobile mt-3 flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Get assistance
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>

              <div className="mt-3 border-t border-border px-2 pt-4">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}