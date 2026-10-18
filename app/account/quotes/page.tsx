"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarClock, CircleDollarSign, FileText, ReceiptText } from "lucide-react";
import QuoteActions from "@/components/account/QuoteActions";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import { getDestinationLabel } from "@/lib/data/destination-label";

type Quote = {
  id: string;
  request_id: string;
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
};

type RequestWithQuotes = {
  id: string;
  destination_city: string | null;
  destination_country: string | null;
  quotes: Quote[];
};

export default function QuotesPage() {
  const [requests, setRequests] = useState<RequestWithQuotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuotes() {
      try {
        const response = await fetch("/api/requests");
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Unable to load requests.");
        }
        const details = await Promise.all(
          (body.data as RequestWithQuotes[]).map(async (request) => {
            const detailResponse = await fetch(`/api/requests/${request.id}`);
            const detail = await detailResponse.json();
            if (!detailResponse.ok || !detail.success) {
              throw new Error(detail.error?.message || "Unable to load quote details.");
            }
            return detail.data as RequestWithQuotes;
          }),
        );
        if (active) setRequests(details);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load quotes.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadQuotes();
    return () => {
      active = false;
    };
  }, []);

  const quotes = useMemo(
    () => requests.flatMap((request) => request.quotes.map((quote) => ({ ...quote, request }))),
    [requests],
  );

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PortalPageHeader
          eyebrow="SERVICE PROPOSALS"
          title="Your quotes"
          description="Review the proposed services, price breakdown, and validity before deciding what works for you."
        >
          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-3.5 text-xs font-semibold text-violet-800 dark:text-violet-200">
            <ReceiptText aria-hidden="true" className="h-4 w-4" />
            {quotes.length} quote{quotes.length === 1 ? "" : "s"}
          </span>
        </PortalPageHeader>

        {error && (
          <div role="alert" className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-700 dark:text-rose-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Loading your quotes">
            {[0, 1].map((item) => <div key={item} className="h-64 animate-pulse rounded-[20px] border border-border bg-surface motion-reduce:animate-none" />)}
          </div>
        ) : quotes.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {quotes.map((quote) => (
              <article key={quote.id} className="rounded-[22px] border border-border bg-surface/90 p-4 shadow-[0_10px_28px_rgba(1,9,17,0.12)] transition duration-200 hover:border-violet-400/25 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-400/10 text-violet-700 dark:text-violet-200">
                    <CircleDollarSign aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-[11px] font-medium uppercase tracking-[0.12em] text-muted">{quote.quote_number}</p>
                      <PortalStatusBadge status={quote.status} />
                    </div>
                    <h2 className="mt-1.5 truncate text-base font-semibold text-foreground">
                      {getDestinationLabel(quote.request.destination_city, quote.request.destination_country)}
                    </h2>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl border border-violet-400/15 bg-violet-400/[0.06] p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">Quote total</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                      {quote.currency} {Number(quote.total_amount).toLocaleString()}
                    </p>
                  </div>
                  {quote.valid_until ? (
                    <p className="inline-flex max-w-[46%] items-center gap-1.5 text-right text-[11px] leading-4 text-muted">
                      <CalendarClock aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
                      Valid until {new Date(`${quote.valid_until}T00:00:00`).toLocaleDateString()}
                    </p>
                  ) : (
                    <span className="text-right text-[11px] text-muted">No expiry specified</span>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Included services</p>
                  {quote.quote_items.length ? quote.quote_items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5">
                      <span className="min-w-0 text-xs leading-5 text-foreground">{item.description} <span className="text-muted">× {item.quantity}</span></span>
                      <span className="shrink-0 text-xs font-medium text-foreground">{quote.currency} {Number(item.total_price).toLocaleString()}</span>
                    </div>
                  )) : (
                    <p className="text-xs text-muted">No itemized services were provided.</p>
                  )}
                </div>

                <details className="group mt-3 rounded-xl border border-border bg-background/35">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-medium text-muted marker:hidden">
                    Price breakdown
                    <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
                  </summary>
                  <div className="space-y-2 border-t border-border px-3 py-3 text-xs">
                    <PriceLine label="Subtotal" currency={quote.currency} amount={quote.subtotal} />
                    <PriceLine label="Service fee" currency={quote.currency} amount={quote.service_fee} />
                    {quote.discount !== 0 && <PriceLine label="Discount" currency={quote.currency} amount={-quote.discount} />}
                    {quote.tax !== 0 && <PriceLine label="Tax" currency={quote.currency} amount={quote.tax} />}
                    <div className="flex justify-between border-t border-border pt-2 font-semibold text-foreground">
                      <span>Total</span><span>{quote.currency} {Number(quote.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </details>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <Link href={`/account/requests/${quote.request_id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                    Request details <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <QuoteActions quoteId={quote.id} status={quote.status} />
              </article>
            ))}
          </div>
        ) : (
          <PortalEmptyState
            icon={FileText}
            emoji="🧾"
            title="No quotes to review yet"
            description="When TISA prepares a service proposal for one of your requests, the itemized price and next steps will appear here."
            action={{ label: "View my requests", href: "/account/requests" }}
          />
        )}
      </section>
    </main>
  );
}

function PriceLine({ label, currency, amount }: { label: string; currency: string; amount: number }) {
  return (
    <div className="flex justify-between gap-3 text-muted">
      <span>{label}</span>
      <span>{currency} {Number(amount).toLocaleString()}</span>
    </div>
  );
}
