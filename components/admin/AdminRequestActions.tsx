"use client";

import { useState } from "react";

const statuses = [
  "requested",
  "reviewing",
  "need_documents",
  "documents_received",
  "quoted",
  "quote_accepted",
  "processing",
  "confirmed",
  "completed",
  "on_hold",
  "cancelled",
];

type Props = {
  requestId: string;
  status: string;
  priority: string;
  customerName: string;
};

export default function AdminRequestActions({
  requestId,
  status,
  priority,
  customerName,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function showToast(
    type: "success" | "error",
    message: string,
  ) {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  async function update(
    action: string,
    body: Record<string, unknown> = {},
  ) {
    if (busy) return false;

    setBusy(true);

    try {
      const response = await fetch(
        `/api/admin/requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            ...body,
          }),
        },
      );

      const data = await response.json().catch(() => null);

      console.log("Admin request action:", {
        requestId,
        action,
        responseStatus: response.status,
        responseData: data,
      });

      if (!response.ok || !data?.success) {
        const errorMessage =
          data?.error?.message ||
          data?.message ||
          `Operation failed (${response.status}).`;

        showToast("error", errorMessage);

        return false;
      }

      if (data.data?.status) {
        setCurrentStatus(data.data.status);
      }

      if (action === "assign") {
        showToast(
          "success",
          "Request assigned to you successfully.",
        );
      } else if (action === "note") {
        showToast(
          "success",
          "Internal note added successfully.",
        );
      } else if (action === "message") {
        showToast(
          "success",
          "Message sent to customer successfully.",
        );
      } else if (action === "status") {
        showToast(
          "success",
          "Request status updated successfully.",
        );
      } else {
        showToast("success", "Saved successfully.");
      }

      return true;
    } catch (error) {
      console.error("Admin request action error:", error);

      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Unable to complete the operation.",
      );

      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    const previousStatus = currentStatus;

    setCurrentStatus(nextStatus);

    const success = await update("status", {
      status: nextStatus,
    });

    if (!success) {
      setCurrentStatus(previousStatus);
    }
  }

  async function handleAddNote() {
    const value = note.trim();

    if (!value || busy) return;

    const success = await update("note", {
      note: value,
    });

    if (success) {
      setNote("");
    }
  }

  async function handleSendMessage() {
    const value = message.trim();

    if (!value || busy) return;

    const success = await update("message", {
      message: value,
    });

    if (success) {
      setMessage("");
    }
  }

  async function handleAssign() {
    await update("assign");
  }

  return (
    <div className="space-y-5">
      {/* Operations */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="font-semibold text-white">
          Operations
        </h2>

        <p className="mt-2 text-xs text-slate-600">
          Customer: {customerName} · Priority: {priority}
        </p>

        <label className="mt-6 block text-sm text-slate-300">
          Request status

          <select
            value={currentStatus}
            onChange={(event) => {
              void handleStatusChange(event.target.value);
            }}
            disabled={busy}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm capitalize text-white outline-none focus:border-sky-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleAssign}
          disabled={busy}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Processing..." : "Assign to me"}
        </button>
      </section>

      {/* Internal note */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="font-semibold text-white">
          Internal note
        </h2>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Add an internal operations note…"
          disabled={busy}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleAddNote}
          disabled={busy || !note.trim()}
          className="mt-3 h-10 rounded-full bg-white/10 px-4 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Saving..." : "Add note"}
        </button>
      </section>

      {/* Customer message */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="font-semibold text-white">
          Message customer
        </h2>

        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          rows={4}
          placeholder="Send a customer-facing update…"
          disabled={busy}
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={busy || !message.trim()}
          className="mt-3 h-10 rounded-full bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Sending..." : "Send message"}
        </button>
      </section>

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed right-6 top-6 z-[100] w-[min(380px,calc(100vw-2rem))]"
          role="status"
          aria-live="polite"
        >
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-400/20 bg-slate-950/95"
                : "border-rose-400/20 bg-slate-950/95"
            }`}
          >
            {/* Icon */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success"
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {toast.type === "success" ? "✓" : "!"}
            </div>

            {/* Message */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === "success"
                    ? "text-emerald-300"
                    : "text-rose-300"
                }`}
              >
                {toast.type === "success"
                  ? "Success"
                  : "Operation failed"}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-400">
                {toast.message}
              </p>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/5 hover:text-white"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}