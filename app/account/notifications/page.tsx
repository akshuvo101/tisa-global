"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <main className="mx-auto max-w-4xl">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
            Your updates
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Stay up to date
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Updates from the TISA team about your requests, documents, and
            quotes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void markAsRead()}
          disabled={!items.some((item) => !item.read)}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/10 px-4 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all read
        </button>
      </section>

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
          {items.length ? (
            items.map((item) => (
              <article
                key={item.id}
                className={`rounded-2xl border p-5 ${
                  item.read
                    ? "border-white/[0.07] bg-white/[0.02]"
                    : "border-sky-300/20 bg-sky-300/[0.045]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {item.message}
                    </p>
                    <p className="mt-2 text-[11px] text-slate-600">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => void markAsRead(item.id)}
                      className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-sky-300 transition hover:bg-sky-300/10 hover:text-sky-100"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                {item.related_request_id && (
                  <Link
                    href={`/account/requests/${item.related_request_id}`}
                    className="mt-4 inline-flex text-xs font-medium text-sky-300 transition hover:text-white"
                  >
                    View request <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
              <h2 className="text-sm font-medium text-slate-200">
                No notifications yet
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                New updates about your TISA journeys will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-white/[0.07] bg-[#0c131d] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">
          Notification preferences
        </h2>
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
