import type { DestinationDetails } from "@/lib/data/destination-details";

type TravelTipsProps = {
  details: DestinationDetails;
};

export default function TravelTips({
  details,
}: TravelTipsProps) {
  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Travel tips
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Helpful things to know
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            A few practical considerations to help you prepare for your trip.
          </p>
        </div>

        {/* Tips */}
        {details.travelTips.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {details.travelTips.map((tip, index) => (
              <TravelTip
                key={`${tip.title}-${index}`}
                title={tip.title}
                description={tip.description}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
            <p className="text-sm text-muted">
              Travel tips for this destination will be added soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function TravelTip({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/20">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}