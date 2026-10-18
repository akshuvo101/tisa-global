"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, FileCheck2, FileText, LockKeyhole, Upload } from "lucide-react";
import PortalPageHeader from "@/components/account/PortalPageHeader";
import PortalEmptyState from "@/components/account/PortalEmptyState";
import PortalStatusBadge from "@/components/account/PortalStatusBadge";
import { getDestinationLabel } from "@/lib/data/destination-label";

type Document = {
  id: string;
  request_id: string;
  document_type: string;
  file_name: string | null;
  status: string;
  required: boolean;
  due_date: string | null;
  rejection_reason: string | null;
};

type RequestWithDocuments = {
  id: string;
  destination_city: string | null;
  destination_country: string | null;
  request_documents: Document[];
};

type Filter = "all" | "attention" | "submitted";

export default function DocumentsPage() {
  const [requests, setRequests] = useState<RequestWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      try {
        const response = await fetch("/api/requests");
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body.error?.message || "Unable to load requests.");
        }

        const details = await Promise.all(
          (body.data as RequestWithDocuments[]).map(async (request) => {
            const detailResponse = await fetch(`/api/requests/${request.id}`);
            const detail = await detailResponse.json();
            if (!detailResponse.ok || !detail.success) {
              throw new Error(detail.error?.message || "Unable to load requested documents.");
            }
            return detail.data as RequestWithDocuments;
          }),
        );
        if (active) setRequests(details);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load documents.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDocuments();
    return () => {
      active = false;
    };
  }, []);

  const documents = useMemo(
    () =>
      requests.flatMap((request) =>
        request.request_documents.map((document) => ({ ...document, request })),
      ),
    [requests],
  );
  const attentionCount = documents.filter(
    (document) =>
      document.required && ["required", "rejected", "expired"].includes(document.status),
  ).length;
  const visibleDocuments = documents.filter((document) => {
    if (filter === "attention") {
      return document.required && ["required", "rejected", "expired"].includes(document.status);
    }
    if (filter === "submitted") {
      return !["required", "rejected", "expired"].includes(document.status);
    }
    return true;
  });

  return (
    <main className="portal-page min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <PortalPageHeader
          eyebrow="TRAVEL CHECKLIST"
          title="Your documents"
          description="See what TISA needs, check review progress, and continue a secure upload from its request."
        >
          <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
            <Upload aria-hidden="true" className="h-4 w-4" />
            {attentionCount} need{attentionCount === 1 ? "s" : ""} attention
          </span>
        </PortalPageHeader>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" aria-label="Filter documents">
            {([
              ["all", "All documents", documents.length],
              ["attention", "Needs attention", attentionCount],
              ["submitted", "Submitted / in review", documents.length - attentionCount],
            ] as const).map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition ${
                  filter === value
                    ? "border-primary/25 bg-primary-soft text-primary"
                    : "border-border bg-surface/70 text-muted hover:border-primary/20 hover:text-foreground"
                }`}
              >
                {label}
                <span className="rounded-md bg-background/50 px-1.5 py-0.5 tabular-nums">{count}</span>
              </button>
            ))}
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 text-secondary" />
            Uploads stay attached to their request
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-700 dark:text-rose-200">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-2 text-xs font-semibold underline underline-offset-4">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3" aria-label="Loading your documents">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-[20px] border border-border bg-surface motion-reduce:animate-none" />
            ))}
          </div>
        ) : visibleDocuments.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleDocuments.map((document) => (
              <article key={document.id} className="group rounded-[20px] border border-border bg-surface/90 p-4 shadow-[0_8px_24px_rgba(1,9,17,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/25 motion-reduce:transform-none sm:p-5">
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${["required", "rejected", "expired"].includes(document.status) ? "bg-amber-400/10 text-amber-700 dark:text-amber-200" : "bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"}`}>
                    {["required", "rejected", "expired"].includes(document.status) ? <FileText aria-hidden="true" className="h-[18px] w-[18px]" /> : <FileCheck2 aria-hidden="true" className="h-[18px] w-[18px]" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-sm font-semibold text-foreground">{document.document_type}</h2>
                      <PortalStatusBadge status={document.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted">
                      {getDestinationLabel(document.request.destination_city, document.request.destination_country)}
                      {document.required ? " · Required" : " · Optional"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/45 px-3 py-2.5">
                  <p className="truncate text-xs text-foreground">{document.file_name || "No file uploaded yet"}</p>
                  {document.due_date && <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-200">Due {new Date(`${document.due_date}T00:00:00`).toLocaleDateString()}</p>}
                  {document.rejection_reason && <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-200">Please update: {document.rejection_reason}</p>}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted">PDF, JPG, PNG or WebP</span>
                  <Link href={`/account/requests/${document.request_id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                    {["required", "rejected"].includes(document.status) ? <><Upload aria-hidden="true" className="h-3.5 w-3.5" />Upload</> : <>View request<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></>}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <PortalEmptyState
            icon={FileCheck2}
            emoji={documents.length ? undefined : "📄"}
            title={documents.length ? "Nothing in this view" : "No documents requested yet"}
            description={documents.length ? "Try another filter to see the rest of your checklist." : "If a journey needs supporting files, TISA will add the requirements to its request workspace and notify you."}
            action={!documents.length ? { label: "View my requests", href: "/account/requests" } : undefined}
          />
        )}
      </section>
    </main>
  );
}
