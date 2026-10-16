
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
};

type PageProps = {
    searchParams?: Promise<SearchParams>;
};

type DocumentRow = {
    id: string;
    request_id: string;
    user_id: string;
    document_type: string;
    file_name: string | null;
    storage_path: string | null;
    status: string;
    required: boolean;
    due_date: string | null;
    notes: string | null;
};

type RequestRow = {
    id: string;
    destination_country: string | null;
    destination_city: string | null;
    status: string;
    created_at: string;
};

type ProfileRow = {
    id: string;
    full_name: string | null;
    email: string | null;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
    { value: "", label: "All document statuses" },
    { value: "required", label: "Required" },
    { value: "uploaded", label: "Uploaded" },
    { value: "pending", label: "Pending review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];

function getParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function label(value: string) {
    return value.replaceAll("_", " ");
}

function statusStyle(status: string) {
    switch (status.toLowerCase()) {
        case "approved":
            return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
        case "uploaded":
        case "pending":
            return "border-sky-400/20 bg-sky-400/10 text-sky-300";
        case "rejected":
            return "border-rose-400/20 bg-rose-400/10 text-rose-300";
        case "required":
            return "border-amber-400/20 bg-amber-400/10 text-amber-300";
        default:
            return "border-white/10 bg-white/[0.04] text-slate-400";
    }
}

function formatDate(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default async function AdminDocumentsPage({
    searchParams,
}: PageProps) {
    const supabase = await createClient();

    // Admin authentication
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/account");

    const params = (await searchParams) ?? {};
    const q = getParam(params.q).trim().toLowerCase();
    const selectedStatus = getParam(params.status);
    const requestedPage = Math.max(
        1,
        Number.parseInt(getParam(params.page) || "1", 10) || 1,
    );

    // Load document records
    const { data: documentData, error } = await supabase
        .from("request_documents")
        .select(
            "id, request_id, user_id, document_type, file_name, storage_path, status, required, due_date, notes",
        )
        .order("due_date", { ascending: true, nullsFirst: false });

    if (error) {
        console.error("Admin documents query failed:", error);
    }

    const documents = (documentData ?? []) as DocumentRow[];

    // Load related requests and customer profiles.
    // Separate queries avoid relying on guessed Supabase relationship names.
    const requestIds = [...new Set(documents.map((doc) => doc.request_id))];
    const userIds = [...new Set(documents.map((doc) => doc.user_id))];

    const [requestResult, profileResult] = await Promise.all([
        requestIds.length
            ? supabase
                .from("service_requests")
                .select(
                    "id, destination_country, destination_city, status, created_at",
                )
                .in("id", requestIds)
            : Promise.resolve({ data: [], error: null }),

        userIds.length
            ? supabase
                .from("profiles")
                .select("id, full_name, email")
                .in("id", userIds)
            : Promise.resolve({ data: [], error: null }),
    ]);

    const requestMap = new Map(
        ((requestResult.data ?? []) as RequestRow[]).map((item) => [
            item.id,
            item,
        ]),
    );

    const profileMap = new Map(
        ((profileResult.data ?? []) as ProfileRow[]).map((item) => [
            item.id,
            item,
        ]),
    );

    // Search and filter
    const filteredDocuments = documents.filter((doc) => {
        const customer = profileMap.get(doc.user_id);
        const request = requestMap.get(doc.request_id);

        const matchesStatus =
            !selectedStatus || doc.status === selectedStatus;

        const searchableText = [
            doc.document_type,
            doc.file_name,
            doc.status,
            doc.request_id,
            customer?.full_name,
            customer?.email,
            request?.destination_city,
            request?.destination_country,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return matchesStatus && (!q || searchableText.includes(q));
    });

    const totalDocuments = documents.length;
    const uploadedCount = documents.filter(
        (doc) => Boolean(doc.storage_path || doc.file_name),
    ).length;
    const requiredCount = documents.filter(
        (doc) => doc.status === "required",
    ).length;
    const approvedCount = documents.filter(
        (doc) => doc.status === "approved",
    ).length;
    const rejectedCount = documents.filter(
        (doc) => doc.status === "rejected",
    ).length;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredDocuments.length / PAGE_SIZE),
    );

    const currentPage = Math.min(requestedPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleDocuments = filteredDocuments.slice(
        start,
        start + PAGE_SIZE,
    );

    function pageHref(page: number) {
        const search = new URLSearchParams();

        if (q) search.set("q", q);
        if (selectedStatus) search.set("status", selectedStatus);
        if (page > 1) search.set("page", String(page));

        const query = search.toString();
        return query ? `/admin/documents?${query}` : "/admin/documents";
    }

    return (
        <main className="min-h-screen overflow-x-clip bg-background text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                {/* Header */}
                <header>
                    <Link
                        href="/admin"
                        className="text-sm text-slate-500 transition hover:text-white"
                    >
                        ← Admin dashboard
                    </Link>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400">
                                Operations / Documents
                            </p>

                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Document management
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                Review traveler document requirements and track uploaded
                                files across service requests.
                            </p>
                        </div>

                        <Link
                            href="/admin/requests"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                        >
                            View service requests →
                        </Link>
                    </div>
                </header>

                {/* Summary cards */}
                <section
                    aria-label="Document statistics"
                    className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5"
                >
                    {[
                        {
                            title: "Total documents",
                            value: totalDocuments,
                            color: "text-white",
                        },
                        {
                            title: "Files uploaded",
                            value: uploadedCount,
                            color: "text-sky-300",
                        },
                        {
                            title: "Required",
                            value: requiredCount,
                            color: "text-amber-300",
                        },
                        {
                            title: "Approved",
                            value: approvedCount,
                            color: "text-emerald-300",
                        },
                        {
                            title: "Rejected",
                            value: rejectedCount,
                            color: "text-rose-300",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5"
                        >
                            <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                                {item.title}
                            </p>
                            <p
                                className={`mt-3 text-2xl font-semibold tabular-nums sm:text-3xl ${item.color}`}
                            >
                                {item.value}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Filters */}
                <form
                    action="/admin/documents"
                    method="get"
                    className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto_auto] sm:items-end"
                >
                    <div>
                        <label
                            htmlFor="document-search"
                            className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
                        >
                            Search documents
                        </label>
                        <input
                            id="document-search"
                            name="q"
                            defaultValue={getParam(params.q)}
                            placeholder="Traveler, email, file, request ID..."
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/50"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="document-status"
                            className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500"
                        >
                            Document status
                        </label>
                        <select
                            id="document-status"
                            name="status"
                            defaultValue={selectedStatus}
                            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-sky-400/50"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="h-11 rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                    >
                        Apply filters
                    </button>

                    <Link
                        href="/admin/documents"
                        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                    >
                        Clear
                    </Link>
                </form>

                {/* Document list */}
                <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div className="flex flex-col gap-1 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <h2 className="font-medium text-white">All documents</h2>
                        <p className="text-xs text-slate-500">
                            {filteredDocuments.length
                                ? `${start + 1}–${Math.min(
                                    start + PAGE_SIZE,
                                    filteredDocuments.length,
                                )} of ${filteredDocuments.length} records`
                                : "0 records"}
                        </p>
                    </div>

                    {error ? (
                        <div className="p-8 text-sm text-rose-300">
                            Unable to load documents. Check the request_documents table
                            and its permissions in Supabase.
                        </div>
                    ) : visibleDocuments.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                                <span className="text-xl text-slate-500">↗</span>
                            </div>

                            <h3 className="mt-4 font-medium text-slate-200">
                                No documents found
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Documents requested for service requests will appear here.
                                Try changing your filters or request a document from a
                                service request.
                            </p>

                            <Link
                                href="/admin/requests"
                                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
                            >
                                Open service requests
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {visibleDocuments.map((doc) => {
                                const customer = profileMap.get(doc.user_id);
                                const request = requestMap.get(doc.request_id);
                                const hasFile = Boolean(doc.storage_path || doc.file_name);

                                return (
                                    <article
                                        key={doc.id}
                                        className="p-4 transition hover:bg-white/[0.02] sm:p-6"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.06] text-lg text-sky-300">
                                                {hasFile ? "↗" : "▤"}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <h3 className="break-words font-medium capitalize text-white">
                                                            {label(doc.document_type)}
                                                        </h3>
                                                        <p className="mt-1 break-all text-xs text-slate-500">
                                                            {doc.file_name || "No file uploaded yet"}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs capitalize ${statusStyle(
                                                            doc.status,
                                                        )}`}
                                                    >
                                                        {label(doc.status)}
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                                                    <div>
                                                        <p className="text-xs text-slate-600">
                                                            Traveler
                                                        </p>
                                                        <p className="mt-1 break-words text-slate-300">
                                                            {customer?.full_name || "Unknown traveler"}
                                                        </p>
                                                        {customer?.email && (
                                                            <p className="mt-1 break-all text-xs text-slate-500">
                                                                {customer.email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-600">
                                                            Destination
                                                        </p>
                                                        <p className="mt-1 text-slate-300">
                                                            {[request?.destination_city, request?.destination_country]
                                                                .filter(Boolean)
                                                                .join(", ") || "—"}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-600">
                                                            Due date
                                                        </p>
                                                        <p className="mt-1 text-slate-300">
                                                            {formatDate(doc.due_date)}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs text-slate-600">
                                                            Request status
                                                        </p>
                                                        <p className="mt-1 capitalize text-slate-300">
                                                            {request ? label(request.status) : "Unavailable"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {doc.notes && (
                                                    <p className="mt-4 rounded-xl border border-white/5 bg-black/10 p-3 text-xs leading-5 text-slate-400">
                                                        <span className="font-medium text-slate-300">
                                                            Note:{" "}
                                                        </span>
                                                        {doc.notes}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {doc.required && (
                                                            <span className="rounded-full border border-amber-400/15 bg-amber-400/[0.05] px-2.5 py-1 text-[11px] text-amber-300">
                                                                Required document
                                                            </span>
                                                        )}

                                                        <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-slate-500">
                                                            {doc.request_id.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        href={`/admin/requests/${doc.request_id}`}
                                                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-300 transition hover:border-sky-400/30 hover:bg-sky-400/[0.05] hover:text-sky-300"
                                                    >
                                                        Open request →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                {filteredDocuments.length > PAGE_SIZE && (
                    <nav
                        aria-label="Document pagination"
                        className="mt-5 flex flex-wrap items-center justify-between gap-3"
                    >
                        <p className="text-sm text-slate-500">
                            Page {currentPage} of {totalPages}
                        </p>

                        <div className="flex gap-2">
                            <Link
                                href={pageHref(Math.max(1, currentPage - 1))}
                                aria-disabled={currentPage <= 1}
                                className={`rounded-xl border px-4 py-2 text-sm ${currentPage <= 1
                                        ? "pointer-events-none border-white/5 text-slate-700"
                                        : "border-white/10 text-slate-300 hover:bg-white/[0.04]"
                                    }`}
                            >
                                Previous
                            </Link>

                            <Link
                                href={pageHref(Math.min(totalPages, currentPage + 1))}
                                aria-disabled={currentPage >= totalPages}
                                className={`rounded-xl border px-4 py-2 text-sm ${currentPage >= totalPages
                                        ? "pointer-events-none border-white/5 text-slate-700"
                                        : "border-white/10 text-slate-300 hover:bg-white/[0.04]"
                                    }`}
                            >
                                Next
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </main>
    );
}
