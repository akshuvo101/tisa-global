import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

export default function PortalEmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-border bg-surface/70 px-5 py-9 text-center sm:px-8">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-primary/15 bg-primary-soft text-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-foreground">
        {emoji ? `${emoji} ` : ""}
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {action.label}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
