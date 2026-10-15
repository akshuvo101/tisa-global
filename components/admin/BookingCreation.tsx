"use client";

import { useState } from "react";

type Quote = {
  id: string;
  quote_number: string;
  status: string;
  total_amount: number;
  currency: string;
};

export default function BookingCreation({
  requestId,
  quotes,
}: {
  requestId: string;
  quotes: Quote[];
}) {
  const accepted = quotes.filter((quote) => quote.status === "accepted");

  const [quoteId, setQuoteId] = useState(accepted[0]?.id || "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!accepted.length) {
    return (
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-400/10 text-sm text-slate-500">
              03
            </span>

            <div>
              <h2 className="font-semibold text-white">
                Booking & fulfillment
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Booking becomes available after a quote is accepted.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-slate-500">
              ✓
            </div>

            <p className="mt-3 text-sm text-slate-400">
              No accepted quote yet
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
              Once the customer accepts a quote, you can create a booking and
              start the travel fulfillment process from here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  async function create() {
    if (!quoteId) {
      setMsg("Please select an accepted quote.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          quote_id: quoteId,
          start_date: start || null,
          end_date: end || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMsg(data.error?.message || "Unable to create booking.");
        return;
      }

      window.location.href = `/admin/bookings/${data.data.id}`;
    } catch {
      setMsg("Something went wrong while creating the booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.025]">
      <div className="border-b border-emerald-400/10 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-sm text-emerald-300">
            03
          </span>

          <div>
            <h2 className="font-semibold text-white">
              Create booking
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Convert an accepted quote into an operational booking and begin
              travel fulfillment.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-2xl border border-emerald-400/10 bg-slate-950/20 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300/70">
            Accepted quote
          </p>

          <div className="mt-3 grid gap-3">
            <select
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-emerald-400/40"
            >
              {accepted.map((quote) => (
                <option key={quote.id} value={quote.id}>
                  {quote.quote_number} · {quote.currency}{" "}
                  {Number(quote.total_amount).toLocaleString()}
                </option>
              ))}
            </select>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-slate-500">
                Travel start
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
                />
              </label>

              <label className="text-xs text-slate-500">
                Travel end
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-emerald-400/40"
                />
              </label>
            </div>
          </div>
        </div>

        <label className="mt-4 block text-xs text-slate-500">
          Fulfillment note
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add an internal fulfillment note..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/40"
          />
        </label>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-xs text-sky-300">
              i
            </div>

            <div>
              <p className="text-xs font-medium text-slate-300">
                Before creating the booking
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Creating a booking does not process payment automatically. It
                only starts the TISA fulfillment workflow.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={busy || !quoteId}
          onClick={() => void create()}
          className="mt-4 h-11 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Creating booking..." : "Create booking & start fulfillment"}
        </button>

        {msg && (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300"
          >
            {msg}
          </p>
        )}
      </div>
    </section>
  );
}