import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventAdminActions from "@/components/admin/EventAdminActions";

function formatUpdateType(value: string | null | undefined) {
  if (!value) return "General update";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not verified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminEventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  // ------------------------------------------------------------
  // Authentication
  // ------------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ------------------------------------------------------------
  // Authorization
  // ------------------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  // ------------------------------------------------------------
  // Event
  // ------------------------------------------------------------

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // ------------------------------------------------------------
  // Trusted Sources
  // ------------------------------------------------------------

  const { data: sources, error: sourcesError } = await supabase
    .from("event_sources")
    .select("*")
    .eq("event_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (sourcesError) {
    console.error("Admin event sources query error:", {
      message: sourcesError.message,
      code: sourcesError.code,
      details: sourcesError.details,
      hint: sourcesError.hint,
    });
  }

  // ------------------------------------------------------------
  // Event Updates
  // ------------------------------------------------------------

  const { data: updates, error: updatesError } = await supabase
    .from("event_updates")
    .select(
      `
        id,
        event_id,
        update_type,
        old_value,
        new_value,
        source_url,
        verified_at,
        created_at
      `
    )
    .eq("event_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (updatesError) {
    console.error("Admin event updates query error:", {
      message: updatesError.message,
      code: updatesError.code,
      details: updatesError.details,
      hint: updatesError.hint,
    });
  }

  // ------------------------------------------------------------
  // Invitation Intelligence
  // ------------------------------------------------------------

  const { data: invitation, error: invitationError } =
    await supabase
      .from("event_invitations")
      .select("*")
      .eq("event_id", id)
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (invitationError) {
    console.error("Admin event invitation query error:", {
      message: invitationError.message,
      code: invitationError.code,
      details: invitationError.details,
      hint: invitationError.hint,
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <Link
          href="/admin/events"
          className="text-sm text-sky-400 transition hover:text-sky-300"
        >
          ← Events
        </Link>

        {/* ======================================================
            EVENT + ACTIONS
        ====================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Event information */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
              {event.verification_status}
            </p>

            <h1 className="mt-3 text-3xl font-semibold text-white">
              {event.title}
            </h1>

            <p className="mt-3 text-slate-400">
              {[event.city, event.country]
                .filter(Boolean)
                .join(", ")}
            </p>

            {/* Event metadata */}

            <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">
                  Dates
                </p>

                <p className="mt-1 text-white">
                  {event.start_date || "TBC"}

                  {event.end_date
                    ? ` — ${event.end_date}`
                    : ""}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Organizer
                </p>

                <p className="mt-1 text-white">
                  {event.organizer_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Registration
                </p>

                <p className="mt-1 text-white">
                  {event.registration_status || "—"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">
                  Last verified
                </p>

                <p className="mt-1 text-white">
                  {event.last_verified_at
                    ? formatDateTime(
                        event.last_verified_at
                      )
                    : "Not verified"}
                </p>
              </div>
            </div>

            {/* Description */}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-400">
                {event.description ||
                  "No description."}
              </p>
            </div>
          </section>

          {/* Event actions */}

          <EventAdminActions
            eventId={event.id}
            currentVerification={
              event.verification_status
            }
          />
        </div>

        {/* ======================================================
            SOURCES + INVITATION
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Trusted Sources */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
                Evidence
              </p>

              <h2 className="mt-2 font-semibold text-white">
                Sources
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Sources used to verify this event.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {(sources ?? []).map((source) => (
                <div
                  key={source.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-white">
                      {source.source_name}
                    </p>

                    {source.is_primary && (
                      <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                        Primary
                      </span>
                    )}
                  </div>

                  <p className="mt-1 break-all text-xs text-sky-300">
                    {source.source_url}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {source.source_type}

                    {" · "}

                    {source.last_verified_at
                      ? formatDateTime(
                          source.last_verified_at
                        )
                      : "Not verified"}
                  </p>
                </div>
              ))}

              {!sources?.length && (
                <div className="rounded-2xl border border-dashed border-white/10 p-5">
                  <p className="text-sm text-slate-500">
                    No sources recorded yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Invitation Intelligence */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
                Travel assistance
              </p>

              <h2 className="mt-2 font-semibold text-white">
                Invitation intelligence
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Information related to invitation
                assistance for this event.
              </p>
            </div>

            {invitation ? (
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">
                    Availability
                  </p>

                  <p className="mt-1 text-white">
                    {invitation.availability ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Invitation type
                  </p>

                  <p className="mt-1 text-white">
                    {invitation.invitation_type ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Eligibility
                  </p>

                  <p className="mt-1 text-white">
                    {invitation.eligibility ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Requirements
                  </p>

                  <p className="mt-1 leading-6 text-slate-400">
                    {invitation.requirements ||
                      "No requirements recorded."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5">
                <p className="text-sm text-slate-500">
                  No invitation information recorded.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ======================================================
            EVENT UPDATE HISTORY
        ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky-400">
                Event intelligence
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Update history
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Verified changes and important updates
                recorded for this event.
              </p>
            </div>

            {updates && updates.length > 0 && (
              <span className="text-xs text-slate-600">
                {updates.length}{" "}
                {updates.length === 1
                  ? "update"
                  : "updates"}
              </span>
            )}
          </div>

          {/* No updates */}

          {!updates?.length ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-slate-500">
                ↻
              </div>

              <p className="mt-4 text-sm font-medium text-white">
                No event updates yet
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Verified event changes will appear here
                after they are added from the operations
                panel.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {(updates ?? []).map((update) => (
                <article
                  key={update.id}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  {/* Header */}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                          {formatUpdateType(
                            update.update_type
                          )}
                        </span>

                        {update.verified_at && (
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                            Verified
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-slate-600">
                        Added{" "}
                        {formatDateTime(
                          update.created_at
                        )}
                      </p>
                    </div>

                    {update.verified_at && (
                      <p className="shrink-0 text-xs text-slate-600">
                        Verified{" "}
                        {formatDateTime(
                          update.verified_at
                        )}
                      </p>
                    )}
                  </div>

                  {/* Change comparison */}

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {/* Previous */}

                    <div className="rounded-xl border border-white/5 bg-black/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-600">
                        Previous information
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-400">
                        {update.old_value ||
                          "No previous information recorded."}
                      </p>
                    </div>

                    {/* New */}

                    <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.025] p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-500/70">
                        New information
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white">
                        {update.new_value}
                      </p>
                    </div>
                  </div>

                  {/* Source */}

                  {update.source_url && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-600">
                        Source
                      </p>

                      <a
                        href={update.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-xs text-sky-300 transition hover:text-sky-200"
                      >
                        {update.source_url}
                      </a>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}