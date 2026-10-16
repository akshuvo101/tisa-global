
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { RequestStatus } from "@/types/tisa";
import QuoteActions from "@/components/account/QuoteActions";
import RequestMessageComposer from "@/components/account/RequestMessageComposer";
import {
  getDestinationCountryLabel,
  getDestinationLabel,
} from "@/lib/data/destination-label";

type RequestDetail = {
  id: string;
  destination_country: string | null;
  destination_city: string | null;
  travel_start_date: string | null;
  travel_end_date: string | null;
  traveler_count: number;
  priority: string;
  status: RequestStatus;
  description: string;
  created_at: string;
  request_services: Array<{
    id: string;
    status: string;
    service_catalog: { name: string } | null;
  }>;
  request_documents: Array<{
    id: string;
    document_type: string;
    file_name: string | null;
    status: string;
    required: boolean;
    due_date: string | null;
    rejection_reason: string | null;
  }>;
  request_messages: Array<{
    id: string;
    sender_id: string;
    message: string;
    created_at: string;
  }>;
  quotes: Array<{
    id: string;
    quote_number: string;
    status: string;
    total_amount: number;
    currency: string;
    valid_until: string | null;
    subtotal: number;
    service_fee: number;
    discount: number;
    tax: number;
    quote_items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  }>;
  bookings: Array<{
    id: string;
    booking_reference: string | null;
    status: string;
  }>;
};

const steps: RequestStatus[] = [
  "requested",
  "reviewing",
  "need_documents",
  "documents_received",
  "quoted",
  "quote_accepted",
  "processing",
  "confirmed",
  "completed",
];

const labels: Record<string, string> = {
  requested: "Request received",
  reviewing: "TISA reviewing",
  need_documents: "Documents needed",
  documents_received: "Documents received",
  quoted: "Quote ready",
  quote_accepted: "Quote accepted",
  processing: "Processing",
  confirmed: "Confirmed",
  completed: "Completed",
};

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();

  const [request, setRequest] =
    useState<RequestDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRequest() {
      try {
        const response = await fetch(
          `/api/requests/${params.id}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message ??
              "Unable to load request.",
          );
        }

        if (active) {
          setRequest(result.data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load request.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-slate-500 sm:px-6 sm:py-20">
          Loading request…
        </div>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="break-words text-sm text-red-300">
            {error || "Request not found."}
          </p>

          <Link
            href="/account/requests"
            className="mt-5 inline-block text-sm text-sky-400 hover:text-sky-300"
          >
            ← Back to requests
          </Link>
        </div>
      </main>
    );
  }

  const currentIndex = steps.indexOf(request.status);

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <Link
          href="/account/requests"
          className="text-sm text-slate-500 transition-colors hover:text-white"
        >
          ← My Requests
        </Link>

        {/* Request heading */}
        <div className="mt-6 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400 sm:tracking-[0.2em]">
              Request {request.id.slice(0, 8).toUpperCase()}
            </p>

            <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {getDestinationLabel(
                request.destination_city,
                request.destination_country,
              )}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Created{" "}
              {new Date(
                request.created_at,
              ).toLocaleDateString()}
            </p>
          </div>

          <span className="w-fit max-w-full rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-4 py-2 text-sm text-sky-300">
            {labels[request.status] ?? formatStatus(request.status)}
          </span>
        </div>

        {/* Responsive status tracker */}
        <section
          aria-label="Request progress"
          className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:mt-10 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-400">
                Progress tracker
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Track your request
              </h2>
            </div>

            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
              {currentIndex >= 0
                ? `${currentIndex + 1} of ${steps.length}`
                : "In progress"}
            </span>
          </div>

          {/* Mobile and tablet: vertical timeline */}
          <ol className="mt-6 lg:hidden">
            {steps.map((step, index) => {
              const completed =
                currentIndex >= 0 &&
                index < currentIndex;

              const current = index === currentIndex;

              const upcoming =
                currentIndex < 0 ||
                index > currentIndex;

              return (
                <li
                  key={step}
                  className="relative flex gap-4 pb-6 last:pb-0"
                  aria-current={current ? "step" : undefined}
                >
                  {/* Timeline line */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-[13px] top-7 h-[calc(100%-8px)] w-px ${
                        completed
                          ? "bg-sky-400/60"
                          : "bg-white/10"
                      }`}
                    />
                  )}

                  {/* Status marker */}
                  <span
                    className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                      completed
                        ? "border-sky-400 bg-sky-400 text-slate-950"
                        : current
                          ? "border-sky-400 bg-sky-400/15 text-sky-300 ring-4 ring-sky-400/10"
                          : "border-white/10 bg-[#111923] text-slate-600"
                    }`}
                  >
                    {completed ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4"
                      >
                        <path
                          d="m5 10 3.2 3.2L15 6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>

                  {/* Status label */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p
                      className={`text-sm font-medium ${
                        current
                          ? "text-sky-300"
                          : completed
                            ? "text-slate-200"
                            : "text-slate-500"
                      }`}
                    >
                      {labels[step]}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {current
                        ? "Current stage"
                        : completed
                          ? "Previous stage"
                          : upcoming
                            ? "Upcoming stage"
                            : ""}
                    </p>
                  </div>

                  {current && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" />
                  )}
                </li>
              );
            })}
          </ol>

          {/* Desktop: horizontal progress tracker */}
          <ol className="mt-8 hidden lg:flex">
            {steps.map((step, index) => {
              const completed =
                currentIndex >= 0 &&
                index < currentIndex;

              const current = index === currentIndex;

              return (
                <li
                  key={step}
                  className="relative flex min-w-0 flex-1 flex-col items-center text-center"
                  aria-current={current ? "step" : undefined}
                >
                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute left-1/2 top-3 h-px w-full ${
                        index < currentIndex
                          ? "bg-sky-400/60"
                          : "bg-white/10"
                      }`}
                    />
                  )}

                  {/* Marker */}
                  <span
                    className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                      completed
                        ? "border-sky-400 bg-sky-400 text-slate-950"
                        : current
                          ? "border-sky-400 bg-sky-400/15 text-sky-300 ring-4 ring-sky-400/10"
                          : "border-white/10 bg-[#111923] text-slate-600"
                    }`}
                  >
                    {completed ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="m5 10 3.2 3.2L15 6.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    className={`mt-3 max-w-[100px] text-xs leading-5 ${
                      current
                        ? "font-semibold text-sky-300"
                        : completed
                          ? "text-slate-300"
                          : "text-slate-500"
                    }`}
                  >
                    {labels[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Request information */}
        <div className="mt-8 grid min-w-0 gap-6 lg:mt-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="min-w-0 space-y-6">
            {/* Services */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                Services
              </h2>

              {request.request_services.length ? (
                <div className="mt-5 space-y-3">
                  {request.request_services.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="break-words text-sm text-slate-300">
                        {item.service_catalog?.name ?? "Service"}
                      </span>

                      <span className="w-fit rounded-full bg-white/[0.04] px-2.5 py-1 text-xs capitalize text-slate-500">
                        {formatStatus(item.status)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No services have been added yet.
                </p>
              )}
            </section>

            {/* Request description */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                Your request
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
                {request.description}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Info
                  label="Country"
                  value={
                    getDestinationCountryLabel(
                      request.destination_country,
                    ) || "Not specified"
                  }
                />

                <Info
                  label="Travelers"
                  value={String(request.traveler_count)}
                />

                <Info
                  label="Priority"
                  value={request.priority}
                />
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                Documents
              </h2>

              {request.request_documents.length ? (
                <div className="mt-4 space-y-3">
                  {request.request_documents.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No documents have been requested yet.
                </p>
              )}
            </section>
          </div>

          {/* Right column */}
          <aside className="min-w-0 space-y-6">
            {/* Bookings */}
            {request.bookings?.length > 0 && (
              <section className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.03] p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-white">
                  Travel fulfillment
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your TISA booking is being processed.
                </p>

                <div className="mt-4 space-y-3">
                  {request.bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/account/bookings/${booking.id}`}
                      className="block rounded-2xl border border-white/8 p-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="break-all text-sm text-white">
                          {booking.booking_reference ||
                            booking.id.slice(0, 8)}
                        </span>

                        <span className="w-fit rounded-full bg-white/[0.04] px-2.5 py-1 text-xs capitalize text-slate-500">
                          {formatStatus(booking.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quotes */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                Quotes
              </h2>

              {request.quotes.length ? (
                <div className="mt-4 space-y-4">
                  {request.quotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="min-w-0 rounded-2xl border border-white/8 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-all text-xs text-slate-600">
                            {quote.quote_number}
                          </p>

                          <p className="mt-2 text-sm capitalize text-slate-400">
                            {formatStatus(quote.status)}
                          </p>
                        </div>

                        <p className="break-words text-xl font-semibold text-white sm:text-right">
                          {quote.currency}{" "}
                          {Number(
                            quote.total_amount,
                          ).toLocaleString()}
                        </p>
                      </div>

                      {quote.quote_items?.length > 0 && (
                        <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
                          {quote.quote_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3 text-xs leading-5 text-slate-500"
                            >
                              <span className="min-w-0 break-words">
                                {item.description} × {item.quantity}
                              </span>

                              <span className="shrink-0 text-right">
                                {quote.currency}{" "}
                                {Number(
                                  item.total_price,
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {quote.valid_until && (
                        <p className="mt-3 text-xs text-slate-600">
                          Valid until {quote.valid_until}
                        </p>
                      )}

                      <div className="mt-4">
                        <QuoteActions
                          quoteId={quote.id}
                          status={quote.status}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  TISA has not prepared a quote yet. We will
                  notify you when it is ready.
                </p>
              )}
            </section>

            {/* Messages */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white">
                Messages
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Communicate directly with the TISA team.
              </p>

              <div className="mt-4 space-y-3">
                {request.request_messages.length ? (
                  request.request_messages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-2xl bg-white/[0.03] p-4"
                    >
                      <p className="break-words text-sm leading-6 text-slate-300">
                        {message.message}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-600">
                        {new Date(
                          message.created_at,
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    No messages yet. Send a message below if
                    you need help.
                  </p>
                )}
              </div>

              <div className="mt-5">
                <RequestMessageComposer
                  requestId={request.id}
                  onSent={(message) =>
                    setRequest((current) =>
                      current
                        ? {
                            ...current,
                            request_messages: [
                              ...current.request_messages,
                              message,
                            ],
                          }
                        : current,
                    )
                  }
                />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DocumentRow({
  doc,
}: {
  doc: RequestDetail["request_documents"][number];
}) {
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function upload() {
    if (!file || busy) return;

    setBusy(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(
        `/api/requests/${doc.id}/documents`,
        {
          method: "POST",
          body: form,
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Upload failed.",
        );
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.03] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm text-slate-300">
            {doc.document_type}
          </p>

          <p className="mt-1 break-words text-xs text-slate-600">
            {doc.file_name || "Upload required"}
          </p>
        </div>

        <span className="w-fit shrink-0 rounded-full bg-white/[0.04] px-2.5 py-1 text-xs capitalize text-slate-500">
          {formatStatus(doc.status)}
        </span>
      </div>

      {["required", "rejected"].includes(doc.status) && (
        <div className="mt-4 space-y-3">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
            className="block w-full max-w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-200"
          />

          <button
            type="button"
            disabled={busy || !file}
            onClick={() => void upload()}
            className="min-h-10 w-full rounded-xl bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {busy ? "Uploading…" : "Upload document"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 break-words text-xs text-red-300">
          {error}
        </p>
      )}
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
    <div className="min-w-0 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 break-words text-sm capitalize text-slate-300">
        {value}
      </p>
    </div>
  );
}
