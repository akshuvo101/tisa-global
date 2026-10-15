import type { DestinationDetails } from "@/lib/data/destination-details";

type BestTimeToVisitProps = {
  details: DestinationDetails;
};

export default function BestTimeToVisit({
  details,
}: BestTimeToVisitProps) {
  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start lg:gap-16">
          {/* Heading */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Best time to visit
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              When should you go?
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Choose your travel dates based on the destination's typical
              seasons and conditions.
            </p>
          </div>

          {/* Content */}
          <div>
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <p className="text-base leading-7 text-muted">
                {details.bestTime.summary}
              </p>

              {details.bestTime.months.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                    Recommended months
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {details.bestTime.months.map((month) => (
                      <span
                        key={month}
                        className="rounded-full border border-primary/15 bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}