import type { Destination } from "@/types/destination";
import type { DestinationDetails } from "@/lib/data/destination-details";

type DestinationQuickFactsProps = {
  destination: Destination;
  details: DestinationDetails;
};

export default function DestinationQuickFacts({
  destination,
  details,
}: DestinationQuickFactsProps) {
  const duration = details.recommendedDuration;

  const durationText =
    duration.min === duration.max
      ? `${duration.min} days`
      : `${duration.min}–${duration.max} days`;

  const bestTimeText =
    details.bestTime.months.length > 0
      ? details.bestTime.months.join(", ")
      : "Flexible";

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <QuickFact
            label="Recommended duration"
            value={durationText}
          />

          <QuickFact
            label="Best time to visit"
            value={bestTimeText}
          />

          <QuickFact
            label="Location"
            value={
              destination.city
                ? `${destination.city}, ${destination.country}`
                : destination.country
            }
          />
        </div>
      </div>
    </section>
  );
}

function QuickFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="px-0 py-6 sm:px-8 lg:py-7">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}