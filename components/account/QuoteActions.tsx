"use client";

import { useState } from "react";
import { Check, LoaderCircle, MessageSquareText } from "lucide-react";

export default function QuoteActions({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function act(action: "accept" | "changes") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, message }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Unable to update quote.");
      }
      window.location.reload();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update quote.");
      setBusy(false);
    }
  }

  if (status !== "sent") return null;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <label htmlFor={`quote-note-${quoteId}`} className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
        <MessageSquareText aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
        Optional note for TISA
      </label>
      <textarea
        id={`quote-note-${quoteId}`}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={2}
        maxLength={2000}
        placeholder="Ask for a change or add a note…"
        disabled={busy}
        className="w-full resize-y rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground placeholder:text-muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-60"
      />
      {error && <p role="alert" className="mt-2 text-xs text-rose-700 dark:text-rose-200">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("accept")}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-400 px-4 text-xs font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-50 motion-reduce:transform-none"
        >
          {busy ? <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" /> : <Check aria-hidden="true" className="h-3.5 w-3.5" />}
          {busy ? "Updating…" : "Accept quote"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("changes")}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-xs font-medium text-foreground transition hover:border-primary/25 hover:bg-primary-soft disabled:cursor-wait disabled:opacity-50"
        >
          Request changes
        </button>
      </div>
    </div>
  );
}
