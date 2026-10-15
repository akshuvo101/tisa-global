"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "changes_requested"
  | "expired"
  | "cancelled";

type Quote = {
  id: string;
  request_id: string;
  quote_number: string;
  status: QuoteStatus;
  subtotal: number;
  service_fee: number;
  discount: number;
  tax: number;
  total_amount: number;
  currency: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string | null;

  request: {
    id: string;
    destination_country: string | null;
    destination_city: string | null;
    status: string;
    priority: string | null;
    created_at: string;
  } | null;

  customer: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
};

const statuses: Array<{
  value: "" | QuoteStatus;
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  {
    value: "changes_requested",
    label: "Changes requested",
  },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

function formatMoney(
  amount: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency || "USD"} ${Number(amount || 0).toLocaleString()}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusClasses(status: QuoteStatus) {
  switch (status) {
    case "draft":
      return "border-slate-400/15 bg-slate-400/[0.06] text-slate-400";

    case "sent":
      return "border-sky-400/15 bg-sky-400/[0.07] text-sky-300";

    case "accepted":
      return "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300";

    case "changes_requested":
      return "border-amber-400/15 bg-amber-400/[0.07] text-amber-300";

    case "expired":
      return "border-orange-400/15 bg-orange-400/[0.07] text-orange-300";

    case "cancelled":
      return "border-rose-400/15 bg-rose-400/[0.07] text-rose-300";

    default:
      return "border-white/[0.08] bg-white/[0.03] text-slate-500";
  }
}

function priorityClasses(priority: string | null) {
  switch (priority) {
    case "urgent":
      return "text-rose-300";

    case "high":
      return "text-amber-300";

    default:
      return "text-slate-600";
  }
}

function statusLabel(status: QuoteStatus) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminQuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | QuoteStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuotes = useCallback(async (): Promise<Quote[] | null> => {
    const response = await fetch("/api/admin/quotes", {
      cache: "no-store",
    });

    const result = await response.json();

    if (response.status === 401) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/admin/quotes")}`,
      );
      return null;
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result?.error?.message ||
          "Unable to load quotes.",
      );
    }

    return result.data ?? [];
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    fetchQuotes()
      .then((data) => {
        if (!cancelled && data) setQuotes(data);
      })
      .catch((err) => {
        if (cancelled) return;

        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quotes.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchQuotes]);

  async function loadQuotes() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchQuotes();
      if (data) setQuotes(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load quotes.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredQuotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotes.filter((quote) => {
      const customerName =
        quote.customer?.full_name?.toLowerCase() || "";

      const customerEmail =
        quote.customer?.email?.toLowerCase() || "";

      const quoteNumber =
        quote.quote_number?.toLowerCase() || "";

      const requestId =
        quote.request_id?.toLowerCase() || "";

      const destination = [
        quote.request?.destination_city,
        quote.request?.destination_country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        quoteNumber.includes(query) ||
        requestId.includes(query) ||
        destination.includes(query);

      const matchesStatus =
        !status || quote.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, status]);

  const total = quotes.length;

  const draft = quotes.filter(
    (quote) => quote.status === "draft",
  ).length;

  const sent = quotes.filter(
    (quote) => quote.status === "sent",
  ).length;

  const accepted = quotes.filter(
    (quote) => quote.status === "accepted",
  ).length;

  const changesRequested = quotes.filter(
    (quote) => quote.status === "changes_requested",
  ).length;

  const hasFilters =
    Boolean(search) || Boolean(status);

  return (
    <main className="min-w-0 w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-600">
                <span>Fulfillment</span>
                <span className="text-slate-800">/</span>
                <span className="text-slate-500">Quotes</span>
              </div>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Quote Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review customer quotes, monitor quote status,
                and continue the fulfillment process.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadQuotes()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 lg:self-auto"
            >
              <span
                className={loading ? "animate-spin" : ""}
              >
                ↻
              </span>
              Refresh
            </button>
          </div>
        </section>

        {/* Metrics */}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            label="Total quotes"
            value={total}
            hint="All quote records"
            icon="◈"
          />

          <MetricCard
            label="Draft"
            value={draft}
            hint="Not sent yet"
            icon="□"
          />

          <MetricCard
            label="Sent"
            value={sent}
            hint="Awaiting customer"
            icon="→"
          />

          <MetricCard
            label="Accepted"
            value={accepted}
            hint="Customer accepted"
            icon="✓"
          />

          <MetricCard
            label="Changes requested"
            value={changesRequested}
            hint="Needs attention"
            icon="!"
          />
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-600"
              >
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search quote, customer, request, destination..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#080d15] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-sky-400/30"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as "" | QuoteStatus,
                )
              }
              className="h-11 rounded-xl border border-white/[0.07] bg-[#080d15] px-3 text-xs text-slate-400 outline-none transition focus:border-sky-400/30"
            >
              {statuses.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <p className="text-xs text-slate-600">
                Showing{" "}
                <span className="text-slate-400">
                  {filteredQuotes.length}
                </span>{" "}
                of {total} quotes
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
                className="text-xs font-medium text-sky-400 transition hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Result header */}
        <section className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-700">
              Quote queue
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              {filteredQuotes.length}{" "}
              {filteredQuotes.length === 1
                ? "quote"
                : "quotes"}
            </h2>
          </div>

          <p className="text-xs text-slate-600">
            Customer quote lifecycle
          </p>
        </section>

        {/* Error */}
        {error && !loading && (
          <section className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-rose-300">
                  Unable to load quotes
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadQuotes()}
                className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.04] hover:text-white"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-5">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-white/[0.035]"
                />
              ))}
            </div>
          </section>
        )}

        {/* Desktop table */}
        {!loading && !error && filteredQuotes.length > 0 && (
          <section className="mt-4 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015] lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left">
                <thead className="border-b border-white/[0.06] bg-white/[0.015]">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Quote
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Customer
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Request
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Total
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Status
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Valid until
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.05]">
                  {filteredQuotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="group transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">
                          {quote.quote_number}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-[10px] text-slate-700">
                          {quote.id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-[180px] truncate text-sm text-slate-300">
                          {quote.customer?.full_name ||
                            "Unknown customer"}
                        </p>

                        <p className="mt-0.5 max-w-[200px] truncate text-[11px] text-slate-600">
                          {quote.customer?.email || "No email"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm text-slate-300">
                            {[
                              quote.request
                                ?.destination_city,
                              quote.request
                                ?.destination_country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Travel request"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className={[
                                "text-[10px] font-medium",
                                priorityClasses(
                                  quote.request
                                    ?.priority ?? null,
                                ),
                              ].join(" ")}
                            >
                              {quote.request?.priority ||
                                "normal"}
                            </span>

                            <span className="text-[10px] text-slate-700">
                              •
                            </span>

                            <span className="text-[10px] text-slate-600">
                              {quote.request_id.slice(
                                0,
                                8,
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-white">
                          {formatMoney(
                            quote.total_amount,
                            quote.currency,
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-600">
                          Subtotal{" "}
                          {formatMoney(
                            quote.subtotal,
                            quote.currency,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium",
                            statusClasses(quote.status),
                          ].join(" ")}
                        >
                          {statusLabel(quote.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs text-slate-400">
                          {formatDate(quote.valid_until)}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-700">
                          Created{" "}
                          {formatDate(quote.created_at)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/quotes/${quote.id}`}
                          className="inline-flex h-8 items-center rounded-lg border border-white/[0.07] px-3 text-[11px] font-medium text-slate-500 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Mobile cards */}
        {!loading &&
          !error &&
          filteredQuotes.length > 0 && (
            <section className="mt-4 grid gap-3 lg:hidden">
              {filteredQuotes.map((quote) => (
                <article
                  key={quote.id}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {quote.quote_number}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-600">
                        {quote.customer?.full_name ||
                          "Unknown customer"}
                      </p>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-medium",
                        statusClasses(quote.status),
                      ].join(" ")}
                    >
                      {statusLabel(quote.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700">
                        Destination
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {[
                          quote.request
                            ?.destination_city,
                          quote.request
                            ?.destination_country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700">
                        Total
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatMoney(
                          quote.total_amount,
                          quote.currency,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700">
                        Valid until
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(quote.valid_until)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-700">
                        Priority
                      </p>

                      <p
                        className={[
                          "mt-1 text-xs capitalize",
                          priorityClasses(
                            quote.request?.priority ??
                              null,
                          ),
                        ].join(" ")}
                      >
                        {quote.request?.priority ||
                          "normal"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <p className="text-[10px] text-slate-700">
                      Created{" "}
                      {formatDate(quote.created_at)}
                    </p>

                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-white/[0.07] px-3 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
                    >
                      Open quote
                    </Link>
                  </div>
                </article>
              ))}
            </section>
          )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredQuotes.length === 0 && (
            <section className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.018] px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-slate-600">
                ◈
              </div>

              <h3 className="mt-4 text-base font-semibold text-white">
                No quotes found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                {hasFilters
                  ? "No quotes match the current search and filter combination."
                  : "There are no quotes in the system yet."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                  }}
                  className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Clear filters
                </button>
              )}
            </section>
          )}

        {/* Workflow note */}
        <section className="mt-6 rounded-2xl border border-sky-400/[0.10] bg-sky-400/[0.025] p-4 sm:p-5">
          <div className="flex gap-3">
            <span className="mt-0.5 text-sky-300">◈</span>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300">
                Quote workflow
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Draft → Sent → Customer review → Accepted or
                Changes requested. Quote acceptance does not
                automatically create a booking; fulfillment is
                confirmed separately by the operations team.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            {hint}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-sm text-slate-500">
          {icon}
        </div>
      </div>
    </div>
  );
}