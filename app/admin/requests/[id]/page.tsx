import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import AdminRequestActions from "@/components/admin/AdminRequestActions";
import Step4Operations from "@/components/admin/Step4Operations";
import BookingCreation from "@/components/admin/BookingCreation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminRequestDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  // ---------------------------------------------------------
  // AUTH
  // ---------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Admin request detail profile error:", profileError);
  }

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  // ---------------------------------------------------------
  // MAIN REQUEST
  // ---------------------------------------------------------

  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .select(
      `
      id,
      user_id,
      event_id,
      destination_country,
      destination_city,
      description,
      traveler_count,
      priority,
      status,
      travel_start_date,
      travel_end_date,
      created_at,
      assigned_staff_id
      `,
    )
    .eq("id", id)
    .maybeSingle();

  console.log("ADMIN REQUEST DETAIL:", {
    id,
    found: !!request,
    error: requestError,
  });

  if (requestError) {
    console.error(
      "Admin request detail request query error:",
      requestError,
    );
  }

  if (!request) {
    notFound();
  }

  // ---------------------------------------------------------
  // RELATED DATA
  // ---------------------------------------------------------

  const [
    customerResult,
    servicesResult,
    documentsResult,
    messagesResult,
    notesResult,
    quotesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,full_name,email,phone,organization,profession,country,city",
      )
      .eq("id", request.user_id)
      .maybeSingle(),

    supabase
      .from("request_services")
      .select(
        `
        id,
        status,
        service_id,
        service_catalog (
          id,
          name,
          category
        )
        `,
      )
      .eq("request_id", request.id),

    supabase
      .from("request_documents")
      .select(
        `
        id,
        document_type,
        file_name,
        status,
        required,
        due_date,
        rejection_reason
        `,
      )
      .eq("request_id", request.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("request_messages")
      .select("*")
      .eq("request_id", request.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("request_notes")
      .select("*")
      .eq("request_id", request.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("quotes")
      .select(
        `
        id,
        quote_number,
        status,
        subtotal,
        service_fee,
        discount,
        tax,
        total_amount,
        currency,
        valid_until,
        quote_items (
          id,
          description,
          quantity,
          unit_price,
          total_price
        )
        `,
      )
      .eq("request_id", request.id)
      .order("created_at", { ascending: false }),
  ]);

  // ---------------------------------------------------------
  // DEBUG RELATED QUERY ERRORS
  // ---------------------------------------------------------

  if (customerResult.error) {
    console.error("Customer query error:", customerResult.error);
  }

  if (servicesResult.error) {
    console.error("Services query error:", servicesResult.error);
  }

  if (documentsResult.error) {
    console.error("Documents query error:", documentsResult.error);
  }

  if (messagesResult.error) {
    console.error("Messages query error:", messagesResult.error);
  }

  if (notesResult.error) {
    console.error("Notes query error:", notesResult.error);
  }

  if (quotesResult.error) {
    console.error("Quotes query error:", quotesResult.error);
  }

  // ---------------------------------------------------------
  // NORMALIZE DATA
  // ---------------------------------------------------------

  const customer = customerResult.data;

  const services = (servicesResult.data ?? [])
    .map((item: any) => ({
      id: item.service_catalog?.id ?? item.service_id ?? "",
      name: item.service_catalog?.name ?? "TISA service",
    }))
    .filter((item) => item.id);

  const documents = documentsResult.data ?? [];

  const quotes = (quotesResult.data ?? []).map((quote: any) => ({
    ...quote,
    quote_items: quote.quote_items ?? [],
  }));

  const destination =
    [request.destination_city, request.destination_country]
      .filter(Boolean)
      .join(", ") || "International";

  const travelDates = request.travel_start_date
    ? `${request.travel_start_date}${
        request.travel_end_date
          ? ` → ${request.travel_end_date}`
          : ""
      }`
    : "Not specified";

  const statusLabel = request.status.replaceAll("_", " ");
  const priorityLabel = request.priority.replaceAll("_", " ");

  const statusClass =
    request.status === "completed"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : request.status === "cancelled"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
        : request.status === "processing" ||
            request.status === "confirmed"
          ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
          : "border-white/10 bg-white/[0.04] text-slate-300";

  const priorityClass =
    request.priority === "urgent"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
      : request.priority === "high"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-white/10 bg-white/[0.04] text-slate-400";

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* =====================================================
            TOP NAVIGATION
        ===================================================== */}

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <span>←</span>
            <span>Requests</span>
          </Link>

          <span className="hidden text-xs text-slate-700 sm:block">
            Request workspace
          </span>
        </div>

        {/* =====================================================
            REQUEST HEADER
        ===================================================== */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">

          <div className="p-6 sm:p-7 lg:p-8">

            <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">

              {/* Identity */}
              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-sky-300">
                    Request {request.id.slice(0, 8)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] capitalize ${statusClass}`}
                  >
                    {statusLabel}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] capitalize ${priorityClass}`}
                  >
                    {priorityLabel} priority
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {customer?.full_name || "Customer request"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span>{destination}</span>

                  <span className="hidden text-slate-700 sm:inline">
                    •
                  </span>

                  <span>{request.traveler_count ?? 1} traveler</span>

                  <span className="hidden text-slate-700 sm:inline">
                    •
                  </span>

                  <span>{travelDates}</span>
                </div>
              </div>

              {/* Created */}
              <div className="shrink-0 rounded-2xl border border-white/10 bg-slate-950/30 px-5 py-4 xl:min-w-[210px]">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  Created
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {new Date(request.created_at).toLocaleString()}
                </p>

                <p className="mt-2 text-[11px] text-slate-600">
                  Request ID: {request.id}
                </p>
              </div>
            </div>

            {/* Quick summary */}
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                label="Customer"
                value={customer?.full_name || "—"}
                sub={customer?.email || "No email"}
              />

              <SummaryCard
                label="Destination"
                value={destination}
                sub="Requested destination"
              />

              <SummaryCard
                label="Travel period"
                value={travelDates}
                sub={`${request.traveler_count ?? 1} traveler`}
              />

              <SummaryCard
                label="Requested services"
                value={String(services.length)}
                sub={
                  services.length === 1
                    ? "Service requested"
                    : "Services requested"
                }
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN WORKSPACE
        ===================================================== */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

          {/* ===================================================
              LEFT — WORKSPACE
          =================================================== */}

          <div className="min-w-0 space-y-6">

            {/* -------------------------------------------------
                CUSTOMER REQUEST
            ------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">

              <SectionHeader
                number="01"
                title="Customer request"
                description="Original request information"
              />

              <div className="p-6 sm:p-7">

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <Info
                    label="Customer"
                    value={customer?.full_name || "—"}
                  />

                  <Info
                    label="Email"
                    value={customer?.email || "—"}
                  />

                  <Info
                    label="Phone"
                    value={customer?.phone || "—"}
                  />

                  <Info
                    label="Travelers"
                    value={String(request.traveler_count ?? 1)}
                  />

                  <Info
                    label="Destination"
                    value={destination}
                  />

                  <Info
                    label="Travel dates"
                    value={travelDates}
                  />

                  <Info
                    label="Organization"
                    value={customer?.organization || "—"}
                  />

                  <Info
                    label="Profession"
                    value={customer?.profession || "—"}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-white/5 bg-slate-950/20 p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
                    Customer description
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                    {request.description ||
                      "No description provided."}
                  </p>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------
                REQUESTED SERVICES
            ------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">

              <SectionHeader
                number="02"
                title="Requested services"
                description="Services selected by the customer"
              />

              <div className="p-6 sm:p-7">

                {servicesResult.data?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(servicesResult.data as any[]).map(
                      (item) => (
                        <div
                          key={item.id}
                          className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.035]"
                        >
                          <div className="flex items-start justify-between gap-4">

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">
                                {item.service_catalog?.name ||
                                  "TISA service"}
                              </p>

                              <p className="mt-1 text-xs capitalize text-slate-600">
                                {item.service_catalog?.category ||
                                  "Service"}
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] capitalize text-slate-500">
                              {item.status || "pending"}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No services"
                    description="No services are attached to this request."
                  />
                )}
              </div>
            </section>

            {/* -------------------------------------------------
                DOCUMENTS + QUOTES
            ------------------------------------------------- */}

            <div>
              <Step4Operations
                requestId={request.id}
                documents={documents}
              />
            </div>

            {/* -------------------------------------------------
                BOOKING
            ------------------------------------------------- */}

            <BookingCreation
              requestId={request.id}
              quotes={quotes.map((quote: any) => ({
                id: quote.id,
                quote_number: quote.quote_number,
                status: quote.status,
                total_amount: quote.total_amount,
                currency: quote.currency,
              }))}
            />

            {/* -------------------------------------------------
                CUSTOMER MESSAGES
            ------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">

              <SectionHeader
                title="Customer messages"
                description="Conversation history for this request"
              />

              <div className="p-6 sm:p-7">

                {messagesResult.data?.length ? (
                  <div className="space-y-3">
                    {(messagesResult.data as any[]).map(
                      (message) => (
                        <div
                          key={message.id}
                          className={`rounded-2xl border p-4 ${
                            message.sender_id === user.id
                              ? "border-sky-400/10 bg-sky-400/[0.035]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">

                            <p className="text-xs font-medium text-slate-400">
                              {message.sender_id === user.id
                                ? "You"
                                : "Customer"}
                            </p>

                            <p className="text-[11px] text-slate-600">
                              {message.created_at
                                ? new Date(
                                    message.created_at,
                                  ).toLocaleString()
                                : ""}
                            </p>
                          </div>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {message.message}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No messages yet"
                    description="Customer communication for this request will appear here."
                  />
                )}
              </div>
            </section>

            {/* -------------------------------------------------
                INTERNAL NOTES
            ------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-amber-400/10 bg-amber-400/[0.015]">

              <SectionHeader
                title="Internal notes"
                description="Private operations notes"
              />

              <div className="p-6 sm:p-7">

                {notesResult.data?.length ? (
                  <div className="space-y-3">
                    {(notesResult.data as any[]).map(
                      (note) => (
                        <div
                          key={note.id}
                          className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-4"
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                            {note.note ||
                              note.content ||
                              "—"}
                          </p>

                          {note.created_at && (
                            <p className="mt-3 text-[11px] text-slate-600">
                              {new Date(
                                note.created_at,
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No internal notes"
                    description="Operations notes will appear here."
                  />
                )}
              </div>
            </section>
          </div>

          {/* ===================================================
              RIGHT — OPERATIONS SIDEBAR
          =================================================== */}

          <aside className="xl:sticky xl:top-6 xl:self-start">

            <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-1">

              <div className="rounded-[24px] bg-white/[0.015] p-4">
                <div className="mb-4 px-2 pt-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sky-400">
                    Operations
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Manage this request
                  </p>
                </div>

                <AdminRequestActions
                  requestId={request.id}
                  status={request.status}
                  priority={request.priority}
                  customerName={
                    customer?.full_name || "Customer"
                  }
                />
              </div>
            </div>

            {/* Customer mini profile */}
            <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Customer profile
              </p>

              <p className="mt-3 text-sm font-medium text-white">
                {customer?.full_name || "Unnamed customer"}
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-500">
                <p>{customer?.email || "No email"}</p>

                <p>{customer?.phone || "No phone"}</p>

                {(customer?.city || customer?.country) && (
                  <p>
                    {[customer.city, customer.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}

                {customer?.profession && (
                  <p>{customer.profession}</p>
                )}

                {customer?.organization && (
                  <p>{customer.organization}</p>
                )}
              </div>
            </div>

            {/* Request metadata */}
            <div className="mt-4 rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
                Request metadata
              </p>

              <div className="mt-4 space-y-3">

                <MetaRow
                  label="Status"
                  value={statusLabel}
                />

                <MetaRow
                  label="Priority"
                  value={priorityLabel}
                />

                <MetaRow
                  label="Travelers"
                  value={String(
                    request.traveler_count ?? 1,
                  )}
                />

                <MetaRow
                  label="Assigned"
                  value={
                    request.assigned_staff_id
                      ? "Assigned"
                      : "Unassigned"
                  }
                />

                <MetaRow
                  label="Event"
                  value={
                    request.event_id
                      ? "Event linked"
                      : "No event"
                  }
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

// =============================================================
// UI HELPERS
// =============================================================

function SectionHeader({
  number,
  title,
  description,
}: {
  number?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/10 px-6 py-5 sm:px-7">
      <div className="flex items-start gap-3">

        {number && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-xs font-medium text-sky-300">
            {number}
          </span>
        )}

        <div>
          <h2 className="font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-slate-200">
        {value}
      </p>

      <p className="mt-1 truncate text-[11px] text-slate-600">
        {sub}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-slate-600">
        {label}
      </span>

      <span className="text-right text-xs capitalize text-slate-300">
        {value}
      </span>
    </div>
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
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-9 text-center">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
}