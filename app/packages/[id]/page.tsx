import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPackageById, travelPackages } from "@/lib/data/packages";
import Navbar from "@/components/layout/Navbar";

type PackageDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return travelPackages.map((travelPackage) => ({
    id: travelPackage.id,
  }));
}

export default async function PackageDetailsPage({
  params,
}: PackageDetailsPageProps) {
  const { id } = await params;

  const packageData = getPackageById(id);

  if (!packageData) {
    notFound();
  }

  const currencySymbol =
    packageData.currency === "BDT"
      ? "৳"
      : packageData.currency;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
            <Link
              href="/packages"
              className="transition hover:text-white"
            >
              Packages
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-white/70">
              {packageData.title}
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div data-theme-contrast="dark" className="relative aspect-[16/7] min-h-[280px] overflow-hidden sm:min-h-[380px]">
              <Image
                src={packageData.imageUrl}
                alt={packageData.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {packageData.featured && (
                    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      Featured
                    </span>
                  )}

                  <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium capitalize text-white backdrop-blur-md">
                    {packageData.travelStyle}
                  </span>

                  {packageData.availability && (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur-md">
                      {packageData.availability}
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm font-medium uppercase tracking-[0.16em] text-white/60">
                  {packageData.country}
                </p>

                <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {packageData.title}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                  {packageData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left */}
          <div className="space-y-8">
            {/* Quick facts */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Duration
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {packageData.durationDays} days
                </p>
                <p className="mt-1 text-sm text-muted">
                  {packageData.durationNights} nights
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Departure
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {packageData.departureCity}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Starting point
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Travel style
                </p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">
                  {packageData.travelStyle}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Package style
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Visa assistance
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {packageData.visaAssistance
                    ? "Available"
                    : "Not included"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Confirm with provider
                </p>
              </div>
            </section>

            {/* Overview */}
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                About this package
              </h2>

              <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
                {packageData.description}
              </p>
            </section>

            {/* Itinerary */}
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
                  Day by day
                </p>

                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                  Itinerary
                </h2>
              </div>

              <div className="mt-7 space-y-0">
                {packageData.itinerary.map((day, index) => (
                  <div
                    key={day.day}
                    className="relative flex gap-5 pb-8 last:pb-0"
                  >
                    {index !== packageData.itinerary.length - 1 && (
                      <div className="absolute left-[15px] top-9 h-[calc(100%-20px)] w-px bg-border" />
                    )}

                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary-soft text-xs font-semibold text-primary">
                      {day.day}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {day.title}
                      </h3>

                      <ul className="mt-3 space-y-2">
                        {day.activities.map((activity) => (
                          <li
                            key={activity}
                            className="flex gap-2 text-sm leading-6 text-muted"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                            />
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Accommodation + transportation */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Stay
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Accommodation
                </h2>

                {packageData.accommodation ? (
                  <div className="mt-5">
                    <p className="text-base font-medium text-white">
                      {packageData.accommodation.name}
                    </p>

                    <p className="mt-2 text-sm text-muted">
                      {packageData.accommodation.nights} nights
                      {packageData.accommodation.roomType
                        ? ` · ${packageData.accommodation.roomType}`
                        : ""}
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    Accommodation details are not specified.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Getting around
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Transportation
                </h2>

                {packageData.transportation &&
                packageData.transportation.length > 0 ? (
                  <ul className="mt-5 space-y-3">
                    {packageData.transportation.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm leading-6 text-muted"
                      >
                        <span className="text-primary">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    Transportation details are not specified.
                  </p>
                )}
              </div>
            </section>

            {/* Inclusions / exclusions */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-400">
                  Included
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  What's included
                </h2>

                <ul className="mt-5 space-y-3">
                  {packageData.inclusions.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-muted"
                    >
                      <span className="mt-0.5 text-emerald-400">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-rose-400">
                  Not included
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  What's excluded
                </h2>

                <ul className="mt-5 space-y-3">
                  {packageData.exclusions.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-muted"
                    >
                      <span className="mt-0.5 text-rose-400">
                        ×
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Cancellation */}
            {packageData.cancellationPolicy && (
              <section className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
                <h2 className="text-lg font-semibold text-white">
                  Cancellation policy
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {packageData.cancellationPolicy}
                </p>
              </section>
            )}

            {/* Demo disclaimer */}
            <section className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-amber-300"
                >
                  !
                </span>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Please verify before booking
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-muted">
                    Package information, pricing, availability,
                    inclusions, visa assistance, and cancellation
                    terms shown here are demo/planning data. Confirm
                    the latest details directly with the relevant
                    travel provider before making any booking.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">
                  Package price
                </p>

                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight text-white">
                    {currencySymbol}{" "}
                    {packageData.price.toLocaleString()}
                  </span>

                  {packageData.pricePerPerson && (
                    <span className="pb-1 text-sm text-muted">
                      / person
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-muted">
                  Starting price · {packageData.departureCity}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href={`/planner?destination=${encodeURIComponent(
                      packageData.destinationId,
                    )}`}
                    className="flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-background transition hover:opacity-90"
                  >
                    Plan this trip
                  </Link>

                  <Link
                    href={`/ai?destination=${encodeURIComponent(
                      packageData.destinationId,
                    )}&prompt=${encodeURIComponent(
                      `Tell me if the ${packageData.title} package fits my trip and explain what I should verify before booking.`,
                    )}`}
                    className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                  >
                    Ask TISA AI
                  </Link>
                </div>

                <div className="my-6 h-px bg-border" />

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted">
                      Duration
                    </span>
                    <span className="text-right text-sm font-medium text-white">
                      {packageData.durationDays} days /{" "}
                      {packageData.durationNights} nights
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted">
                      Departure
                    </span>
                    <span className="text-right text-sm font-medium text-white">
                      {packageData.departureCity}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted">
                      Style
                    </span>
                    <span className="text-right text-sm font-medium capitalize text-white">
                      {packageData.travelStyle}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted">
                      Visa assistance
                    </span>
                    <span className="text-right text-sm font-medium text-white">
                      {packageData.visaAssistance
                        ? "Available"
                        : "Not included"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-border bg-surface-light p-4">
                  <p className="text-xs font-medium text-white">
                    Provided by
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    {packageData.agency.name}
                  </p>

                  {packageData.agency.description && (
                    <p className="mt-2 text-xs leading-5 text-muted">
                      {packageData.agency.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/packages"
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:bg-white/[0.04] hover:text-white"
            >
              ← Back to packages
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}