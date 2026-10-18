import type { ReactNode } from "react";

export default function PortalPageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="portal-page-header relative isolate mb-7 flex flex-col gap-5 overflow-hidden rounded-[22px] border border-border bg-surface/90 p-5 shadow-[0_16px_44px_rgba(1,9,17,0.13)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(ellipse_at_90%_20%,rgba(89,217,232,0.13),transparent_68%),radial-gradient(ellipse_at_70%_100%,rgba(169,154,248,0.08),transparent_65%)] sm:block"
      />
      <div className="relative min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-[2rem]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
      {children && (
        <div className="relative flex shrink-0 flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </header>
  );
}
