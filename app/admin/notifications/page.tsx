"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Notification = {
  type: string;
  title: string;
  message: string;
};

type Delivery = {
  id: string;
  channel: string;
  status: string;
  attempts: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
  notifications: Notification | null;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "sent":
    case "delivered":
    case "completed":
    case "success":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "pending":
    case "queued":
    case "processing":
    case "sending":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "failed":
    case "error":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    case "cancelled":
    case "canceled":
      return "border-slate-400/20 bg-slate-400/10 text-slate-400";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-400";
  }
}

function channelClasses(channel: string) {
  switch (channel.toLowerCase()) {
    case "email":
      return "border-violet-400/20 bg-violet-400/10 text-violet-300";

    case "whatsapp":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "in_app":
    case "in-app":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-400";
  }
}

function channelIcon(channel: string) {
  switch (channel.toLowerCase()) {
    case "email":
      return "✉";

    case "whatsapp":
      return "◉";

    case "in_app":
    case "in-app":
      return "◈";

    default:
      return "◇";
  }
}

function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "text-white",
    success: "text-emerald-300",
    warning: "text-amber-300",
    danger: "text-rose-300",
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-2xl font-semibold tracking-tight",
          toneClasses[tone],
        ].join(" ")}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-600">{hint}</p>
    </div>
  );
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/notifications",
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Unable to load notification deliveries.",
        );
      }

      setItems(data.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notification deliveries.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;

    const successful = items.filter((item) =>
      ["sent", "delivered", "completed", "success"].includes(
        item.status.toLowerCase(),
      ),
    ).length;

    const pending = items.filter((item) =>
      ["pending", "queued", "processing", "sending"].includes(
        item.status.toLowerCase(),
      ),
    ).length;

    const failed = items.filter((item) =>
      ["failed", "error"].includes(
        item.status.toLowerCase(),
      ),
    ).length;

    const totalAttempts = items.reduce(
      (sum, item) => sum + (item.attempts || 0),
      0,
    );

    return {
      total,
      successful,
      pending,
      failed,
      totalAttempts,
    };
  }, [items]);

  const channelStats = useMemo(() => {
    return {
      inApp: items.filter((item) =>
        ["in_app", "in-app"].includes(
          item.channel.toLowerCase(),
        ),
      ).length,

      email: items.filter(
        (item) =>
          item.channel.toLowerCase() === "email",
      ).length,

      whatsapp: items.filter(
        (item) =>
          item.channel.toLowerCase() === "whatsapp",
      ).length,
    };
  }, [items]);

  return (
    <main className="min-w-0 w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* -------------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------------- */}

        <section>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Link
                  href="/admin"
                  className="transition hover:text-slate-300"
                >
                  Administration
                </Link>

                <span>/</span>

                <span className="text-slate-500">
                  Notifications
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                  Operations
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Notification delivery
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Monitor how TISA Global notifications are delivered
                  across in-app, email, and WhatsApp-ready channels.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  Delivery engine
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {stats.total} delivery{" "}
                  {stats.total === 1 ? "record" : "records"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------------- */}

        {error && (
          <section className="mt-6">
            <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-300">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">!</span>
                <p>{error}</p>
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------- */}
        {/* KPI */}
        {/* -------------------------------------------------- */}

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Deliveries"
            value={stats.total}
            hint="Total delivery records"
          />

          <MetricCard
            label="Successful"
            value={stats.successful}
            hint="Delivered successfully"
            tone="success"
          />

          <MetricCard
            label="Pending"
            value={stats.pending}
            hint="Waiting or processing"
            tone="warning"
          />

          <MetricCard
            label="Failed"
            value={stats.failed}
            hint="Needs attention"
            tone={
              stats.failed > 0
                ? "danger"
                : "default"
            }
          />

          <MetricCard
            label="Attempts"
            value={stats.totalAttempts}
            hint="Total delivery attempts"
          />
        </section>

        {/* -------------------------------------------------- */}
        {/* Channel overview */}
        {/* -------------------------------------------------- */}

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Delivery channels
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Current notification activity by delivery channel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/10 text-sky-300">
                  ◈
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    In-app
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {channelStats.inApp} deliveries
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300">
                  ✉
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    Email
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {channelStats.email} deliveries
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                  ◉
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-300">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {channelStats.whatsapp} deliveries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Delivery activity */}
        {/* -------------------------------------------------- */}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent delivery activity
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Review notification delivery status and failures.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadNotifications()}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center self-start rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-slate-600">
                ◈
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No notification deliveries
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Delivery activity will appear here when notifications
                are sent.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] lg:block">
                <div className="grid grid-cols-[1.45fr_.75fr_.85fr_.55fr_1fr_1.35fr] gap-4 border-b border-white/[0.07] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  <span>Notification</span>
                  <span>Channel</span>
                  <span>Status</span>
                  <span>Attempts</span>
                  <span>Created</span>
                  <span>Error</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.45fr_.75fr_.85fr_.55fr_1fr_1.35fr] gap-4 border-b border-white/[0.05] px-5 py-4 last:border-b-0 hover:bg-white/[0.02]"
                  >
                    {/* Notification */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-300">
                        {item.notifications?.title ?? "Untitled notification"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                        {item.notifications?.message ?? "No message"}
                      </p>

                      {item.notifications?.type && (
                        <p className="mt-1 font-mono text-[10px] text-slate-700">
                          {item.notifications.type}
                        </p>
                      )}
                    </div>

                    {/* Channel */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] capitalize ${channelClasses(
                          item.channel,
                        )}`}
                      >
                        <span>
                          {channelIcon(item.channel)}
                        </span>

                        {item.channel.replaceAll("_", " ")}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] capitalize ${statusClasses(
                          item.status,
                        )}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    {/* Attempts */}
                    <p className="text-sm text-slate-400">
                      {item.attempts}
                    </p>

                    {/* Created */}
                    <p className="text-xs leading-5 text-slate-600">
                      {formatDate(item.created_at)}
                    </p>

                    {/* Error */}
                    <div className="min-w-0">
                      {item.error_message ? (
                        <p className="line-clamp-2 text-xs leading-5 text-rose-300/80">
                          {item.error_message}
                        </p>
                      ) : (
                        <span className="text-xs text-slate-700">
                          No errors
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile / tablet */}
              <div className="space-y-3 lg:hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/10 text-sm text-slate-400">
                        {channelIcon(item.channel)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {item.notifications?.title ??
                                "Untitled notification"}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-700">
                              {item.notifications?.type ??
                                "notification"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] capitalize ${statusClasses(
                              item.status,
                            )}`}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">
                          {item.notifications?.message ??
                            "No message"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Channel
                        </p>

                        <p className="mt-1 truncate text-xs capitalize text-slate-400">
                          {item.channel.replaceAll("_", " ")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Attempts
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-300">
                          {item.attempts}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5 sm:col-span-2">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Created
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    {item.error_message ? (
                      <div className="mt-3 rounded-xl border border-rose-400/10 bg-rose-400/[0.04] px-3 py-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-rose-400/60">
                          Delivery error
                        </p>

                        <p className="mt-1 text-xs leading-5 text-rose-300/80">
                          {item.error_message}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                        <span className="text-[11px] text-slate-700">
                          Delivery status
                        </span>

                        <span className="text-[11px] text-emerald-300/70">
                          No errors
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* Delivery architecture */}
        {/* -------------------------------------------------- */}

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                Communication layer
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                Notification → Delivery → Customer
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                TISA Global keeps notification creation separate from
                channel delivery so individual delivery failures can be
                monitored without losing the original notification.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["Create", "01"],
                ["Deliver", "02"],
                ["Track", "03"],
              ].map(([label, number]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.07] bg-black/10 px-4 py-3 text-center"
                >
                  <p className="text-[9px] font-semibold tracking-[0.16em] text-slate-700">
                    {number}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Footer */}
        {/* -------------------------------------------------- */}

        <section className="mt-8 border-t border-white/[0.06] pt-5">
          <div className="flex flex-col gap-2 text-xs leading-5 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p>TISA Global communication operations</p>

            <p>
              In-app · Email · WhatsApp-ready
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}