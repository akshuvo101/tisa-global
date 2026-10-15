import type { DestinationDetails } from "@/lib/data/destination-details";

type GettingThereProps = {
  details: DestinationDetails;
};

export default function GettingThere({
  details,
}: GettingThereProps) {
  const duration = details.recommendedDuration;

  const durationText =
    duration.min === duration.max
      ? `${duration.min} days`
      : `${duration.min}–${duration.max} days`;

  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          eyebrow="Getting there"
          title="How to reach this destination"
          description="Understand the main travel options before you start planning your trip."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {details.howToGetThere.fromBangladesh.map((option) => (
            <TravelMethod
              key={`${option.type}-${option.title}`}
              type={option.type}
              title={option.title}
              description={option.description}
              estimatedDuration={option.estimatedDuration}
            />
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <InfoCard
            label="Local transport"
            title="Getting around"
            description={details.howToGetThere.localTransport}
          />

          <InfoCard
            label="Recommended stay"
            title="How long should you stay?"
            description={`TISA Global recommends around ${durationText} for this destination.`}
          />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
        {description}
      </p>
    </div>
  );
}

function TravelMethod({
  type,
  title,
  description,
  estimatedDuration,
}: {
  type: string;
  title: string;
  description: string;
  estimatedDuration?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/20">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg">
          {getTransportIcon(type)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              {title}
            </h3>

            {estimatedDuration && (
              <span className="rounded-full border border-border bg-surface-light px-2.5 py-1 text-[11px] text-muted">
                {estimatedDuration}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
        {label}
      </p>

      <h3 className="mt-3 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}

function getTransportIcon(type: string) {
  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("flight")) {
    return "✈️";
  }

  if (normalizedType.includes("train")) {
    return "🚆";
  }

  if (normalizedType.includes("bus")) {
    return "🚌";
  }

  if (normalizedType.includes("car")) {
    return "🚗";
  }

  if (normalizedType.includes("boat") || normalizedType.includes("ferry")) {
    return "⛴️";
  }

  return "🧭";
}