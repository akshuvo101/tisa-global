import { Check, Clock3, FileWarning, CircleDashed } from "lucide-react";

const successStates = new Set([
  "accepted",
  "approved",
  "completed",
  "confirmed",
  "received",
  "travel_ready",
]);
const attentionStates = new Set([
  "expired",
  "need_documents",
  "needs_attention",
  "on_hold",
  "rejected",
  "required",
]);

export default function PortalStatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const normalized = status.toLowerCase().replaceAll(" ", "_");
  const tone = successStates.has(normalized)
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200"
    : attentionStates.has(normalized)
      ? "border-amber-400/25 bg-amber-400/10 text-amber-800 dark:text-amber-200"
      : normalized === "cancelled"
        ? "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-200"
        : "border-primary/20 bg-primary-soft text-primary";
  const Icon = successStates.has(normalized)
    ? Check
    : attentionStates.has(normalized)
      ? FileWarning
      : normalized === "requested" || normalized === "reviewing" || normalized === "processing"
        ? Clock3
        : CircleDashed;
  const text = label ?? status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${tone}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}
