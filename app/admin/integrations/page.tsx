"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Source = {
  key: string;
  name: string;
  kind: string;
  enabled: boolean;
  configured: boolean;
  description: string;
};

type Run = {
  id: string;
  provider: string;
  kind: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  records_found: number;
  records_created: number;
  records_updated: number;
  records_skipped: number;
  error_message: string | null;
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
    case "completed":
    case "success":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "running":
    case "processing":
      return "border-sky-400/20 bg-sky-400/10 text-sky-300";

    case "failed":
    case "error":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";

    case "skipped":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-400";
  }
}

function sourceIcon(kind: string) {
  const value = kind.toLowerCase();

  if (value.includes("http") || value.includes("json")) {
    return "↔";
  }

  if (value.includes("api")) {
    return "⌘";
  }

  if (value.includes("webhook")) {
    return "⚡";
  }

  if (value.includes("social")) {
    return "◎";
  }

  return "◇";
}

function SourceCard({
  source,
  syncing,
  onSync,
}: {
  source: Source;
  syncing: boolean;
  onSync: () => void;
}) {
  const canSync =
    source.key === "http-json-events" &&
    source.configured &&
    source.enabled;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] transition hover:border-white/[0.13] hover:bg-white/[0.035]">
      {/* subtle top accent */}
      <div
        className={[
          "absolute inset-x-0 top-0 h-px",
          source.configured
            ? "bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"
            : "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        ].join(" ")}
      />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg",
                source.configured
                  ? "border-sky-400/15 bg-sky-400/10 text-sky-300"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-500",
              ].join(" ")}
            >
              {sourceIcon(source.kind)}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-white">
                {source.name}
              </h2>

              <p className="mt-1 truncate font-mono text-[10px] text-slate-600">
                {source.key}
              </p>
            </div>
          </div>

          <span
            className={[
              "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium",
              source.configured
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/20 bg-amber-400/10 text-amber-300",
            ].join(" ")}
          >
            {source.configured ? "Configured" : "Not configured"}
          </span>
        </div>

        {/* Description */}
        <p className="mt-5 min-h-[48px] text-sm leading-6 text-slate-500">
          {source.description}
        </p>

        {/* Metadata */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/[0.07] bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-wide text-slate-500">
            {source.kind}
          </span>

          <span
            className={[
              "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide",
              source.enabled
                ? "border-sky-400/15 bg-sky-400/[0.06] text-sky-300/80"
                : "border-white/[0.07] bg-white/[0.02] text-slate-600",
            ].join(" ")}
          >
            {source.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {/* Action */}
        {source.key === "http-json-events" && (
          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <button
              type="button"
              onClick={onSync}
              disabled={!canSync || syncing}
              className={[
                "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition",
                canSync && !syncing
                  ? "bg-sky-400 text-slate-950 hover:bg-sky-300"
                  : "cursor-not-allowed border border-white/[0.07] bg-white/[0.025] text-slate-600",
              ].join(" ")}
            >
              {syncing ? (
                <>
                  <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Syncing…
                </>
              ) : (
                <>
                  <span className="mr-2">↻</span>
                  Sync events
                </>
              )}
            </button>

            {!source.configured && (
              <p className="mt-2 text-[11px] text-slate-600">
                Configure this source before running a sync.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
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

export default function AdminIntegrationsPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/integrations", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Unable to load integrations.",
        );
      }

      setSources(data.data?.sources ?? []);
      setRuns(data.data?.runs ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load integrations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function syncEvents() {
    try {
      setSyncing(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/admin/integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sync_events",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error?.message || "Sync failed.",
        );
      }

      setMessage(
        `Sync ${data.data?.status ?? "completed"}. ${
          data.data?.stats?.recordsFound ?? 0
        } records found.`,
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to run event sync.",
      );
    } finally {
      setSyncing(false);
    }
  }

  const stats = useMemo(() => {
    const configured = sources.filter(
      (source) => source.configured,
    ).length;

    const enabled = sources.filter(
      (source) => source.enabled,
    ).length;

    const successfulRuns = runs.filter(
      (run) =>
        run.status === "completed" ||
        run.status === "success",
    ).length;

    const failedRuns = runs.filter(
      (run) =>
        run.status === "failed" ||
        run.status === "error",
    ).length;

    const recordsProcessed = runs.reduce(
      (total, run) =>
        total +
        (run.records_created || 0) +
        (run.records_updated || 0),
      0,
    );

    return {
      configured,
      enabled,
      successfulRuns,
      failedRuns,
      recordsProcessed,
    };
  }, [sources, runs]);

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
                  Integrations
                </span>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-400">
                  Operations
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Integrations
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Manage external data sources and keep TISA Global&apos;s
                  event intelligence synchronized, validated, and ready
                  for verification.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
                  Data policy
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  External data never publishes directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* Alerts */}
        {/* -------------------------------------------------- */}

        {(message || error) && (
          <section className="mt-6">
            <div
              className={[
                "rounded-2xl border px-4 py-3 text-sm",
                error
                  ? "border-rose-400/15 bg-rose-400/[0.05] text-rose-300"
                  : "border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {error ? "!" : "✓"}
                </span>

                <p>{error || message}</p>
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------- */}
        {/* Metrics */}
        {/* -------------------------------------------------- */}

        <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label="Sources"
            value={sources.length}
            hint="Registered sources"
          />

          <MetricCard
            label="Configured"
            value={stats.configured}
            hint="Ready to connect"
            tone="success"
          />

          <MetricCard
            label="Enabled"
            value={stats.enabled}
            hint="Active integrations"
          />

          <MetricCard
            label="Successful"
            value={stats.successfulRuns}
            hint="Recent successful runs"
            tone="success"
          />

          <MetricCard
            label="Failed"
            value={stats.failedRuns}
            hint="Runs needing attention"
            tone={
              stats.failedRuns > 0
                ? "danger"
                : "default"
            }
          />
        </section>

        {/* -------------------------------------------------- */}
        {/* Source section */}
        {/* -------------------------------------------------- */}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Connected sources
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                External providers available to the TISA Global data
                pipeline.
              </p>
            </div>

            <span className="text-xs text-slate-600">
              {sources.length}{" "}
              {sources.length === 1
                ? "source"
                : "sources"}
            </span>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-[280px] animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.02]"
                />
              ))}
            </div>
          ) : sources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-slate-600">
                ◇
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No integration sources
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                No external providers are currently registered.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sources.map((source) => (
                <SourceCard
                  key={source.key}
                  source={source}
                  syncing={syncing}
                  onSync={syncEvents}
                />
              ))}
            </div>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* Data pipeline */}
        {/* -------------------------------------------------- */}

        <section className="mt-8 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                Verification pipeline
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                External data → TISA verification
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Imported records are normalized and stored before they
                can become publicly visible or be used by TISA&apos;s AI
                assistant.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Source", "01"],
                ["Normalize", "02"],
                ["Verify", "03"],
                ["Publish", "04"],
              ].map(([label, number]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.07] bg-black/10 px-3 py-3 text-center"
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
        {/* Sync runs */}
        {/* -------------------------------------------------- */}

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent sync activity
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Monitor imported records and integration health.
              </p>
            </div>

            {stats.recordsProcessed > 0 && (
              <p className="text-xs text-slate-600">
                {stats.recordsProcessed} records created or updated
              </p>
            )}
          </div>

          {loading ? (
            <div className="h-48 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.02]" />
          ) : runs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.09] bg-white/[0.015] px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-lg text-slate-600">
                ↻
              </div>

              <h3 className="mt-4 text-sm font-medium text-slate-300">
                No sync activity yet
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Integration runs will appear here after a source is
                synchronized.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] lg:block">
                <div className="grid grid-cols-[1.25fr_.9fr_.7fr_.7fr_.7fr_.8fr_1.15fr] gap-4 border-b border-white/[0.07] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  <span>Provider</span>
                  <span>Status</span>
                  <span>Found</span>
                  <span>Created</span>
                  <span>Updated</span>
                  <span>Skipped</span>
                  <span>Started</span>
                </div>

                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="grid grid-cols-[1.25fr_.9fr_.7fr_.7fr_.7fr_.8fr_1.15fr] gap-4 border-b border-white/[0.05] px-5 py-4 last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-300">
                        {run.provider}
                      </p>

                      <p className="mt-1 truncate font-mono text-[10px] text-slate-700">
                        {run.kind}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] capitalize ${statusClasses(
                          run.status,
                        )}`}
                      >
                        {statusLabel(run.status)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400">
                      {run.records_found}
                    </p>

                    <p className="text-sm text-emerald-300/80">
                      {run.records_created}
                    </p>

                    <p className="text-sm text-sky-300/80">
                      {run.records_updated}
                    </p>

                    <p className="text-sm text-slate-500">
                      {run.records_skipped}
                    </p>

                    <p className="text-xs leading-5 text-slate-600">
                      {formatDate(run.started_at)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile / tablet */}
              <div className="space-y-3 lg:hidden">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {run.provider}
                        </p>

                        <p className="mt-1 truncate font-mono text-[10px] text-slate-700">
                          {run.kind}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] capitalize ${statusClasses(
                          run.status,
                        )}`}
                      >
                        {statusLabel(run.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Found
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-300">
                          {run.records_found}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Created
                        </p>

                        <p className="mt-1 text-sm font-medium text-emerald-300">
                          {run.records_created}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Updated
                        </p>

                        <p className="mt-1 text-sm font-medium text-sky-300">
                          {run.records_updated}
                        </p>
                      </div>

                      <div className="rounded-xl bg-black/15 p-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-700">
                          Skipped
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-400">
                          {run.records_skipped}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
                      <span className="text-[11px] text-slate-600">
                        Started
                      </span>

                      <span className="text-[11px] text-slate-500">
                        {formatDate(run.started_at)}
                      </span>
                    </div>

                    {run.error_message && (
                      <div className="mt-3 rounded-xl border border-rose-400/10 bg-rose-400/[0.04] px-3 py-2 text-xs text-rose-300">
                        {run.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* Footer note */}
        {/* -------------------------------------------------- */}

        <section className="mt-8 border-t border-white/[0.06] pt-5">
          <div className="flex flex-col gap-2 text-xs leading-5 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
            <p>
              TISA Global integration layer
            </p>

            <p>
              Source → Normalize → Validate → Verify → Publish
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}