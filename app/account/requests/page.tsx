"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RequestPriority, RequestStatus } from "@/types/tisa";
import { getDestinationLabel } from "@/lib/data/destination-label";

type RequestRow = {
  id: string;
  destination_country: string | null;
  destination_city: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  description: string;
  created_at: string;
  request_services: Array<{
    service_catalog: { name: string } | null;
  }>;
};

const statusLabel: Record<RequestStatus, string> = {
  requested: "Request received",
  reviewing: "Under review",
  need_documents: "Documents needed",
  documents_received: "Documents received",
  quoted: "Quote ready",
  quote_accepted: "Quote accepted",
  processing: "Processing",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  on_hold: "On hold",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/requests")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error?.message ?? "Unable to load requests.");
        return result;
      })
      .then((result) => setRequests(result.data ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load requests."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      
      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">My Requests</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Your TISA journeys</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Track every assistance request, document need, quote, and processing update from one place.
            </p>
          </div>
          <Link href="/request" className="inline-flex h-11 items-center justify-center rounded-full bg-sky-400 px-6 text-sm font-semibold text-slate-950 hover:bg-sky-300">
            Start a new request
          </Link>
        </div>

        {error && <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">{error}</div>}

        {loading ? (
          <div className="mt-10 text-sm text-slate-500">Loading your requests…</div>
        ) : requests.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <h2 className="text-xl font-semibold text-white">No requests yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">When you need help with a visa, conference, flight, medical journey, education travel, or package, your request will appear here.</p>
            <Link href="/request" className="mt-6 inline-flex rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5">Tell TISA what you need</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-4">
            {requests.map((request) => (
              <Link key={request.id} href={`/account/requests/${request.id}`} className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-sky-400/30 hover:bg-white/[0.04]">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{statusLabel[request.status]}</span>
                      <span className={`rounded-full px-3 py-1 text-xs ${request.priority === "urgent" ? "bg-red-400/10 text-red-300" : request.priority === "high" ? "bg-amber-400/10 text-amber-300" : "bg-slate-400/10 text-slate-300"}`}>{request.priority}</span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold text-white">{getDestinationLabel(request.destination_city, request.destination_country)}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{request.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {request.request_services.map((item) => item.service_catalog?.name).filter(Boolean).map((name) => (
                        <span key={name} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400">{name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-left lg:text-right">
                    <p className="text-xs text-slate-600">Request ID</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">{request.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-4 text-xs text-slate-600">Created</p>
                    <p className="mt-1 text-sm text-slate-400">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
