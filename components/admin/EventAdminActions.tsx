"use client";

import { useState } from "react";

type SourceState = {
  name: string;
  url: string;
  type: string;
};

type EventUpdateState = {
  type: string;
  oldValue: string;
  newValue: string;
  sourceUrl: string;
};

type Feedback = {
  type: "success" | "error";
  text: string;
} | null;

export default function EventAdminActions({
  eventId,
  currentVerification,
}: {
  eventId: string;
  currentVerification: string;
}) {
  // ------------------------------------------------------------
  // Verification
  // ------------------------------------------------------------

  const [status, setStatus] = useState(currentVerification);

  const [verificationSaving, setVerificationSaving] =
    useState(false);

  const [verificationFeedback, setVerificationFeedback] =
    useState<Feedback>(null);

  // ------------------------------------------------------------
  // Trusted Source
  // ------------------------------------------------------------

  const [source, setSource] = useState<SourceState>({
    name: "",
    url: "",
    type: "Official Organizer",
  });

  const [sourceSaving, setSourceSaving] = useState(false);

  const [sourceFeedback, setSourceFeedback] =
    useState<Feedback>(null);

  // ------------------------------------------------------------
  // Event Update
  // ------------------------------------------------------------

  const [eventUpdate, setEventUpdate] =
    useState<EventUpdateState>({
      type: "general_update",
      oldValue: "",
      newValue: "",
      sourceUrl: "",
    });

  const [updateSaving, setUpdateSaving] = useState(false);

  const [updateFeedback, setUpdateFeedback] =
    useState<Feedback>(null);

  // ------------------------------------------------------------
  // Verification
  // ------------------------------------------------------------

  async function verify() {
    if (
      verificationSaving ||
      sourceSaving ||
      updateSaving
    ) {
      return;
    }

    setVerificationSaving(true);
    setVerificationFeedback(null);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "verify",
            verification_status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error?.message ||
            "Unable to update verification."
        );
      }

      setVerificationFeedback({
        type: "success",
        text: "Verification status updated successfully.",
      });
    } catch (error) {
      setVerificationFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to update verification.",
      });
    } finally {
      setVerificationSaving(false);
    }
  }

  // ------------------------------------------------------------
  // Add Trusted Source
  // ------------------------------------------------------------

  async function addSource() {
    if (
      verificationSaving ||
      sourceSaving ||
      updateSaving
    ) {
      return;
    }

    const name = source.name.trim();
    const url = source.url.trim();

    setSourceFeedback(null);

    if (!name || !url) {
      setSourceFeedback({
        type: "error",
        text: "Source name and URL are required.",
      });

      return;
    }

    try {
      new URL(url);
    } catch {
      setSourceFeedback({
        type: "error",
        text: "Please enter a valid source URL.",
      });

      return;
    }

    setSourceSaving(true);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "source",
            source_name: name,
            source_url: url,
            source_type: source.type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error?.message ||
            "Unable to add source."
        );
      }

      setSource({
        name: "",
        url: "",
        type: "Official Organizer",
      });

      setSourceFeedback({
        type: "success",
        text: "Trusted source added successfully.",
      });

      window.location.reload();
    } catch (error) {
      setSourceFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to add trusted source.",
      });
    } finally {
      setSourceSaving(false);
    }
  }

  // ------------------------------------------------------------
  // Add Event Update
  // ------------------------------------------------------------

  async function addEventUpdate() {
    if (
      verificationSaving ||
      sourceSaving ||
      updateSaving
    ) {
      return;
    }

    const oldValue = eventUpdate.oldValue.trim();
    const newValue = eventUpdate.newValue.trim();
    const sourceUrl = eventUpdate.sourceUrl.trim();

    setUpdateFeedback(null);

    // New information is required.
    if (!newValue) {
      setUpdateFeedback({
        type: "error",
        text: "New information is required.",
      });

      return;
    }

    // Source is required because event updates are
    // publicly readable when the event is verified.
    if (!sourceUrl) {
      setUpdateFeedback({
        type: "error",
        text:
          "A source URL is required before publishing an event update.",
      });

      return;
    }

    // Validate source URL.
    try {
      new URL(sourceUrl);
    } catch {
      setUpdateFeedback({
        type: "error",
        text: "Please enter a valid source URL.",
      });

      return;
    }

    setUpdateSaving(true);

    try {
      const response = await fetch(
        `/api/admin/events/${eventId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            update_type: eventUpdate.type,
            old_value: oldValue || null,
            new_value: newValue,
            source_url: sourceUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error?.message ||
            "Unable to add event update."
        );
      }

      setEventUpdate({
        type: "general_update",
        oldValue: "",
        newValue: "",
        sourceUrl: "",
      });

      setUpdateFeedback({
        type: "success",
        text: "Event update added successfully.",
      });

      // Refresh the server-rendered event detail page
      // so the update history becomes visible immediately.
      window.location.reload();
    } catch (error) {
      setUpdateFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to add event update.",
      });
    } finally {
      setUpdateSaving(false);
    }
  }

  // ------------------------------------------------------------
  // Shared busy state
  // ------------------------------------------------------------

  const busy =
    verificationSaving ||
    sourceSaving ||
    updateSaving;

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      {/* ======================================================
          EVENT VERIFICATION
      ====================================================== */}

      <section>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
            Event verification
          </p>

          <h2 className="mt-2 font-semibold text-white">
            Verification controls
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Verify the event only after confirming its
            information from a trusted source.
          </p>
        </div>

        <label className="mt-5 block text-sm text-slate-300">
          Verification status

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setVerificationFeedback(null);
            }}
            disabled={busy}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="unverified">
              Unverified
            </option>

            <option value="under_review">
              Under review
            </option>

            <option value="verified">
              Verified
            </option>

            <option value="needs_reverification">
              Needs reverification
            </option>

            <option value="expired">
              Expired
            </option>
          </select>
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void verify()}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verificationSaving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />

              Updating verification…
            </>
          ) : (
            "Update verification"
          )}
        </button>

        {verificationFeedback && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-3 rounded-xl border px-3 py-3 text-xs leading-5 ${
              verificationFeedback.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                : "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-sm">
              {verificationFeedback.type === "success"
                ? "✓"
                : "!"}
            </span>

            <span>
              {verificationFeedback.text}
            </span>
          </div>
        )}
      </section>

      {/* ======================================================
          TRUSTED SOURCES
      ====================================================== */}

      <section className="mt-8 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
            Evidence
          </p>

          <h3 className="mt-2 font-semibold text-white">
            Add trusted source
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Add the website or source used to verify this
            event.
          </p>
        </div>

        <input
          value={source.name}
          onChange={(event) => {
            setSource((current) => ({
              ...current,
              name: event.target.value,
            }));

            setSourceFeedback(null);
          }}
          disabled={busy}
          placeholder="Source name"
          className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <input
          value={source.url}
          onChange={(event) => {
            setSource((current) => ({
              ...current,
              url: event.target.value,
            }));

            setSourceFeedback(null);
          }}
          disabled={busy}
          placeholder="https://example.com"
          type="url"
          className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <select
          value={source.type}
          onChange={(event) => {
            setSource((current) => ({
              ...current,
              type: event.target.value,
            }));

            setSourceFeedback(null);
          }}
          disabled={busy}
          className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="Official Organizer">
            Official Organizer
          </option>

          <option value="Official Conference Website">
            Official Conference Website
          </option>

          <option value="Authorized Feed/API">
            Authorized Feed/API
          </option>

          <option value="Partner">
            Partner
          </option>

          <option value="Public Source">
            Public Source
          </option>

          <option value="Manual Research">
            Manual Research
          </option>
        </select>

        <button
          type="button"
          disabled={busy}
          onClick={() => void addSource()}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-4 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sourceSaving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />

              Adding source…
            </>
          ) : (
            "Add trusted source"
          )}
        </button>

        {sourceFeedback && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-3 rounded-xl border px-3 py-3 text-xs leading-5 ${
              sourceFeedback.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                : "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-sm">
              {sourceFeedback.type === "success"
                ? "✓"
                : "!"}
            </span>

            <span>
              {sourceFeedback.text}
            </span>
          </div>
        )}
      </section>

      {/* ======================================================
          EVENT UPDATES
      ====================================================== */}

      <section className="mt-8 border-t border-white/10 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
            Event intelligence
          </p>

          <h3 className="mt-2 font-semibold text-white">
            Add event update
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Record a verified change or important update
            about this event.
          </p>
        </div>

        {/* Update type */}

        <label className="mt-4 block text-sm text-slate-300">
          Update type

          <select
            value={eventUpdate.type}
            onChange={(event) => {
              setEventUpdate((current) => ({
                ...current,
                type: event.target.value,
              }));

              setUpdateFeedback(null);
            }}
            disabled={busy}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none transition focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="date_changed">
              Date changed
            </option>

            <option value="venue_changed">
              Venue changed
            </option>

            <option value="registration_opened">
              Registration opened
            </option>

            <option value="registration_deadline_changed">
              Registration deadline changed
            </option>

            <option value="organizer_update">
              Organizer update
            </option>

            <option value="invitation_update">
              Invitation update
            </option>

            <option value="general_update">
              General update
            </option>
          </select>
        </label>

        {/* Previous information */}

        <label className="mt-3 block text-sm text-slate-300">
          Previous information
          <span className="ml-1 text-xs text-slate-600">
            optional
          </span>

          <textarea
            value={eventUpdate.oldValue}
            onChange={(event) => {
              setEventUpdate((current) => ({
                ...current,
                oldValue: event.target.value,
              }));

              setUpdateFeedback(null);
            }}
            disabled={busy}
            placeholder="Example: 20–27 October 2026"
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        {/* New information */}

        <label className="mt-3 block text-sm text-slate-300">
          New information

          <textarea
            value={eventUpdate.newValue}
            onChange={(event) => {
              setEventUpdate((current) => ({
                ...current,
                newValue: event.target.value,
              }));

              setUpdateFeedback(null);
            }}
            disabled={busy}
            placeholder="Example: Event dates changed to 22–29 October 2026"
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        {/* Source URL */}

        <label className="mt-3 block text-sm text-slate-300">
          Source URL

          <input
            value={eventUpdate.sourceUrl}
            onChange={(event) => {
              setEventUpdate((current) => ({
                ...current,
                sourceUrl: event.target.value,
              }));

              setUpdateFeedback(null);
            }}
            disabled={busy}
            placeholder="https://official-event-website.com"
            type="url"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <p className="mt-2 text-[11px] leading-5 text-slate-600">
          A source URL is required because published event
          updates are visible to customers.
        </p>

        {/* Add update */}

        <button
          type="button"
          disabled={busy}
          onClick={() => void addEventUpdate()}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-white/[0.04] px-4 text-sm font-medium text-white ring-1 ring-inset ring-white/10 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateSaving ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />

              Adding event update…
            </>
          ) : (
            "Add event update"
          )}
        </button>

        {updateFeedback && (
          <div
            role="status"
            className={`mt-4 flex items-start gap-3 rounded-xl border px-3 py-3 text-xs leading-5 ${
              updateFeedback.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300"
                : "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
            }`}
          >
            <span className="mt-0.5 shrink-0 text-sm">
              {updateFeedback.type === "success"
                ? "✓"
                : "!"}
            </span>

            <span>
              {updateFeedback.text}
            </span>
          </div>
        )}
      </section>
    </aside>
  );
}