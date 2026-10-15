"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  short_description: string | null;
  description: string | null;
  icon: string | null;
  active: boolean;
  sort_order: number | null;
  created_at: string | null;
};

function statusClasses(active: boolean) {
  return active
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
    : "border-slate-400/15 bg-slate-400/[0.06] text-slate-500";
}

function categoryClasses(category: string | null) {
  const value = category?.toLowerCase() ?? "";

  if (value.includes("visa")) {
    return "border-violet-400/20 bg-violet-400/10 text-violet-300";
  }

  if (value.includes("flight") || value.includes("travel")) {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (value.includes("medical")) {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  if (
    value.includes("student") ||
    value.includes("education")
  ) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  return "border-white/10 bg-white/[0.04] text-slate-400";
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "success" | "muted";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-300"
      : tone === "muted"
        ? "text-slate-400"
        : "text-white";

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {hint}
      </p>
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const [updatingId, setUpdatingId] = useState<string | null>(
    null,
  );

  async function loadServices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/services",
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Unable to load services.",
        );
      }

      setServices(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load services.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadServices();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter(
            (value): value is string =>
              Boolean(value),
          ),
      ),
    ).sort();
  }, [services]);

  const stats = useMemo(() => {
    const active = services.filter(
      (service) => service.active,
    ).length;

    return {
      total: services.length,
      active,
      inactive: services.length - active,
      categories: categories.length,
    };
  }, [services, categories]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const matchesQuery =
        !normalizedQuery ||
        service.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        service.slug
          .toLowerCase()
          .includes(normalizedQuery) ||
        service.category
          ?.toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        category === "all" ||
        service.category === category;

      const matchesStatus =
        status === "all" ||
        (status === "active" && service.active) ||
        (status === "inactive" && !service.active);

      return (
        Boolean(matchesQuery) &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [services, query, category, status]);

  async function toggleService(service: Service) {
    try {
      setUpdatingId(service.id);
      setError("");

      const response = await fetch(
        `/api/admin/services/${service.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !service.active,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            "Unable to update service.",
        );
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? result.data
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update service.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-w-0 w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* Header */}
        <section>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Link
                  href="/admin"
                  className="transition hover:text-slate-300"
                >
                  Administration
                </Link>

                <span>/</span>

                <span className="text-slate-500">
                  Services
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                  Fulfillment
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Service catalog
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Manage the services TISA Global offers across
                  international travel, visa assistance, medical
                  tourism, education travel, and custom support.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                Public catalog
              </p>

              <Link
                href="/services"
                target="_blank"
                className="mt-1 block text-xs text-sky-300 transition hover:text-sky-200"
              >
                View services ↗
              </Link>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-300">
            <div className="flex items-start gap-3">
              <span>!</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Metrics */}
        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            label="Total services"
            value={stats.total}
            hint="Catalog entries"
          />

          <MetricCard
            label="Active"
            value={stats.active}
            hint="Visible publicly"
            tone="success"
          />

          <MetricCard
            label="Inactive"
            value={stats.inactive}
            hint="Hidden from public"
            tone="muted"
          />

          <MetricCard
            label="Categories"
            value={stats.categories}
            hint="Service groups"
          />
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-700">
                ⌕
              </span>

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search services, slugs or categories..."
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-black/10 pl-9 pr-3 text-sm text-slate-200 outline-none placeholder:text-slate-700 focus:border-sky-400/30"
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-10 rounded-xl border border-white/[0.07] bg-[#0b111b] px-3 text-sm text-slate-400 outline-none focus:border-sky-400/30"
            >
              <option value="all">
                All categories
              </option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-10 rounded-xl border border-white/[0.07] bg-[#0b111b] px-3 text-sm text-slate-400 outline-none focus:border-sky-400/30"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={() => void loadServices()}
              disabled={loading}
              className="h-10 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
            >
              {loading ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-700">
            <span>
              Showing {filteredServices.length} of{" "}
              {services.length} services
            </span>

            {(query ||
              category !== "all" ||
              status !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                }}
                className="text-sky-400/70 transition hover:text-sky-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Service list */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Services
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Public-facing services and their availability.
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-slate-600">
                ✦
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No services found
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] lg:block">
                <div className="grid grid-cols-[1.6fr_.9fr_.65fr_.75fr_1fr] gap-4 border-b border-white/[0.07] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  <span>Service</span>
                  <span>Category</span>
                  <span>Status</span>
                  <span>Order</span>
                  <span className="text-right">
                    Action
                  </span>
                </div>

                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="grid grid-cols-[1.6fr_.9fr_.65fr_.75fr_1fr] items-center gap-4 border-b border-white/[0.05] px-5 py-4 last:border-b-0 hover:bg-white/[0.02]"
                  >
                    {/* Service */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-black/10 text-lg">
                        {service.icon || "✦"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {service.name}
                        </p>

                        <p className="mt-1 truncate font-mono text-[10px] text-slate-700">
                          /services/{service.slug}
                        </p>

                        {service.short_description && (
                          <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                            {service.short_description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] ${categoryClasses(
                          service.category,
                        )}`}
                      >
                        {service.category || "Uncategorized"}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] capitalize ${statusClasses(
                          service.active,
                        )}`}
                      >
                        {service.active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    {/* Order */}
                    <div>
                      <span className="text-sm text-slate-500">
                        {service.sort_order ?? "—"}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          void toggleService(service)
                        }
                        disabled={
                          updatingId === service.id
                        }
                        className={[
                          "rounded-xl border px-3 py-2 text-xs transition",
                          service.active
                            ? "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:bg-rose-400/[0.06] hover:text-rose-300"
                            : "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300 hover:bg-emerald-400/10",
                          updatingId === service.id
                            ? "cursor-not-allowed opacity-50"
                            : "",
                        ].join(" ")}
                      >
                        {updatingId === service.id
                          ? "Updating…"
                          : service.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="space-y-3 lg:hidden">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-black/10 text-lg">
                        {service.icon || "✦"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {service.name}
                            </p>

                            <p className="mt-1 truncate font-mono text-[10px] text-slate-700">
                              /services/{service.slug}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${statusClasses(
                              service.active,
                            )}`}
                          >
                            {service.active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        {service.short_description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                            {service.short_description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Category
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {service.category ||
                            "Uncategorized"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Sort order
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {service.sort_order ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                      <span className="text-[10px] text-slate-700">
                        Added {formatDate(service.created_at)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleService(service)
                        }
                        disabled={
                          updatingId === service.id
                        }
                        className={[
                          "rounded-xl border px-3 py-2 text-xs transition",
                          service.active
                            ? "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:text-rose-300"
                            : "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300",
                          updatingId === service.id
                            ? "opacity-50"
                            : "",
                        ].join(" ")}
                      >
                        {updatingId === service.id
                          ? "Updating…"
                          : service.active
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Catalog architecture */}
        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                Fulfillment catalog
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Service → Request → Quote → Booking
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                These services are reused throughout the TISA Global
                customer journey. Activating a service makes it
                available on the public service catalog and eligible
                for new requests.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                ["Service", "01"],
                ["Request", "02"],
                ["Quote", "03"],
                ["Booking", "04"],
              ].map(([label, number]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.07] bg-black/10 px-3 py-3 text-center"
                >
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-slate-700">
                    {number}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="mt-8 border-t border-white/[0.06] pt-5">
          <div className="flex flex-col gap-2 text-xs leading-5 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p>TISA Global service catalog</p>

            <p>
              Public catalog · Request workflow · Fulfillment
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}