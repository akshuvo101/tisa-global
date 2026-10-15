import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type Booking = {
  id: string;
  booking_reference: string | null;
  status: string;
  currency: string | null;
  total_amount: number | null;
  created_at: string;
  service_requests: {
    id: string;
    destination_country: string | null;
    destination_city: string | null;
    profiles: {
      full_name: string | null;
    } | null;
  } | null;
};

type RawBooking = {
  id: string;
  booking_reference: string | null;
  status: string;
  currency: string | null;
  total_amount: number | null;
  created_at: string;
  service_requests:
    | {
        id: string;
        destination_country: string | null;
        destination_city: string | null;
        profiles:
          | {
              full_name: string | null;
            }[]
          | {
              full_name: string | null;
            }
          | null;
      }[]
    | {
        id: string;
        destination_country: string | null;
        destination_city: string | null;
        profiles:
          | {
              full_name: string | null;
            }[]
          | {
              full_name: string | null;
            }
          | null;
      }
    | null;
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "travel_ready", label: "Travel ready" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
  { value: "cancelled", label: "Cancelled" },
];

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getRequest(
  relation: RawBooking["service_requests"],
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function getProfileName(
  profiles:
    | {
        full_name: string | null;
      }[]
    | {
        full_name: string | null;
      }
    | null
    | undefined,
) {
  if (Array.isArray(profiles)) {
    return profiles[0]?.full_name || "Customer";
  }

  return profiles?.full_name || "Customer";
}

function normalizeBookings(
  rows: RawBooking[],
): Booking[] {
  return rows.map((row) => {
    const request = getRequest(row.service_requests);

    return {
      id: row.id,
      booking_reference: row.booking_reference,
      status: row.status,
      currency: row.currency,
      total_amount: row.total_amount,
      created_at: row.created_at,
      service_requests: request
        ? {
            id: request.id,
            destination_country:
              request.destination_country,
            destination_city:
              request.destination_city,
            profiles: {
              full_name: getProfileName(
                request.profiles,
              ),
            },
          }
        : null,
    };
  });
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "pending":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "processing":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "confirmed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "travel_ready":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "completed":
      return "border-green-400/20 bg-green-400/10 text-green-300";

    case "on_hold":
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";

    case "cancelled":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-400";
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatAmount(
  amount: number | null,
  currency: string | null,
) {
  if (amount === null || amount === undefined) {
    return "—";
  }

  const value = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency || "USD"} ${value}`;
}

function countStatus(
  bookings: Booking[],
  status: string,
) {
  return bookings.filter(
    (booking) => booking.status === status,
  ).length;
}

export default async function AdminBookingsPage({
  searchParams,
}: PageProps) {
  const supabase = await createClient();

  // ------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profile?.role !== "admin"
  ) {
    redirect("/account");
  }

  // ------------------------------------------------------------
  // URL PARAMS
  // ------------------------------------------------------------

  const params = (await searchParams) ?? {};

  const q = getParam(params.q).trim();
  const status = getParam(params.status);

  // ------------------------------------------------------------
  // BOOKINGS
  // ------------------------------------------------------------

  const { data: bookingData, error } = await supabase
    .from("bookings")
    .select(
      `
        id,
        booking_reference,
        status,
        currency,
        total_amount,
        created_at,
        service_requests(
          id,
          destination_country,
          destination_city,
          profiles!service_requests_user_id_fkey(
            full_name
          )
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  const rawBookings =
    (bookingData ?? []) as unknown as RawBooking[];

  let bookings = normalizeBookings(rawBookings);

  // ------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------

  if (status) {
    bookings = bookings.filter(
      (booking) => booking.status === status,
    );
  }

  if (q) {
    const search = q.toLowerCase();

    bookings = bookings.filter((booking) => {
      const request =
        booking.service_requests;

      const customer =
        request?.profiles?.full_name || "";

      const destination = [
        request?.destination_city || "",
        request?.destination_country || "",
      ].join(" ");

      const reference =
        booking.booking_reference || "";

      const id = booking.id;

      return [
        customer,
        destination,
        reference,
        id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }

  // ------------------------------------------------------------
  // METRICS
  // ------------------------------------------------------------

  const allBookings = normalizeBookings(
    rawBookings,
  );

  const totalBookings = allBookings.length;

  const processingCount = countStatus(
    allBookings,
    "processing",
  );

  const confirmedCount = countStatus(
    allBookings,
    "confirmed",
  );

  const travelReadyCount = countStatus(
    allBookings,
    "travel_ready",
  );

  const pendingCount = countStatus(
    allBookings,
    "pending",
  );

  const completedCount = countStatus(
    allBookings,
    "completed",
  );

  const onHoldCount = countStatus(
    allBookings,
    "on_hold",
  );

  const attentionCount =
    processingCount +
    onHoldCount;

  const totalValue = allBookings.reduce(
    (sum, booking) =>
      sum + (booking.total_amount ?? 0),
    0,
  );

  const totalCurrency =
    allBookings.find(
      (booking) => booking.currency,
    )?.currency || "USD";

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div>
          <Link
            href="/admin"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Admin dashboard
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
              Fulfillment
            </p>

            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                  Bookings
                </h1>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Manage confirmed travel fulfillment,
                  provider details, and customer travel
                  readiness.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                    Total value
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {totalCurrency}{" "}
                    {totalValue.toLocaleString(
                      "en-US",
                      {
                        maximumFractionDigits: 2,
                      },
                    )}
                  </p>
                </div>

                <Link
                  href="/admin/requests"
                  className="rounded-2xl bg-white/[0.05] px-5 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  Requests →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* KPI */}
        {/* ================================================== */}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <MetricCard
            label="Total"
            value={totalBookings}
            description="All bookings"
          />

          <MetricCard
            label="Processing"
            value={processingCount}
            description="In fulfillment"
            valueClass="text-amber-300"
          />

          <MetricCard
            label="Confirmed"
            value={confirmedCount}
            description="Provider confirmed"
            valueClass="text-emerald-300"
          />

          <MetricCard
            label="Travel ready"
            value={travelReadyCount}
            description="Ready to travel"
            valueClass="text-cyan-300"
          />

        </div>

        {/* ================================================== */}
        {/* SNAPSHOT */}
        {/* ================================================== */}

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <SnapshotCard
            label="Pending"
            value={pendingCount}
            dotClass="bg-sky-400"
          />

          <SnapshotCard
            label="Completed"
            value={completedCount}
            dotClass="bg-emerald-400"
          />

          <SnapshotCard
            label="On hold"
            value={onHoldCount}
            dotClass="bg-amber-400"
          />

          <SnapshotCard
            label="Attention"
            value={attentionCount}
            dotClass="bg-rose-400"
          />

        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <form
          action="/admin/bookings"
          method="get"
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto]">

            <div>
              <label
                htmlFor="booking-search"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Search
              </label>

              <input
                id="booking-search"
                name="q"
                defaultValue={q}
                placeholder="Booking, customer or destination..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
              />
            </div>

            <div>
              <label
                htmlFor="booking-status"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Status
              </label>

              <select
                id="booking-status"
                name="status"
                defaultValue={status}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-sky-400/40"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value || "all"
                      }
                      value={option.value}
                      className="bg-slate-950"
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Apply
              </button>
            </div>

            <div className="flex items-end">
              <Link
                href="/admin/bookings"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                Clear
              </Link>
            </div>

          </div>
        </form>

        {/* ================================================== */}
        {/* QUEUE HEADER */}
        {/* ================================================== */}

        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Booking queue
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              {bookings.length}{" "}
              {bookings.length === 1
                ? "result"
                : "results"}
            </p>
          </div>

          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-700 sm:block">
            Latest first
          </span>
        </div>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">

          {/* Desktop header */}

          <div className="hidden grid-cols-[1.25fr_1.15fr_1.1fr_.9fr_.9fr] gap-5 border-b border-white/10 px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-slate-600 lg:grid">
            <span>Booking</span>
            <span>Customer</span>
            <span>Destination</span>
            <span>Status</span>
            <span>Amount</span>
          </div>

          {error && (
            <div className="border-b border-rose-400/10 bg-rose-400/[0.04] px-6 py-4 text-sm text-rose-300">
              Unable to load bookings.
            </div>
          )}

          {/* ================================================== */}
          {/* ROWS */}
          {/* ================================================== */}

          {bookings.map((booking) => {
            const request =
              booking.service_requests;

            const customer =
              request?.profiles?.full_name ||
              "Customer";

            const destination = [
              request?.destination_city,
              request?.destination_country,
            ]
              .filter(Boolean)
              .join(", ");

            return (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="block border-b border-white/5 px-5 py-5 transition last:border-b-0 hover:bg-white/[0.035] sm:px-6"
              >

                {/* Desktop */}

                <div className="hidden lg:grid lg:grid-cols-[1.25fr_1.15fr_1.1fr_.9fr_.9fr] lg:items-center lg:gap-5">

                  {/* Booking */}

                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {booking.booking_reference ||
                        "Booking"}
                    </p>

                    <p className="mt-1 truncate font-mono text-[11px] text-slate-700">
                      {booking.id}
                    </p>

                    <p className="mt-2 text-xs text-slate-600">
                      {formatDate(
                        booking.created_at,
                      )}
                    </p>
                  </div>

                  {/* Customer */}

                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-300">
                      {customer}
                    </p>
                  </div>

                  {/* Destination */}

                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-300">
                      {destination || "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {request?.id
                        ? "Linked request"
                        : "No request"}
                    </p>
                  </div>

                  {/* Status */}

                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs capitalize ${statusClasses(
                        booking.status,
                      )}`}
                    >
                      {statusLabel(
                        booking.status,
                      )}
                    </span>
                  </div>

                  {/* Amount */}

                  <div>
                    <p className="text-sm font-medium text-white">
                      {formatAmount(
                        booking.total_amount,
                        booking.currency,
                      )}
                    </p>
                  </div>

                </div>

                {/* ================================================== */}
                {/* MOBILE */}
                {/* ================================================== */}

                <div className="lg:hidden">

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {booking.booking_reference ||
                          "Booking"}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {customer}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11px] capitalize ${statusClasses(
                        booking.status,
                      )}`}
                    >
                      {statusLabel(
                        booking.status,
                      )}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-700">
                        Destination
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-300">
                        {destination || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-700">
                        Amount
                      </p>

                      <p className="mt-1 text-sm font-medium text-white">
                        {formatAmount(
                          booking.total_amount,
                          booking.currency,
                        )}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xs text-slate-600">
                      {formatDate(
                        booking.created_at,
                      )}
                    </span>

                    <span className="text-xs text-slate-500">
                      View booking →
                    </span>

                  </div>

                </div>

              </Link>
            );
          })}

          {/* ================================================== */}
          {/* EMPTY */}
          {/* ================================================== */}

          {!bookings.length &&
            !error && (
              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-slate-600">
                  —
                </div>

                <h2 className="mt-4 text-sm font-medium text-slate-300">
                  No bookings found
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Bookings created from accepted
                  quotes will appear here.
                </p>

                {(q || status) && (
                  <Link
                    href="/admin/bookings"
                    className="mt-5 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                  >
                    Clear filters
                  </Link>
                )}

              </div>
            )}

        </div>

      </div>
    </main>
  );
}

/* ============================================================ */
/* METRIC CARD */
/* ============================================================ */

function MetricCard({
  label,
  value,
  description,
  valueClass = "text-white",
}: {
  label: string;
  value: number;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:bg-white/[0.035]">

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <span className="text-xs text-slate-700">
          ↗
        </span>
      </div>

      <p
        className={`mt-4 text-3xl font-semibold tracking-tight ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">
        {description}
      </p>

    </div>
  );
}

/* ============================================================ */
/* SNAPSHOT CARD */
/* ============================================================ */

function SnapshotCard({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: number;
  dotClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">

      <div className="flex items-center gap-3">

        <span
          className={`h-2 w-2 rounded-full ${dotClass}`}
        />

        <span className="text-sm text-slate-500">
          {label}
        </span>

      </div>

      <span className="text-sm font-semibold text-slate-300">
        {value}
      </span>

    </div>
  );
}