import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import QuoteActions from "@/components/admin/QuoteActions";

type QuoteStatus =
    | "draft"
    | "sent"
    | "accepted"
    | "changes_requested"
    | "expired"
    | "cancelled";

type Quote = {
    id: string;
    quote_number: string;
    request_id: string;
    status: QuoteStatus;
    currency: string;
    subtotal: number;
    service_fee: number;
    discount: number;
    tax: number;
    total_amount: number;
    valid_until: string | null;
    created_at: string;
    updated_at: string | null;
};

type QuoteItem = {
    id: string;
    quote_id: string;
    service_id: string | null;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
};

type Request = {
    id: string;
    destination_country: string | null;
    destination_city: string | null;
    travel_start_date: string | null;
    travel_end_date: string | null;
    traveler_count: number | null;
    priority: string | null;
    status: string | null;
};

type Customer = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
};

type Service = {
    id: string;
    name: string;
    slug: string | null;
};

type QuoteItemWithService = QuoteItem & {
    service: Service | null;
};

const statusStyles: Record<QuoteStatus, string> = {
    draft:
        "border-slate-400/20 bg-slate-400/10 text-slate-300",
    sent:
        "border-sky-400/20 bg-sky-400/10 text-sky-300",
    accepted:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    changes_requested:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",
    expired:
        "border-orange-400/20 bg-orange-400/10 text-orange-300",
    cancelled:
        "border-red-400/20 bg-red-400/10 text-red-300",
};

const requestStatusStyles: Record<string, string> = {
    requested:
        "border-slate-400/20 bg-slate-400/10 text-slate-300",
    reviewing:
        "border-sky-400/20 bg-sky-400/10 text-sky-300",
    need_documents:
        "border-amber-400/20 bg-amber-400/10 text-amber-300",
    documents_received:
        "border-violet-400/20 bg-violet-400/10 text-violet-300",
    quoted:
        "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    quote_accepted:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    processing:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    confirmed:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    completed:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    on_hold:
        "border-orange-400/20 bg-orange-400/10 text-orange-300",
    cancelled:
        "border-red-400/20 bg-red-400/10 text-red-300",
};

function formatMoney(
    amount: number | null | undefined,
    currency: string,
) {
    const value = Number(amount ?? 0);

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

function formatStatus(value: string | null | undefined) {
    if (!value) return "Unknown";

    return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function destinationLabel(request: Request) {
    const parts = [
        request.destination_city,
        request.destination_country,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : "International travel";
}

async function getQuote(id: string) {
    const supabase = await createClient();

    const {
        data: {
            user,
        },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(
            `/login?redirect=${encodeURIComponent(`/admin/quotes/${id}`)}`,
        );
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
        console.error("Admin quote detail profile lookup failed:", profileError);
        throw new Error("Unable to verify access to this quote.");
    }

    if (!profile || profile.role !== "admin") {
        redirect("/account");
    }

    const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select(
            `
        id,
        quote_number,
        request_id,
        status,
        currency,
        subtotal,
        service_fee,
        discount,
        tax,
        total_amount,
        valid_until,
        created_at,
        updated_at
      `,
        )
        .eq("id", id)
        .maybeSingle();

    if (quoteError) {
        console.error("Admin quote detail quote lookup failed:", quoteError);
        throw new Error("Unable to load this quote.");
    }

    if (!quote) {
        return null;
    }

    const { data: request, error: requestError } = await supabase
        .from("service_requests")
        .select(
            `
        id,
        destination_country,
        destination_city,
        travel_start_date,
        travel_end_date,
        traveler_count,
        priority,
        status,
        user_id
      `,
        )
        .eq("id", quote.request_id)
        .maybeSingle();

    if (requestError) {
        console.error(
            "Admin quote detail request lookup failed:",
            requestError,
        );
        throw new Error("Unable to load the request for this quote.");
    }

    if (!request) {
        return null;
    }

    const { data: customer, error: customerError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("id", request.user_id)
        .maybeSingle();

    if (customerError) {
        console.error(
            "Admin quote detail customer lookup failed:",
            customerError,
        );
        throw new Error("Unable to load the customer for this quote.");
    }

    const { data: rawItems, error: itemsError } = await supabase
        .from("quote_items")
        .select(
            `
        id,
        quote_id,
        service_id,
        description,
        quantity,
        unit_price,
        total_price
      `,
        )
        .eq("quote_id", quote.id)
        .order("created_at", {
            ascending: true,
        });

    if (itemsError) {
        console.error("Admin quote detail items lookup failed:", itemsError);
        throw new Error("Unable to load the items for this quote.");
    }

    const items = rawItems ?? [];

    const serviceIds = Array.from(
        new Set(
            items
                .map((item) => item.service_id)
                .filter(Boolean),
        ),
    );

    let services: Service[] = [];

    if (serviceIds.length) {
        const { data, error: servicesError } = await supabase
            .from("service_catalog")
            .select("id, name, slug")
            .in("id", serviceIds);

        if (servicesError) {
            console.error(
                "Admin quote detail services lookup failed:",
                servicesError,
            );
            throw new Error("Unable to load services for this quote.");
        }

        services = data ?? [];
    }

    const serviceMap = new Map(
        services.map((service) => [
            service.id,
            service,
        ]),
    );

    const quoteItems: QuoteItemWithService[] = items.map(
        (item) => ({
            ...item,
            service: item.service_id
                ? serviceMap.get(item.service_id) ?? null
                : null,
        }),
    );

    return {
        quote: quote as Quote,
        request: request as Request & {
            user_id: string;
        },
        customer: (customer ?? null) as Customer | null,
        items: quoteItems,
    };
}

export default async function AdminQuoteDetailPage({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;

    const data = await getQuote(id);

    if (!data) {
        notFound();
    }

    const {
        quote,
        request,
        customer,
        items,
    } = data;

    const canSend =
        quote.status === "draft" ||
        quote.status === "changes_requested";

    const canCancel =
        quote.status !== "accepted" &&
        quote.status !== "cancelled";

    const isAccepted = quote.status === "accepted";
    const isChangesRequested =
        quote.status === "changes_requested";

    return (
        <main className="min-w-0 w-full overflow-hidden">
            <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                    <div className="border-b border-white/10 p-6 lg:p-7">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href="/admin/quotes"
                                        className="text-xs text-slate-500 transition hover:text-slate-300"
                                    >
                                        Quotes
                                    </Link>

                                    <span className="text-slate-700">
                                        /
                                    </span>

                                    <span className="text-xs text-slate-500">
                                        {quote.quote_number}
                                    </span>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                        {quote.quote_number}
                                    </h1>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs capitalize ${statusStyles[quote.status]
                                            }`}
                                    >
                                        {formatStatus(quote.status)}
                                    </span>
                                </div>

                                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                                    Quote for{" "}
                                    <span className="text-slate-300">
                                        {customer?.full_name ||
                                            customer?.email ||
                                            "Customer"}
                                    </span>{" "}
                                    · {destinationLabel(request)}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-end gap-2">
                                <Link
                                    href={`/admin/requests/${request.id}`}
                                    className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-medium text-slate-300 transition hover:bg-white/5"
                                >
                                    Open request
                                </Link>

                                <QuoteActions
                                    quoteId={quote.id}
                                    canSend={canSend}
                                    canCancel={canCancel}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status strip */}
                    <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            label="Quote total"
                            value={formatMoney(
                                quote.total_amount,
                                quote.currency,
                            )}
                        />

                        <Metric
                            label="Valid until"
                            value={formatDate(quote.valid_until)}
                        />

                        <Metric
                            label="Created"
                            value={formatDate(quote.created_at)}
                        />

                        <Metric
                            label="Request status"
                            value={formatStatus(request.status)}
                        />
                    </div>
                </section>

                {/* Workflow notices */}
                {isAccepted && (
                    <Notice
                        tone="success"
                        title="Quote accepted"
                        description="The customer has accepted this quote. Booking creation remains a separate operations step."
                    />
                )}

                {isChangesRequested && (
                    <Notice
                        tone="warning"
                        title="Customer requested changes"
                        description="Review the request and revise this quote before sending it again."
                    />
                )}

                {quote.status === "sent" && (
                    <Notice
                        tone="info"
                        title="Quote sent"
                        description="The customer can now review the quote and either accept it or request changes."
                    />
                )}

                {/* Main layout */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    {/* Main content */}
                    <div className="min-w-0 space-y-6">
                        {/* Quote items */}
                        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                            <div className="border-b border-white/10 px-6 py-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                            Fulfillment pricing
                                        </p>

                                        <h2 className="mt-1 text-lg font-semibold text-white">
                                            Quote items
                                        </h2>
                                    </div>

                                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-500">
                                        {items.length}{" "}
                                        {items.length === 1
                                            ? "item"
                                            : "items"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                {items.length ? (
                                    <>
                                        {/* Desktop */}
                                        <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
                                            <div className="grid grid-cols-[minmax(0,1fr)_90px_140px_150px] border-b border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                                                <span>Description</span>
                                                <span className="text-right">
                                                    Qty
                                                </span>
                                                <span className="text-right">
                                                    Unit price
                                                </span>
                                                <span className="text-right">
                                                    Total
                                                </span>
                                            </div>

                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="grid grid-cols-[minmax(0,1fr)_90px_140px_150px] items-center border-b border-white/5 px-4 py-4 last:border-b-0"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-white">
                                                            {item.description ||
                                                                item.service?.name ||
                                                                "Service"}
                                                        </p>

                                                        {item.service?.name &&
                                                            item.description !==
                                                            item.service.name && (
                                                                <p className="mt-1 text-xs text-slate-600">
                                                                    {item.service.name}
                                                                </p>
                                                            )}
                                                    </div>

                                                    <p className="text-right text-sm text-slate-400">
                                                        {item.quantity}
                                                    </p>

                                                    <p className="text-right text-sm text-slate-400">
                                                        {formatMoney(
                                                            item.unit_price,
                                                            quote.currency,
                                                        )}
                                                    </p>

                                                    <p className="text-right text-sm font-medium text-white">
                                                        {formatMoney(
                                                            item.total_price,
                                                            quote.currency,
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mobile */}
                                        <div className="space-y-3 md:hidden">
                                            {items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white">
                                                                {item.description ||
                                                                    item.service?.name ||
                                                                    "Service"}
                                                            </p>

                                                            {item.service?.name &&
                                                                item.description !==
                                                                item.service.name && (
                                                                    <p className="mt-1 text-xs text-slate-600">
                                                                        {item.service.name}
                                                                    </p>
                                                                )}
                                                        </div>

                                                        <p className="shrink-0 text-sm font-semibold text-white">
                                                            {formatMoney(
                                                                item.total_price,
                                                                quote.currency,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
                                                        <InfoPair
                                                            label="Quantity"
                                                            value={String(
                                                                item.quantity,
                                                            )}
                                                        />

                                                        <InfoPair
                                                            label="Unit price"
                                                            value={formatMoney(
                                                                item.unit_price,
                                                                quote.currency,
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <EmptyState
                                        title="No quote items"
                                        description="This quote does not contain any line items yet."
                                    />
                                )}
                            </div>
                        </section>

                        {/* Pricing */}
                        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                            <div className="border-b border-white/10 px-6 py-5">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                    Financial summary
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-white">
                                    Pricing
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="ml-auto w-full max-w-md space-y-3">
                                    <PriceRow
                                        label="Subtotal"
                                        value={formatMoney(
                                            quote.subtotal,
                                            quote.currency,
                                        )}
                                    />

                                    <PriceRow
                                        label="Service fee"
                                        value={formatMoney(
                                            quote.service_fee,
                                            quote.currency,
                                        )}
                                    />

                                    <PriceRow
                                        label="Discount"
                                        value={`− ${formatMoney(
                                            quote.discount,
                                            quote.currency,
                                        )}`}
                                        muted
                                    />

                                    <PriceRow
                                        label="Tax"
                                        value={formatMoney(
                                            quote.tax,
                                            quote.currency,
                                        )}
                                    />

                                    <div className="my-4 border-t border-white/10" />

                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-slate-400">
                                                Total
                                            </p>

                                            <p className="mt-1 text-xs text-slate-600">
                                                {quote.currency}
                                            </p>
                                        </div>

                                        <p className="text-2xl font-semibold tracking-tight text-white">
                                            {formatMoney(
                                                quote.total_amount,
                                                quote.currency,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Workflow */}
                        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
                            <div className="border-b border-white/10 px-6 py-5">
                                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                    Operations workflow
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-white">
                                    Quote lifecycle
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-3 sm:grid-cols-5">
                                    <WorkflowStep
                                        number="01"
                                        title="Draft"
                                        active={
                                            quote.status === "draft"
                                        }
                                        complete={[
                                            "sent",
                                            "accepted",
                                        ].includes(quote.status)}
                                    />

                                    <WorkflowStep
                                        number="02"
                                        title="Sent"
                                        active={
                                            quote.status === "sent"
                                        }
                                        complete={
                                            quote.status === "accepted"
                                        }
                                    />

                                    <WorkflowStep
                                        number="03"
                                        title="Customer review"
                                        active={
                                            quote.status ===
                                            "sent"
                                        }
                                        complete={
                                            quote.status ===
                                            "accepted"
                                        }
                                    />

                                    <WorkflowStep
                                        number="04"
                                        title="Accepted"
                                        active={
                                            quote.status ===
                                            "accepted"
                                        }
                                        complete={
                                            quote.status ===
                                            "accepted"
                                        }
                                    />

                                    <WorkflowStep
                                        number="05"
                                        title="Booking"
                                        active={false}
                                        complete={false}
                                        muted
                                    />
                                </div>

                                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                    <p className="text-xs font-medium text-slate-300">
                                        Booking is separate
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        Customer acceptance does not automatically
                                        create a booking. Operations must create and
                                        manage the booking separately.
                                    </p>

                                    {isAccepted && (
                                        <Link
                                            href={`/admin/requests/${request.id}`}
                                            className="mt-3 inline-flex text-xs font-medium text-sky-300 transition hover:text-sky-200"
                                        >
                                            Open request to create booking →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="min-w-0 space-y-6">
                        {/* Customer */}
                        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                Customer
                            </p>

                            <div className="mt-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-400/10 text-sm font-semibold text-sky-300">
                                    {(
                                        customer?.full_name ||
                                        customer?.email ||
                                        "C"
                                    )
                                        .slice(0, 1)
                                        .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-white">
                                        {customer?.full_name ||
                                            "Customer"}
                                    </p>

                                    <p className="truncate text-xs text-slate-600">
                                        {customer?.email ||
                                            "No email"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <InfoRow
                                    label="Email"
                                    value={
                                        customer?.email || "—"
                                    }
                                />

                                <InfoRow
                                    label="Phone"
                                    value={
                                        customer?.phone || "—"
                                    }
                                />
                            </div>
                        </section>

                        {/* Request */}
                        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                        Related request
                                    </p>

                                    <h2 className="mt-1 text-base font-semibold text-white">
                                        Travel request
                                    </h2>
                                </div>

                                <span
                                    className={`rounded-full border px-2.5 py-1 text-[10px] capitalize ${request.status &&
                                            requestStatusStyles[
                                            request.status
                                            ]
                                            ? requestStatusStyles[
                                            request.status
                                            ]
                                            : "border-white/10 bg-white/5 text-slate-500"
                                        }`}
                                >
                                    {formatStatus(
                                        request.status,
                                    )}
                                </span>
                            </div>

                            <div className="mt-5 space-y-4">
                                <InfoRow
                                    label="Destination"
                                    value={destinationLabel(
                                        request,
                                    )}
                                />

                                <InfoRow
                                    label="Travel dates"
                                    value={`${formatDate(
                                        request.travel_start_date,
                                    )} → ${formatDate(
                                        request.travel_end_date,
                                    )}`}
                                />

                                <InfoRow
                                    label="Travelers"
                                    value={
                                        request.traveler_count
                                            ? `${request.traveler_count}`
                                            : "—"
                                    }
                                />

                                <InfoRow
                                    label="Priority"
                                    value={formatStatus(
                                        request.priority,
                                    )}
                                />

                                <div className="pt-1">
                                    <Link
                                        href={`/admin/requests/${request.id}`}
                                        className="inline-flex w-full items-center justify-center rounded-full border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5"
                                    >
                                        View full request
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* Quote metadata */}
                        <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-600">
                                Quote metadata
                            </p>

                            <div className="mt-5 space-y-4">
                                <InfoRow
                                    label="Quote number"
                                    value={quote.quote_number}
                                />

                                <InfoRow
                                    label="Currency"
                                    value={quote.currency}
                                />

                                <InfoRow
                                    label="Created"
                                    value={formatDateTime(
                                        quote.created_at,
                                    )}
                                />

                                <InfoRow
                                    label="Updated"
                                    value={formatDateTime(
                                        quote.updated_at,
                                    )}
                                />

                                <InfoRow
                                    label="Valid until"
                                    value={formatDate(
                                        quote.valid_until,
                                    )}
                                />
                            </div>
                        </section>

                        {/* Operational rule */}
                        <section className="rounded-3xl border border-sky-400/10 bg-sky-400/[0.035] p-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sm text-sky-300">
                                i
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-white">
                                Fulfillment rule
                            </h3>

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                A quote is a commercial proposal. Once the
                                customer accepts it, the operations team
                                creates the booking separately.
                            </p>
                        </section>
                    </aside>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-5 text-[11px] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                        TISA Global · Quote operations
                    </span>

                    <span>
                        Quote acceptance does not automatically create
                        a booking.
                    </span>
                </div>
            </div>
        </main>
    );
}

function Metric({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="bg-slate-950/30 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-600">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-medium text-white">
                {value}
            </p>
        </div>
    );
}

function PriceRow({
    label,
    value,
    muted = false,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">
                {label}
            </span>

            <span
                className={
                    muted
                        ? "text-slate-500"
                        : "text-slate-300"
                }
            >
                {value}
            </span>
        </div>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-xs text-slate-600">
                {label}
            </span>

            <span className="min-w-0 text-right text-xs font-medium text-slate-300">
                {value}
            </span>
        </div>
    );
}

function InfoPair({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                {label}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-300">
                {value}
            </p>
        </div>
    );
}

function WorkflowStep({
    number,
    title,
    active,
    complete,
    muted = false,
}: {
    number: string;
    title: string;
    active: boolean;
    complete: boolean;
    muted?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border p-3 ${muted
                    ? "border-white/5 bg-white/[0.01]"
                    : complete
                        ? "border-emerald-400/15 bg-emerald-400/[0.04]"
                        : active
                            ? "border-sky-400/20 bg-sky-400/[0.05]"
                            : "border-white/10 bg-white/[0.02]"
                }`}
        >
            <div className="flex items-center justify-between gap-2">
                <span
                    className={`text-[10px] font-medium ${complete
                            ? "text-emerald-300"
                            : active
                                ? "text-sky-300"
                                : "text-slate-600"
                        }`}
                >
                    {number}
                </span>

                {complete && (
                    <span className="text-[10px] text-emerald-300">
                        ✓
                    </span>
                )}
            </div>

            <p
                className={`mt-3 text-xs font-medium ${muted
                        ? "text-slate-700"
                        : "text-slate-300"
                    }`}
            >
                {title}
            </p>
        </div>
    );
}

function Notice({
    tone,
    title,
    description,
}: {
    tone: "success" | "warning" | "info";
    title: string;
    description: string;
}) {
    const styles = {
        success:
            "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300",
        warning:
            "border-amber-400/15 bg-amber-400/[0.04] text-amber-300",
        info:
            "border-sky-400/15 bg-sky-400/[0.04] text-sky-300",
    };

    return (
        <section
            className={`rounded-2xl border px-5 py-4 ${styles[tone]}`}
        >
            <p className="text-sm font-medium">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
            </p>
        </section>
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
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-10 text-center">
            <p className="text-sm text-slate-400">
                {title}
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
                {description}
            </p>
        </div>
    );
}