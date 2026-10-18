"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, BellRing, CalendarCheck2, FileCheck2, MessageCircle, Quote, type LucideIcon } from "lucide-react";
import PortalPageHeader from "@/components/account/PortalPageHeader";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  related_request_id: string | null;
  read: boolean;
  created_at: string;
};

type Preference = {
  id: string;
  notification_type: string;
  channel: string;
  enabled: boolean;
};

type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};

const preferenceTypes = [
  "request_message",
  "document_required",
  "document_status",
  "quote_ready",
  "quote_accepted",
  "booking_created",
  "booking_status",
  "travel_ready",
];

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = items.filter((item) => !item.read).length;
  const visibleItems =
    filter === "unread" ? items.filter((item) => !item.read) : items;

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/notifications");
        const result = (await response.json()) as ApiResult<Notification[]>;
        if (!response.ok || !result.success) {
          throw new Error(
            result.error?.message || "Unable to load notifications.",
          );
        }

        const preferenceResponse = await fetch(
          "/api/account/notification-preferences",
        );
        const preferenceResult = (await preferenceResponse.json()) as ApiResult<
          Preference[]
        >;
        if (!preferenceResponse.ok || !preferenceResult.success) {
          throw new Error(
            preferenceResult.error?.message ||
              "Unable to load notification preferences.",
          );
        }

        if (active) {
          setItems(result.data ?? []);
          setPreferences(preferenceResult.data ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load notifications.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  async function markAsRead(id?: string) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { mark_all: true }),
      });
      const result = (await response.json()) as ApiResult<never>;
      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Unable to update notifications.",
        );
      }

      setError("");
      setItems((current) =>
        id
          ? current.map((item) =>
              item.id === id ? { ...item, read: true } : item,
            )
          : current.map((item) => ({ ...item, read: true })),
      );
      window.dispatchEvent(new Event("tisa-notifications-updated"));
    } catch (markError) {
      setError(
        markError instanceof Error
          ? markError.message
          : "Unable to update notifications.",
      );
    }
  }

  async function togglePreference(type: string, channel: string) {
    try {
      const current = preferences.find(
        (item) =>
          item.notification_type === type && item.channel === channel,
      );
      const response = await fetch("/api/account/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notification_type: type,
          channel,
          enabled: current ? !current.enabled : false,
        }),
      });
      const result = (await response.json()) as ApiResult<Preference>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.error?.message ||
            "Unable to update notification preferences.",
        );
      }

      const updatedPreference = result.data;
      setError("");
      setPreferences((currentPreferences) => [
        ...currentPreferences.filter(
          (item) =>
            !(
              item.notification_type === type &&
              item.channel === channel
            ),
        ),
        updatedPreference,
      ]);
    } catch (preferenceError) {
      setError(
        preferenceError instanceof Error
          ? preferenceError.message
          : "Unable to update notification preferences.",
      );
    }
  }

  return (
    <main className="portal-page mx-auto max-w-4xl">
      <PortalPageHeader
        eyebrow="YOUR UPDATES"
        title="Stay up to date"
        description="Updates from the TISA team about your requests, documents, and quotes."
      >
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3.5 text-xs font-semibold text-primary">
          <BellRing aria-hidden="true" className="h-4 w-4" />
          {unreadCount} unread
        </span>
      </PortalPageHeader>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" aria-label="Filter notifications">
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium capitalize transition ${filter === value ? "border-primary/25 bg-primary-soft text-primary" : "border-border bg-surface/70 text-muted hover:text-foreground"}`}
            >
              {value === "all" ? "All updates" : "Unread"}
              <span className="rounded-md bg-background/50 px-1.5 py-0.5 tabular-nums">
                {value === "all" ? items.length : unreadCount}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void markAsRead()}
          disabled={unreadCount === 0}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface/80 px-4 text-xs font-medium text-foreground transition hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-7 rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="mt-8 space-y-3" aria-label="Loading notifications">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {visibleItems.length ? (
            visibleItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-[20px] border p-4 shadow-[0_8px_24px_rgba(1,9,17,0.1)] transition-colors sm:p-5 ${
                  item.read
                    ? "border-border bg-surface/80"
                    : "border-primary/25 bg-primary-soft/45"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${notificationTone(item.type)}`}>
                    {(() => {
                      const Icon = notificationIcon(item.type);
                      return <Icon aria-hidden="true" className="h-[18px] w-[18px]" />;
                    })()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                      <span className="rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] capitalize text-muted">{item.type.replaceAll("_", " ")}</span>
                      {!item.read && <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-950">New</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {item.message}
                    </p>
                    <p className="mt-2 text-[11px] text-muted">
                      {new Date(item.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  {item.related_request_id ? (
                    <Link href={`/account/requests/${item.related_request_id}`} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary transition hover:bg-primary-soft">
                      View request <span aria-hidden="true">→</span>
                    </Link>
                  ) : <span />}
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => void markAsRead(item.id)}
                      className="min-h-8 rounded-lg border border-primary/20 px-3 text-xs font-medium text-primary transition hover:bg-primary-soft"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-border bg-surface/50 px-6 py-9 text-center">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary"><Bell aria-hidden="true" className="h-5 w-5" /></span>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                {filter === "unread" ? "You’re all caught up" : "No notifications yet"}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted">
                {filter === "unread" ? "There are no unread updates. New journey news will appear here." : "New updates about your TISA journeys will appear here."}
              </p>
            </div>
          )}
        </div>
      )}

      <section className="mt-8 rounded-[20px] border border-border bg-surface/80 p-4 shadow-[0_8px_24px_rgba(1,9,17,0.1)] sm:p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-400/10 text-violet-700 dark:text-violet-200"><Bell aria-hidden="true" className="h-4 w-4" /></span>
          <div><h2 className="text-base font-semibold text-foreground">Notification preferences</h2><p className="mt-0.5 text-xs text-muted">Choose where optional updates reach you.</p></div>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Control optional email and WhatsApp updates. In-app notifications
          remain available.
        </p>
        <div className="mt-5 space-y-3">
          {preferenceTypes.map((type) => (
            <div
              key={type}
              className="flex flex-col gap-3 rounded-xl border border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm capitalize text-slate-300">
                {type.replaceAll("_", " ")}
              </span>
              <div className="flex gap-2">
                {(["email", "whatsapp"] as const).map((channel) => {
                  const preference = preferences.find(
                    (item) =>
                      item.notification_type === type &&
                      item.channel === channel,
                  );
                  const enabled = preference?.enabled !== false;
                  return (
                    <button
                      key={channel}
                      type="button"
                      aria-pressed={enabled}
                      onClick={() =>
                        void togglePreference(type, channel)
                      }
                      className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                        enabled
                          ? "border-sky-300/25 bg-sky-300/[0.05] text-sky-200"
                          : "border-white/10 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {channel}: {enabled ? "on" : "off"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function notificationIcon(type: string): LucideIcon {
  if (type.includes("message")) return MessageCircle;
  if (type.includes("document")) return FileCheck2;
  if (type.includes("quote")) return Quote;
  if (type.includes("booking") || type.includes("travel")) return CalendarCheck2;
  return Bell;
}

function notificationTone(type: string) {
  if (type.includes("document")) return "bg-amber-400/10 text-amber-700 dark:text-amber-200";
  if (type.includes("quote")) return "bg-violet-400/10 text-violet-700 dark:text-violet-200";
  if (type.includes("booking") || type.includes("travel")) return "bg-emerald-400/10 text-emerald-700 dark:text-emerald-200";
  return "bg-primary-soft text-primary";
}
