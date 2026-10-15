"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  country: "",
  city: "",
  venue: "",
  start_date: "",
  end_date: "",
  organizer_name: "",
  organizer_website: "",
  event_type: "",
  category: "",
  registration_status: "",
  registration_url: "",
};

export default function CreateEventForm() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function update(
    field: keyof typeof initialForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug:
        current.slug === "" ||
        current.slug === slugify(current.title)
          ? slugify(value)
          : current.slug,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.slug.trim()) {
      setMessage({
        type: "error",
        text: "Event title and slug are required.",
      });

      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage({
          type: "error",
          text:
            data?.error?.message ||
            "Unable to create the event.",
        });

        return;
      }

      setMessage({
        type: "success",
        text: "Event created successfully. Opening event operations...",
      });

      if (data.data?.id) {
        router.push(`/admin/events/${data.data.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Create event error:", error);

      setMessage({
        type: "error",
        text: "Something went wrong while creating the event.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic information */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-400">
            Event title *
          </label>

          <input
            value={form.title}
            onChange={(event) =>
              handleTitleChange(event.target.value)
            }
            placeholder="International Medical Conference 2027"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400">
            Slug *
          </label>

          <input
            value={form.slug}
            onChange={(event) =>
              update("slug", slugify(event.target.value))
            }
            placeholder="international-medical-conference-2027"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-400">
          Description
        </label>

        <textarea
          value={form.description}
          onChange={(event) =>
            update("description", event.target.value)
          }
          rows={4}
          placeholder="Describe the event, audience, purpose and important information..."
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
        />
      </div>

      {/* Location */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
          Location
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <input
            value={form.country}
            onChange={(event) =>
              update("country", event.target.value)
            }
            placeholder="Country"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <input
            value={form.city}
            onChange={(event) =>
              update("city", event.target.value)
            }
            placeholder="City"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <input
            value={form.venue}
            onChange={(event) =>
              update("venue", event.target.value)
            }
            placeholder="Venue"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>
      </div>

      {/* Dates */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
          Event dates
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-500">
              Start date
            </label>

            <input
              type="date"
              value={form.start_date}
              onChange={(event) =>
                update("start_date", event.target.value)
              }
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-sky-400/40"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500">
              End date
            </label>

            <input
              type="date"
              value={form.end_date}
              onChange={(event) =>
                update("end_date", event.target.value)
              }
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-sky-400/40"
            />
          </div>
        </div>
      </div>

      {/* Organizer */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
          Organizer
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <input
            value={form.organizer_name}
            onChange={(event) =>
              update("organizer_name", event.target.value)
            }
            placeholder="Organizer name"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <input
            type="url"
            value={form.organizer_website}
            onChange={(event) =>
              update("organizer_website", event.target.value)
            }
            placeholder="Organizer website"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>
      </div>

      {/* Classification */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
          Classification
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <input
            value={form.event_type}
            onChange={(event) =>
              update("event_type", event.target.value)
            }
            placeholder="Event type — Conference, Expo, Summit..."
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <input
            value={form.category}
            onChange={(event) =>
              update("category", event.target.value)
            }
            placeholder="Category — Medical, Technology, Business..."
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>
      </div>

      {/* Registration */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
          Registration
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <input
            value={form.registration_status}
            onChange={(event) =>
              update(
                "registration_status",
                event.target.value,
              )
            }
            placeholder="Registration status — Open, Closed, TBC..."
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />

          <input
            type="url"
            value={form.registration_url}
            onChange={(event) =>
              update("registration_url", event.target.value)
            }
            placeholder="Official registration URL"
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-600">
          New events are created as <span className="text-slate-400">draft</span>{" "}
          and <span className="text-slate-400">unverified</span>.
          Verify trusted sources before publishing.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create event"}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-rose-400/20 bg-rose-400/10 text-rose-300"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}