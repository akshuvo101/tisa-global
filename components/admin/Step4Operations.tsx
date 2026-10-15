"use client";

import { useState } from "react";

type Doc = {
  id: string;
  document_type: string;
  file_name: string | null;
  status: string;
  required: boolean;
  due_date: string | null;
  rejection_reason: string | null;
};

const documentStatusStyles: Record<string, string> = {
  required: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  uploaded: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  under_review:
    "border-violet-400/20 bg-violet-400/10 text-violet-300",
  accepted: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  rejected: "border-red-400/20 bg-red-400/10 text-red-300",
  expired: "border-red-400/20 bg-red-400/10 text-red-300",
};

export default function Step4Operations({
  requestId,
  documents,
}: {
  requestId: string;
  documents: Doc[];
}) {
  const [docType, setDocType] = useState("");
  const [docDue, setDocDue] = useState("");
  const [docNote, setDocNote] = useState("");

  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function post(
    url: string,
    method: string,
    body?: unknown,
  ): Promise<any | null> {
    setBusy(true);
    setResult("");

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult(data.error?.message || "Operation failed.");
        return null;
      }

      return data.data;
    } catch {
      setResult("Something went wrong. Please try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function requestDoc() {
    if (!docType.trim()) return;

    const data = await post(
      `/api/admin/requests/${requestId}/documents`,
      "POST",
      {
        document_type: docType.trim(),
        due_date: docDue || null,
        notes: docNote.trim() || null,
      },
    );

    if (data) {
      setDocType("");
      setDocDue("");
      setDocNote("");
      setResult("Document requirement added.");
      window.location.reload();
    }
  }

  async function docStatus(id: string, status: string) {
    const data = await post(`/api/admin/documents/${id}`, "PATCH", {
      status,
    });

    if (data) {
      setResult("Document status updated.");
      window.location.reload();
    }
  }

  async function openDoc(id: string) {
    try {
      setBusy(true);
      setResult("");

      const response = await fetch(`/api/admin/documents/${id}/url`);
      const data = await response.json();

      if (response.ok && data.success) {
        window.open(data.data.url, "_blank", "noopener,noreferrer");
      } else {
        setResult(data.error?.message || "Unable to open document.");
      }
    } catch {
      setResult("Unable to open document.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sm text-sky-300">
                01
              </span>

              <div>
                <h2 className="font-semibold text-white">
                  Document operations
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Request, review and approve customer documents.
                </p>
              </div>
            </div>
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-500">
            Private · 10 MB max
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Request document */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            Request a document
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_160px]">
            <input
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              placeholder="e.g. Passport copy"
              className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
            />

            <input
              type="date"
              value={docDue}
              onChange={(e) => setDocDue(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-slate-300 outline-none focus:border-sky-400/40"
            />
          </div>

          <input
            value={docNote}
            onChange={(e) => setDocNote(e.target.value)}
            placeholder="Optional instruction for the customer"
            className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <button
            type="button"
            disabled={busy || !docType.trim()}
            onClick={() => void requestDoc()}
            className="mt-3 h-10 rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Processing..." : "Request document"}
          </button>
        </div>

        {/* Documents list */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              Requested documents
            </p>

            <span className="text-xs text-slate-600">
              {documents.length} total
            </span>
          </div>

          {documents.length ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {doc.document_type}
                        </p>

                        {doc.required && (
                          <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {doc.file_name || "Waiting for customer upload"}
                      </p>

                      {doc.due_date && (
                        <p className="mt-1 text-[11px] text-slate-600">
                          Due {doc.due_date}
                        </p>
                      )}

                      {doc.rejection_reason && (
                        <p className="mt-2 text-xs text-red-300">
                          Rejection: {doc.rejection_reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs capitalize ${
                          documentStatusStyles[doc.status] ||
                          "border-white/10 bg-white/5 text-slate-400"
                        }`}
                      >
                        {doc.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>

                  {doc.status === "uploaded" && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void openDoc(doc.id)}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                      >
                        Open file
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void docStatus(doc.id, "under_review")
                        }
                        className="rounded-full bg-violet-400/10 px-3 py-2 text-xs text-violet-300 transition hover:bg-violet-400/15 disabled:opacity-50"
                      >
                        Start review
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void docStatus(doc.id, "accepted")}
                        className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/15 disabled:opacity-50"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void docStatus(doc.id, "rejected")}
                        className="rounded-full bg-red-400/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/15 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No documents requested"
              description="Required documents will appear here once the operations team requests them."
            />
          )}
        </div>
      </div>

      {result && (
        <div
          role="status"
          className="border-t border-sky-400/10 bg-sky-400/[0.04] px-6 py-3 text-sm text-slate-400"
        >
          {result}
        </div>
      )}
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
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
}