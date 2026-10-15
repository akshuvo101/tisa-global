import type { DestinationDetails } from "@/lib/data/destination-details";

type CostEstimateProps = {
  details: DestinationDetails;
};

export default function CostEstimate({
  details,
}: CostEstimateProps) {
  const { estimatedCost } = details;

  const costRows = [
    {
      label: "Flights",
      range: estimatedCost.flight,
    },
    {
      label: "Accommodation",
      range: estimatedCost.accommodation,
    },
    {
      label: "Food",
      range: estimatedCost.food,
    },
    {
      label: "Local transport",
      range: estimatedCost.transport,
    },
    {
      label: "Activities",
      range: estimatedCost.activities,
    },
    {
      label: "Visa & fees",
      range: estimatedCost.visaAndFees,
    },
    {
      label: "Travel insurance",
      range: estimatedCost.insurance,
    },
    {
      label: "Miscellaneous",
      range: estimatedCost.misc,
    },
  ];

  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          {/* Header */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              Estimated cost
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              How much might it cost?
            </h2>

            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Get a reasonable planning range for the major expenses of your
              trip.
            </p>

            <div className="mt-6 rounded-2xl border border-primary/15 bg-primary-soft p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Planning range
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                {formatRange(estimatedCost.total)}
              </p>

              <p className="mt-1 text-xs text-muted">
                {estimatedCost.total.period === "per_day"
                  ? "Estimated per day"
                  : "Estimated for the trip"}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="divide-y divide-border">
                {costRows.map((row) => (
                  <CostRow
                    key={row.label}
                    label={row.label}
                    range={row.range}
                  />
                ))}

                <div className="flex items-center justify-between gap-6 bg-surface-light px-5 py-5 sm:px-6">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Estimated total
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {estimatedCost.total.period === "per_day"
                        ? "Per day"
                        : "For the full trip"}
                    </p>
                  </div>

                  <p className="text-base font-semibold text-primary sm:text-lg">
                    {formatRange(estimatedCost.total)}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-muted">
              {estimatedCost.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CostRow({
  label,
  range,
}: {
  label: string;
  range: {
    currency: string;
    min: number;
    max: number;
    period: "per_day" | "per_trip";
  };
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4 sm:px-6">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>

        <p className="mt-1 text-[11px] text-muted">
          {range.period === "per_day" ? "Per day" : "Per trip"}
        </p>
      </div>

      <p className="text-sm font-medium text-white">
        {formatRange(range)}
      </p>
    </div>
  );
}

function formatRange(range: {
  currency: string;
  min: number;
  max: number;
}) {
  return `${range.currency} ${formatNumber(range.min)}–${formatNumber(
    range.max,
  )}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD").format(value);
}