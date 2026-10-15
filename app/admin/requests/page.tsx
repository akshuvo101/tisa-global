import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  priority?: string | string[];
  service?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type ServiceOption = {
  id: string;
  name: string;
};

type ServiceRelation = {
  service_id?: string;
  service_catalog?:
    | {
        id?: string;
        name?: string;
      }
    | {
        id?: string;
        name?: string;
      }[]
    | null;
};

type RequestRow = {
  id: string;
  user_id: string;
  assigned_staff_id: string | null;
  destination_country: string | null;
  destination_city: string | null;
  priority: string;
  status: string;
  created_at: string;
  traveler_count: number;
  profiles?:
    | {
        full_name: string | null;
        email: string | null;
      }
    | {
        full_name: string | null;
        email: string | null;
      }[]
    | null;
  request_services?: ServiceRelation[] | null;
};

type StaffProfile = {
  id: string;
  full_name: string | null;
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "reviewing", label: "Reviewing" },
  { value: "need_documents", label: "Need documents" },
  { value: "documents_received", label: "Documents received" },
  { value: "quoted", label: "Quoted" },
  { value: "quote_accepted", label: "Quote accepted" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
  { value: "cancelled", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "", label: "All priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
];

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "requested":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "reviewing":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";

    case "need_documents":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "documents_received":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "quoted":
      return "border-indigo-400/20 bg-indigo-400/10 text-indigo-300";

    case "quote_accepted":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "processing":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "confirmed":
      return "border-green-400/20 bg-green-400/10 text-green-300";

    case "completed":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "on_hold":
      return "border-slate-400/20 bg-slate-400/10 text-slate-300";

    case "cancelled":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-400";
  }
}

function priorityClasses(priority: string) {
  switch (priority) {
    case "urgent":
      return "text-rose-300";

    case "high":
      return "text-amber-300";

    default:
      return "text-slate-400";
  }
}

function getCustomer(
  profiles: RequestRow["profiles"],
): { full_name: string | null; email: string | null } {
  if (Array.isArray(profiles)) {
    return profiles[0] ?? { full_name: null, email: null };
  }

  return profiles ?? { full_name: null, email: null };
}

function getServiceNames(requestServices: RequestRow["request_services"]) {
  if (!Array.isArray(requestServices)) return [];

  return requestServices
    .map((item) => {
      const service = Array.isArray(item.service_catalog)
        ? item.service_catalog[0]
        : item.service_catalog;

      return service?.name;
    })
    .filter((name): name is string => Boolean(name));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminRequestsPage({
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

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  // ------------------------------------------------------------
  // URL PARAMS
  // ------------------------------------------------------------

  const params = (await searchParams) ?? {};

  const q = getParam(params.q).trim();
  const status = getParam(params.status);
  const priority = getParam(params.priority);
  const serviceId = getParam(params.service);

  const requestedPage = Math.max(
    1,
    Number.parseInt(getParam(params.page) || "1", 10) || 1,
  );

  const requestedPageSize = Number.parseInt(
    getParam(params.pageSize) || "10",
    10,
  );

  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedPageSize)
    ? requestedPageSize
    : 10;

  // ------------------------------------------------------------
  // SERVICE OPTIONS
  // ------------------------------------------------------------

  const { data: serviceOptionsData } = await supabase
    .from("service_catalog")
    .select("id, name")
    .order("name", { ascending: true });

  const serviceOptions: ServiceOption[] = serviceOptionsData ?? [];

  // ------------------------------------------------------------
  // SEARCH
  //
  // Search supports:
  // - customer name
  // - customer email
  // - destination city
  // - destination country
  // - exact full request UUID
  // ------------------------------------------------------------

  let searchRequestIds: string[] | null = null;

  if (q) {
    const [nameMatches, emailMatches, cityMatches, countryMatches] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id")
          .ilike("full_name", `%${q}%`)
          .limit(200),

        supabase
          .from("profiles")
          .select("id")
          .ilike("email", `%${q}%`)
          .limit(200),

        supabase
          .from("service_requests")
          .select("id")
          .ilike("destination_city", `%${q}%`)
          .limit(500),

        supabase
          .from("service_requests")
          .select("id")
          .ilike("destination_country", `%${q}%`)
          .limit(500),
      ]);

    const profileIds = [
      ...(nameMatches.data ?? []).map((item) => item.id),
      ...(emailMatches.data ?? []).map((item) => item.id),
    ];

    const matchedIds = new Set<string>();

    if (profileIds.length > 0) {
      const { data: profileRequests } = await supabase
        .from("service_requests")
        .select("id")
        .in("user_id", profileIds)
        .limit(500);

      for (const item of profileRequests ?? []) {
        matchedIds.add(item.id);
      }
    }

    for (const item of cityMatches.data ?? []) {
      matchedIds.add(item.id);
    }

    for (const item of countryMatches.data ?? []) {
      matchedIds.add(item.id);
    }

    // Exact UUID search.
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(q)) {
      const { data: exactRequest } = await supabase
        .from("service_requests")
        .select("id")
        .eq("id", q)
        .maybeSingle();

      if (exactRequest?.id) {
        matchedIds.add(exactRequest.id);
      }
    }

    searchRequestIds = Array.from(matchedIds);
  }

  // ------------------------------------------------------------
  // MAIN REQUEST QUERY
  // ------------------------------------------------------------

  const requestSelect = serviceId
    ? `
        id,
        user_id,
        assigned_staff_id,
        destination_country,
        destination_city,
        priority,
        status,
        created_at,
        traveler_count,
        profiles!service_requests_user_id_fkey(
          full_name,
          email
        ),
        request_services!inner(
          service_id,
          service_catalog(
            id,
            name
          )
        )
      `
    : `
        id,
        user_id,
        assigned_staff_id,
        destination_country,
        destination_city,
        priority,
        status,
        created_at,
        traveler_count,
        profiles!service_requests_user_id_fkey(
          full_name,
          email
        ),
        request_services(
          service_id,
          service_catalog(
            id,
            name
          )
        )
      `;

  let requestsQuery = supabase
    .from("service_requests")
    .select(requestSelect, { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) {
    requestsQuery = requestsQuery.eq("status", status);
  }

  if (priority) {
    requestsQuery = requestsQuery.eq("priority", priority);
  }

  if (serviceId) {
    requestsQuery = requestsQuery.eq(
      "request_services.service_id",
      serviceId,
    );
  }

  if (searchRequestIds) {
    if (searchRequestIds.length > 0) {
      requestsQuery = requestsQuery.in("id", searchRequestIds);
    } else {
      // Force zero results when a search produced no matches.
      requestsQuery = requestsQuery.in("id", [
        "00000000-0000-0000-0000-000000000000",
      ]);
    }
  }

  const from = (requestedPage - 1) * pageSize;
  const to = from + pageSize - 1;

  requestsQuery = requestsQuery.range(from, to);

  // ------------------------------------------------------------
  // SUMMARY COUNTS
  // ------------------------------------------------------------

  const countStatus = async (value: string) => {
    const { count } = await supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", value);

    return count ?? 0;
  };

  const countPriority = async (value: string) => {
    const { count } = await supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("priority", value);

    return count ?? 0;
  };

  const [
    requestResult,
    requestedCount,
    reviewingCount,
    needDocumentsCount,
    quotedCount,
    processingCount,
    completedCount,
    urgentCount,
  ] = await Promise.all([
    requestsQuery,
    countStatus("requested"),
    countStatus("reviewing"),
    countStatus("need_documents"),
    countStatus("quoted"),
    countStatus("processing"),
    countStatus("completed"),
    countPriority("urgent"),
  ]);

  const requests = (requestResult.data ?? []) as RequestRow[];
  const totalCount = requestResult.count ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Keep invalid page numbers from leaving the user on an empty page.
  if (requests.length === 0 && totalCount > 0 && requestedPage > totalPages) {
    redirect(`/admin/requests?page=${totalPages}&pageSize=${pageSize}`);
  }

  // ------------------------------------------------------------
  // QUOTE ATTENTION
  // ------------------------------------------------------------

  const requestIds = requests.map((request) => request.id);

  const quoteChangesRequestIds = new Set<string>();

  if (requestIds.length > 0) {
    const { data: quoteChanges, error: quoteChangesError } = await supabase
      .from("quotes")
      .select("request_id")
      .in("request_id", requestIds)
      .eq("status", "changes_requested");

    if (quoteChangesError) {
      console.error(
        "Quote attention query error:",
        quoteChangesError,
      );
    }

    for (const quote of quoteChanges ?? []) {
      quoteChangesRequestIds.add(quote.request_id);
    }
  }

  // ------------------------------------------------------------
  // ASSIGNED STAFF
  // ------------------------------------------------------------

  const assignedStaffIds = Array.from(
    new Set(
      requests
        .map((request) => request.assigned_staff_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const staffMap = new Map<string, string>();

  if (assignedStaffIds.length > 0) {
    const { data: staffProfiles, error: staffError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assignedStaffIds);

    if (staffError) {
      console.error("Assigned staff query error:", staffError);
    }

    for (const staff of (staffProfiles ?? []) as StaffProfile[]) {
      staffMap.set(staff.id, staff.full_name || "Staff");
    }
  }

  // ------------------------------------------------------------
  // URL BUILDER
  // ------------------------------------------------------------

  const buildHref = (
    overrides: Partial<{
      q: string;
      status: string;
      priority: string;
      service: string;
      page: number;
      pageSize: number;
    }> = {},
  ) => {
    const next = {
      q,
      status,
      priority,
      service: serviceId,
      page: requestedPage,
      pageSize,
      ...overrides,
    };

    const search = new URLSearchParams();

    if (next.q) search.set("q", next.q);
    if (next.status) search.set("status", next.status);
    if (next.priority) search.set("priority", next.priority);
    if (next.service) search.set("service", next.service);

    if (next.page && next.page > 1) {
      search.set("page", String(next.page));
    }

    if (next.pageSize && next.pageSize !== 10) {
      search.set("pageSize", String(next.pageSize));
    }

    const queryString = search.toString();

    return queryString
      ? `/admin/requests?${queryString}`
      : "/admin/requests";
  };

  // ------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------

  const pageNumbers: number[] = [];

  if (totalPages <= 7) {
    for (let index = 1; index <= totalPages; index += 1) {
      pageNumbers.push(index);
    }
  } else {
    pageNumbers.push(1);

    if (requestedPage > 3) {
      pageNumbers.push(-1);
    }

    for (
      let index = Math.max(2, requestedPage - 1);
      index <= Math.min(totalPages - 1, requestedPage + 1);
      index += 1
    ) {
      pageNumbers.push(index);
    }

    if (requestedPage < totalPages - 2) {
      pageNumbers.push(-1);
    }

    pageNumbers.push(totalPages);
  }

  const rangeStart = totalCount === 0 ? 0 : from + 1;
  const rangeEnd = Math.min(from + requests.length, totalCount);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div>
          <Link
            href="/admin"
            className="text-sm text-slate-500 transition hover:text-white"
          >
            ← Admin dashboard
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
              Operations
            </p>

            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                  Service requests
                </h1>

                <p className="mt-3 max-w-2xl text-slate-400">
                  Review, assign, communicate, and move customer requests
                  through the TISA Global workflow.
                </p>
              </div>

              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-300">
                  {totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <Link
            href={buildHref({
              status: "",
              priority: "",
              page: 1,
            })}
            className={`rounded-2xl border p-4 transition ${
              !status && !priority
                ? "border-sky-400/30 bg-sky-400/10"
                : "border-white/10 bg-white/[0.025] hover:bg-white/[0.04]"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              All
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {totalCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "requested",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              New
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {requestedCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "reviewing",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Reviewing
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {reviewingCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "need_documents",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Documents
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {needDocumentsCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "quoted",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Quoted
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {quotedCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "processing",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Processing
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {processingCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "completed",
              priority: "",
              page: 1,
            })}
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:bg-white/[0.04]"
          >
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Completed
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {completedCount}
            </p>
          </Link>

          <Link
            href={buildHref({
              status: "",
              priority: "urgent",
              page: 1,
            })}
            className={`rounded-2xl border p-4 transition ${
              priority === "urgent"
                ? "border-rose-400/30 bg-rose-400/10"
                : "border-rose-400/10 bg-rose-400/[0.04] hover:bg-rose-400/[0.08]"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-rose-300/70">
              Urgent
            </p>
            <p className="mt-2 text-2xl font-semibold text-rose-300">
              {urgentCount}
            </p>
          </Link>
        </div>

        {/* Filters */}
        <form
          action="/admin/requests"
          method="get"
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1.6fr)_1fr_1fr_1fr_auto_auto]">
            {/* Search */}
            <div>
              <label
                htmlFor="request-search"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Search
              </label>

              <input
                id="request-search"
                name="q"
                defaultValue={q}
                placeholder="Customer, email, destination, request ID..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Status
              </label>

              <select
                id="status-filter"
                name="status"
                defaultValue={status}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-sky-400/40"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value || "all"}
                    value={option.value}
                    className="bg-slate-950"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="priority-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Priority
              </label>

              <select
                id="priority-filter"
                name="priority"
                defaultValue={priority}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-sky-400/40"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option
                    key={option.value || "all"}
                    value={option.value}
                    className="bg-slate-950"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <label
                htmlFor="service-filter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Service
              </label>

              <select
                id="service-filter"
                name="service"
                defaultValue={serviceId}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-sky-400/40"
              >
                <option value="" className="bg-slate-950">
                  All services
                </option>

                {serviceOptions.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                    className="bg-slate-950"
                  >
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Page size */}
            <div>
              <label
                htmlFor="page-size"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
              >
                Per page
              </label>

              <select
                id="page-size"
                name="pageSize"
                defaultValue={String(pageSize)}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-sky-400/40"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option
                    key={size}
                    value={size}
                    className="bg-slate-950"
                  >
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Apply */}
            <div className="flex items-end">
              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Apply
              </button>
            </div>

            {/* Clear */}
            <div className="flex items-end">
              <Link
                href="/admin/requests"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                Clear
              </Link>
            </div>
          </div>

          {q && (
            <p className="mt-3 text-xs text-slate-600">
              Request ID search supports the full UUID.
            </p>
          )}
        </form>

        {/* Request table */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          {/* Table header */}
          <div className="hidden grid-cols-[1.25fr_1.05fr_1.15fr_.7fr_.95fr_1fr_.8fr] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-wider text-slate-600 xl:grid">
            <span>Customer</span>
            <span>Destination</span>
            <span>Service</span>
            <span>Priority</span>
            <span>Status</span>
            <span>Attention</span>
            <span>Created</span>
          </div>

          {requestResult.error && (
            <div className="border-b border-rose-400/10 bg-rose-400/[0.04] px-6 py-4 text-sm text-rose-300">
              Unable to load service requests.
            </div>
          )}

          {/* Rows */}
          {requests.map((request) => {
            const customer = getCustomer(request.profiles);
            const serviceNames = getServiceNames(request.request_services);

            const staffName = request.assigned_staff_id
              ? staffMap.get(request.assigned_staff_id) || "Assigned staff"
              : null;

            const hasQuoteChanges = quoteChangesRequestIds.has(request.id);

            const needsAttention =
              request.priority === "urgent" ||
              request.priority === "high" ||
              request.status === "need_documents" ||
              hasQuoteChanges ||
              !request.assigned_staff_id;

            return (
              <Link
                key={request.id}
                href={`/admin/requests/${request.id}`}
                className="block border-b border-white/5 px-5 py-5 transition last:border-b-0 hover:bg-white/[0.035] sm:px-6"
              >
                <div className="grid gap-4 xl:grid-cols-[1.25fr_1.05fr_1.15fr_.7fr_.95fr_1fr_.8fr] xl:items-center">
                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {customer.full_name || "Customer"}
                    </p>

                    {customer.email && (
                      <p className="mt-1 truncate text-xs text-slate-600">
                        {customer.email}
                      </p>
                    )}

                    <p className="mt-1 font-mono text-[11px] text-slate-700">
                      {request.id}
                    </p>
                  </div>

                  {/* Destination */}
                  <div>
                    <p className="text-sm text-slate-300">
                      {request.destination_city || "—"}
                      {request.destination_country
                        ? `, ${request.destination_country}`
                        : ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {request.traveler_count}{" "}
                      {request.traveler_count === 1
                        ? "traveler"
                        : "travelers"}
                    </p>
                  </div>

                  {/* Service */}
                  <div className="min-w-0">
                    {serviceNames.length > 0 ? (
                      <>
                        <p className="truncate text-sm text-slate-300">
                          {serviceNames[0]}
                        </p>

                        {serviceNames.length > 1 && (
                          <p className="mt-1 text-xs text-slate-600">
                            +{serviceNames.length - 1} more service
                            {serviceNames.length - 1 === 1 ? "" : "s"}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-600">
                        No service
                      </span>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <span
                      className={`text-sm font-medium capitalize ${priorityClasses(
                        request.priority,
                      )}`}
                    >
                      {request.priority}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs capitalize ${statusClasses(
                        request.status,
                      )}`}
                    >
                      {statusLabel(request.status)}
                    </span>
                  </div>

                  {/* Attention */}
                  <div className="flex flex-wrap gap-1.5">
                    {!request.assigned_staff_id && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-medium text-amber-300">
                        Unassigned
                      </span>
                    )}

                    {request.status === "need_documents" && (
                      <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-1 text-[10px] font-medium text-orange-300">
                        Documents
                      </span>
                    )}

                    {hasQuoteChanges && (
                      <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[10px] font-medium text-violet-300">
                        Quote changes
                      </span>
                    )}

                    {request.priority === "urgent" && (
                      <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-1 text-[10px] font-medium text-rose-300">
                        Urgent
                      </span>
                    )}

                    {!needsAttention && (
                      <span className="text-xs text-slate-700">—</span>
                    )}
                  </div>

                  {/* Created */}
                  <div>
                    <p className="text-sm text-slate-400">
                      {formatDate(request.created_at)}
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {staffName || "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Mobile operational summary */}
                <div className="mt-4 flex flex-wrap items-center gap-2 xl:hidden">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs capitalize ${statusClasses(
                      request.status,
                    )}`}
                  >
                    {statusLabel(request.status)}
                  </span>

                  <span
                    className={`text-xs font-medium capitalize ${priorityClasses(
                      request.priority,
                    )}`}
                  >
                    {request.priority}
                  </span>

                  <span className="text-xs text-slate-600">
                    {staffName || "Unassigned"}
                  </span>

                  <span className="ml-auto text-xs text-slate-600">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Empty state */}
          {!requests.length && !requestResult.error && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-xl text-slate-600">
                —
              </div>

              <h2 className="mt-4 text-sm font-medium text-slate-300">
                No service requests found
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Try changing your search or filters.
              </p>

              {(q || status || priority || serviceId) && (
                <Link
                  href="/admin/requests"
                  className="mt-5 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Page{" "}
              <span className="text-slate-300">{requestedPage}</span> of{" "}
              <span className="text-slate-300">{totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildHref({
                  page: Math.max(1, requestedPage - 1),
                })}
                aria-disabled={requestedPage <= 1}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  requestedPage <= 1
                    ? "pointer-events-none border-white/5 text-slate-700"
                    : "border-white/10 text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                ← Previous
              </Link>

              <div className="flex items-center gap-1">
                {pageNumbers.map((pageNumber, index) => {
                  if (pageNumber === -1) {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-sm text-slate-700"
                      >
                        …
                      </span>
                    );
                  }

                  const active = pageNumber === requestedPage;

                  return (
                    <Link
                      key={pageNumber}
                      href={buildHref({
                        page: pageNumber,
                      })}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition ${
                        active
                          ? "bg-sky-400 text-slate-950"
                          : "border border-white/10 text-slate-500 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={buildHref({
                  page: Math.min(totalPages, requestedPage + 1),
                })}
                aria-disabled={requestedPage >= totalPages}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  requestedPage >= totalPages
                    ? "pointer-events-none border-white/5 text-slate-700"
                    : "border-white/10 text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                Next →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}