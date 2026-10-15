"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type QuoteActionsProps = {
  quoteId: string;
  canSend: boolean;
  canCancel: boolean;
};

export default function QuoteActions({
  quoteId,
  canSend,
  canCancel,
}: QuoteActionsProps) {
  const router = useRouter();

  const [busy, setBusy] = useState<
    "send" | "cancel" | null
  >(null);

  const [error, setError] = useState("");

  async function runAction(
    action: "send" | "cancel",
  ) {
    setBusy(action);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/quotes/${quoteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error?.message ||
            "Unable to complete this action.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      {canSend && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void runAction("send")}
          className="inline-flex h-10 items-center justify-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "send"
            ? "Sending..."
            : "Send quote"}
        </button>
      )}

      {canCancel && (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void runAction("cancel")}
          className="inline-flex h-10 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 px-4 text-sm font-medium text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "cancel"
            ? "Cancelling..."
            : "Cancel"}
        </button>
      )}

      {error && (
        <p
          role="alert"
          className="basis-full text-xs text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}