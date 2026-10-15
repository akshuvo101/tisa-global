import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // ============================================================
  // AUTH
  // ============================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Admin dashboard profile error:", profileError);
  }

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  // ============================================================
  // REQUEST METRICS
  // ============================================================

  const [
    totalRequestsResult,
    newRequestsResult,
    reviewingRequestsResult,
    urgentRequestsResult,
    completedRequestsResult,
    attentionRequestsResult,
  ] = await Promise.all([
    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true }),

    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "requested"),

    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "reviewing"),

    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("priority", "urgent")
      .not("status", "in", '("completed","cancelled")'),

    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),

    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .in("status", [
        "need_documents",
        "documents_received",
        "quoted",
      ]),
  ]);

  const totalRequests = totalRequestsResult.count ?? 0;
  const newRequests = newRequestsResult.count ?? 0;
  const reviewingRequests = reviewingRequestsResult.count ?? 0;
  const urgentRequests = urgentRequestsResult.count ?? 0;
  const completedRequests = completedRequestsResult.count ?? 0;
  const attentionRequests = attentionRequestsResult.count ?? 0;

  // ============================================================
  // DOCUMENT METRICS
  // ============================================================

  const [
    pendingDocumentsResult,
    rejectedDocumentsResult,
    acceptedDocumentsResult,
  ] = await Promise.all([
    supabase
      .from("request_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "uploaded"),

    supabase
      .from("request_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),

    supabase
      .from("request_documents")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted"),
  ]);

  const pendingDocuments = pendingDocumentsResult.count ?? 0;
  const rejectedDocuments = rejectedDocumentsResult.count ?? 0;
  const acceptedDocuments = acceptedDocumentsResult.count ?? 0;

  // ============================================================
  // QUOTE METRICS
  // ============================================================

  const [
    draftQuotesResult,
    sentQuotesResult,
    acceptedQuotesResult,
    changeRequestedQuotesResult,
  ] = await Promise.all([
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),

    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent"),

    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted"),

    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("status", "changes_requested"),
  ]);

  const draftQuotes = draftQuotesResult.count ?? 0;
  const sentQuotes = sentQuotesResult.count ?? 0;
  const acceptedQuotes = acceptedQuotesResult.count ?? 0;
  const changeRequestedQuotes =
    changeRequestedQuotesResult.count ?? 0;

  // ============================================================
  // BOOKING METRICS
  // ============================================================

  const [
    processingBookingsResult,
    confirmedBookingsResult,
    travelReadyBookingsResult,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing"),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),

    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "travel_ready"),
  ]);

  const processingBookings =
    processingBookingsResult.count ?? 0;

  const confirmedBookings =
    confirmedBookingsResult.count ?? 0;

  const travelReadyBookings =
    travelReadyBookingsResult.count ?? 0;

  // ============================================================
  // EVENT METRICS
  // ============================================================

  const [
    verifiedEventsResult,
    reviewEventsResult,
    reverificationEventsResult,
  ] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "verified"),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("verification_status", [
        "unverified",
        "under_review",
      ]),

    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq(
        "verification_status",
        "needs_reverification",
      ),
  ]);

  const verifiedEvents = verifiedEventsResult.count ?? 0;
  const reviewEvents = reviewEventsResult.count ?? 0;
  const reverificationEvents =
    reverificationEventsResult.count ?? 0;

  // ============================================================
  // RECENT REQUESTS
  // ============================================================

  const { data: requests, error: requestsError } =
    await supabase
      .from("service_requests")
      .select(
        `
        id,
        destination_country,
        destination_city,
        priority,
        status,
        created_at,
        traveler_count,
        profiles!service_requests_user_id_fkey(
          full_name
        ),
        request_services(
          service_catalog(name)
        )
        `,
      )
      .order("created_at", { ascending: false })
      .limit(8);

  if (requestsError) {
    console.error(
      "Admin dashboard requests error:",
      requestsError,
    );
  }

  // ============================================================
  // UPCOMING VERIFIED EVENTS
  // ============================================================

  const { data: upcomingEvents, error: eventsError } =
    await supabase
      .from("events")
      .select(
        "id,title,slug,country,city,start_date,verification_status,last_verified_at",
      )
      .eq("verification_status", "verified")
      .order("start_date", { ascending: true })
      .limit(5);

  if (eventsError) {
    console.error(
      "Admin dashboard events error:",
      eventsError,
    );
  }

  // ============================================================
  // METRIC DATA
  // ============================================================

  const metricCards = [
    {
      label: "Total requests",
      value: totalRequests,
      description: "All customer requests",
      href: "/admin/requests",
      icon: "◫",
    },
    {
      label: "New requests",
      value: newRequests,
      description: "Waiting for review",
      href: "/admin/requests",
      icon: "✦",
      accent: "sky",
    },
    {
      label: "Urgent active",
      value: urgentRequests,
      description: "Priority attention required",
      href: "/admin/requests",
      icon: "!",
      danger: urgentRequests > 0,
    },
    {
      label: "Needs attention",
      value: attentionRequests,
      description: "Documents / quote action",
      href: "/admin/requests",
      icon: "◈",
      warning: attentionRequests > 0,
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-6 lg:px-8 lg:py-9">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Operations center
              </span>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Good day
              {profile?.full_name
                ? `, ${profile.full_name.split(" ")[0]}`
                : ""}
              .
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor customer journeys, service operations,
              events, quotes and travel fulfillment from one
              workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">

            <Link
              href="/admin/requests"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-400 px-4 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Open requests
            </Link>

            <Link
              href="/admin/events"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-4 text-xs font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
            >
              Manage events
            </Link>
          </div>
        </header>

        {/* ======================================================
            KPI CARDS
        ====================================================== */}

        <section className="mt-8">

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className={[
                  "group relative overflow-hidden rounded-2xl",
                  "border border-white/[0.08]",
                  "bg-white/[0.025]",
                  "p-5 transition",
                  "hover:border-white/[0.14]",
                  "hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-sm text-slate-400">
                    {card.icon}
                  </div>

                  {card.danger && (
                    <span className="rounded-full bg-rose-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-rose-300">
                      Urgent
                    </span>
                  )}

                  {card.warning && (
                    <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                      Action
                    </span>
                  )}
                </div>

                <p
                  className={[
                    "mt-5 text-3xl font-semibold tracking-tight",
                    card.danger
                      ? "text-rose-300"
                      : card.warning
                        ? "text-amber-300"
                        : "text-white",
                  ].join(" ")}
                >
                  {card.value}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-300">
                  {card.label}
                </p>

                <p className="mt-1 text-[11px] text-slate-600">
                  {card.description}
                </p>

                <span className="absolute bottom-4 right-5 text-xs text-slate-700 transition group-hover:text-slate-400">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ======================================================
            WORKLOAD OVERVIEW
        ====================================================== */}

        <section className="mt-7 grid gap-4 lg:grid-cols-3">

          <WorkloadCard
            href="/admin/requests"
            label="Request workload"
            value={reviewingRequests}
            description="requests currently under review"
            items={[
              {
                label: "New",
                value: newRequests,
                tone: "sky",
              },
              {
                label: "Reviewing",
                value: reviewingRequests,
                tone: "amber",
              },
              {
                label: "Completed",
                value: completedRequests,
                tone: "emerald",
              },
            ]}
          />

          <WorkloadCard
            href="/admin/requests"
            label="Documents"
            value={pendingDocuments}
            description="uploaded documents awaiting review"
            items={[
              {
                label: "Pending",
                value: pendingDocuments,
                tone: "amber",
              },
              {
                label: "Accepted",
                value: acceptedDocuments,
                tone: "emerald",
              },
              {
                label: "Rejected",
                value: rejectedDocuments,
                tone: "rose",
              },
            ]}
          />

          <WorkloadCard
            href="/admin/bookings"
            label="Travel fulfillment"
            value={confirmedBookings}
            description="confirmed bookings in the system"
            items={[
              {
                label: "Processing",
                value: processingBookings,
                tone: "amber",
              },
              {
                label: "Confirmed",
                value: confirmedBookings,
                tone: "emerald",
              },
              {
                label: "Travel ready",
                value: travelReadyBookings,
                tone: "sky",
              },
            ]}
          />
        </section>

        {/* ======================================================
            MAIN WORKSPACE
        ====================================================== */}

        <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">

          {/* ----------------------------------------------------
              RECENT REQUESTS
          ---------------------------------------------------- */}

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">

            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Customer operations
                </p>

                <h2 className="mt-1.5 text-sm font-semibold text-white">
                  Recent requests
                </h2>
              </div>

              <Link
                href="/admin/requests"
                className="text-xs text-sky-400 transition hover:text-sky-300"
              >
                View queue →
              </Link>
            </div>

            <div className="divide-y divide-white/[0.05]">

              {(requests ?? []).map((request) => {
                const customer = Array.isArray(
                  request.profiles,
                )
                  ? request.profiles[0]
                  : request.profiles;

                const services =
                  Array.isArray(
                    request.request_services,
                  )
                    ? request.request_services
                        .map((item: any) =>
                          Array.isArray(
                            item.service_catalog,
                          )
                            ? item.service_catalog[0]?.name
                            : item.service_catalog?.name,
                        )
                        .filter(Boolean)
                    : [];

                return (
                  <Link
                    key={request.id}
                    href={`/admin/requests/${request.id}`}
                    className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">

                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.035] text-xs text-slate-500 sm:flex">
                        {customer?.full_name
                          ?.slice(0, 2)
                          .toUpperCase() || "CU"}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                          {customer?.full_name ||
                            "Customer"}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600">

                          <span>
                            {request.destination_city ||
                              "International"}
                            {request.destination_country
                              ? `, ${request.destination_country}`
                              : ""}
                          </span>

                          <span className="text-slate-800">
                            •
                          </span>

                          <span>
                            {request.traveler_count ??
                              1}{" "}
                            traveler
                          </span>

                          {services.length > 0 && (
                            <>
                              <span className="text-slate-800">
                                •
                              </span>

                              <span className="truncate">
                                {services[0]}
                                {services.length > 1
                                  ? ` +${services.length - 1}`
                                  : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-12 sm:pl-0">

                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-[10px] capitalize",
                          request.status ===
                          "completed"
                            ? "border-emerald-400/15 bg-emerald-400/5 text-emerald-300"
                            : request.status ===
                                  "processing" ||
                                request.status ===
                                  "confirmed"
                              ? "border-sky-400/15 bg-sky-400/5 text-sky-300"
                              : "border-white/10 bg-white/[0.025] text-slate-500",
                        ].join(" ")}
                      >
                        {request.status.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>

                      <span
                        className={[
                          "text-[10px] font-medium capitalize",
                          request.priority ===
                          "urgent"
                            ? "text-rose-300"
                            : request.priority ===
                                "high"
                              ? "text-amber-300"
                              : "text-slate-600",
                        ].join(" ")}
                      >
                        {request.priority}
                      </span>

                      <span className="text-xs text-slate-700 transition group-hover:text-slate-400">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}

              {!requests?.length && (
                <EmptyState
                  title="No requests yet"
                  description="New customer requests will appear here."
                />
              )}
            </div>
          </section>

          {/* ----------------------------------------------------
              NEEDS ATTENTION
          ---------------------------------------------------- */}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-300/70">
                  Operations
                </p>

                <h2 className="mt-1.5 text-sm font-semibold text-white">
                  Needs attention
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Items currently requiring staff action.
                </p>
              </div>

              {(urgentRequests +
                pendingDocuments +
                changeRequestedQuotes +
                reverificationEvents) >
                0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-rose-400/10 px-2 text-[10px] font-semibold text-rose-300">
                  {urgentRequests +
                    pendingDocuments +
                    changeRequestedQuotes +
                    reverificationEvents}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-2">

              <AttentionRow
                label="New requests"
                value={newRequests}
                href="/admin/requests"
                tone="sky"
              />

              <AttentionRow
                label="Urgent requests"
                value={urgentRequests}
                href="/admin/requests"
                tone="rose"
              />

              <AttentionRow
                label="Documents to review"
                value={pendingDocuments}
                href="/admin/requests"
                tone="amber"
              />

              <AttentionRow
                label="Quote changes"
                value={changeRequestedQuotes}
                href="/admin/requests"
                tone="amber"
              />

              <AttentionRow
                label="Events to reverify"
                value={reverificationEvents}
                href="/admin/events"
                tone="rose"
              />
            </div>

            {urgentRequests === 0 &&
              pendingDocuments === 0 &&
              changeRequestedQuotes === 0 &&
              reverificationEvents === 0 && (
                <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025] px-4 py-3">
                  <p className="text-xs text-emerald-300">
                    Everything looks clear.
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    No urgent operational items require
                    attention right now.
                  </p>
                </div>
              )}
          </section>
        </section>

        {/* ======================================================
            QUOTE + EVENT INTELLIGENCE
        ====================================================== */}

        <section className="mt-7 grid gap-5 lg:grid-cols-2">

          {/* Quotes */}
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Commercial operations
                </p>

                <h2 className="mt-1.5 text-sm font-semibold text-white">
                  Quote pipeline
                </h2>
              </div>

              <Link
                href="/admin/requests"
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                Requests →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <PipelineMetric
                label="Draft"
                value={draftQuotes}
              />

              <PipelineMetric
                label="Sent"
                value={sentQuotes}
                tone="sky"
              />

              <PipelineMetric
                label="Accepted"
                value={acceptedQuotes}
                tone="emerald"
              />

              <PipelineMetric
                label="Changes"
                value={changeRequestedQuotes}
                tone="amber"
              />
            </div>
          </section>

          {/* Events */}
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-400/70">
                  Event intelligence
                </p>

                <h2 className="mt-1.5 text-sm font-semibold text-white">
                  Event verification
                </h2>
              </div>

              <Link
                href="/admin/events"
                className="text-xs text-sky-400 hover:text-sky-300"
              >
                Manage →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">

              <PipelineMetric
                label="Verified"
                value={verifiedEvents}
                tone="emerald"
              />

              <PipelineMetric
                label="Review"
                value={reviewEvents}
                tone="amber"
              />

              <PipelineMetric
                label="Reverify"
                value={reverificationEvents}
                tone="rose"
              />
            </div>
          </section>
        </section>

        {/* ======================================================
            UPCOMING EVENTS
        ====================================================== */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">

          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-400/70">
                Event intelligence
              </p>

              <h2 className="mt-1.5 text-sm font-semibold text-white">
                Upcoming verified events
              </h2>

              <p className="mt-1 text-[11px] text-slate-600">
                Trusted events currently available for customer
                discovery.
              </p>
            </div>

            <Link
              href="/admin/events"
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Manage events →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.05]">

            {(upcomingEvents ?? []).map((event) => (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="group flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">

                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                    <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                      {event.title}
                    </p>
                  </div>

                  <p className="mt-1 pl-3.5 text-[11px] text-slate-600">
                    {[event.city, event.country]
                      .filter(Boolean)
                      .join(", ") ||
                      "International"}
                  </p>
                </div>

                <div className="flex items-center gap-4 pl-3.5 sm:pl-0">

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-300">
                      {event.start_date || "TBC"}
                    </p>

                    <p className="mt-1 text-[10px] text-emerald-300">
                      Verified
                    </p>
                  </div>

                  <span className="text-xs text-slate-700 transition group-hover:text-slate-400">
                    →
                  </span>
                </div>
              </Link>
            ))}

            {!upcomingEvents?.length && (
              <EmptyState
                title="No verified upcoming events"
                description="Verified events will appear here once they are available."
              />
            )}
          </div>
        </section>

        {/* ======================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-7 pb-8">

          <div className="mb-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
              Quick access
            </p>

            <h2 className="mt-1.5 text-sm font-semibold text-white">
              Operations
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <QuickLink
              href="/admin/customers"
              title="Customers"
              description="View customer profiles and active journeys."
            />

            <QuickLink
              href="/admin/bookings"
              title="Bookings"
              description="Manage confirmed travel fulfillment."
            />

            <QuickLink
              href="/admin/events"
              title="Events"
              description="Verify and manage global events."
            />

            <QuickLink
              href="/admin/integrations"
              title="Integrations"
              description="Monitor external data connections."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// COMPONENTS
// ============================================================

function WorkloadCard({
  href,
  label,
  value,
  description,
  items,
}: {
  href: string;
  label: string;
  value: number;
  description: string;
  items: {
    label: string;
    value: number;
    tone: "sky" | "amber" | "emerald" | "rose";
  }[];
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/[0.13] hover:bg-white/[0.035]"
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            {description}
          </p>
        </div>

        <span className="text-xs text-slate-700 transition group-hover:text-slate-400">
          →
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={[
              "rounded-full px-2.5 py-1 text-[10px]",
              toneClasses[item.tone],
            ].join(" ")}
          >
            {item.value} {item.label.toLowerCase()}
          </span>
        ))}
      </div>
    </Link>
  );
}

function AttentionRow({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "sky" | "amber" | "rose";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-3">
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            dotClasses[tone],
          ].join(" ")}
        />

        <span className="text-xs text-slate-400">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={[
            "text-xs font-semibold",
            value > 0
              ? numberClasses[tone]
              : "text-slate-600",
          ].join(" ")}
        >
          {value}
        </span>

        <span className="text-[10px] text-slate-700 transition group-hover:text-slate-400">
          →
        </span>
      </div>
    </Link>
  );
}

function PipelineMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "sky" | "emerald" | "amber" | "rose";
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
      <p className="text-[10px] text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-xl font-semibold",
          tone === "sky"
            ? "text-sky-300"
            : tone === "emerald"
              ? "text-emerald-300"
              : tone === "amber"
                ? "text-amber-300"
                : tone === "rose"
                  ? "text-rose-300"
                  : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-white/[0.14] hover:bg-white/[0.04]"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200 group-hover:text-white">
          {title}
        </p>

        <span className="text-xs text-slate-700 transition group-hover:text-sky-300">
          →
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-slate-600">
        {description}
      </p>
    </Link>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-10 text-center sm:px-6">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-5 text-slate-700">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// STYLE MAPS
// ============================================================

const toneClasses = {
  sky: "bg-sky-400/10 text-sky-300",
  amber: "bg-amber-400/10 text-amber-300",
  emerald: "bg-emerald-400/10 text-emerald-300",
  rose: "bg-rose-400/10 text-rose-300",
};

const dotClasses = {
  sky: "bg-sky-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
};

const numberClasses = {
  sky: "text-sky-300",
  amber: "text-amber-300",
  rose: "text-rose-300",
};