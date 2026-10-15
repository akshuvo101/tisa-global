import type { DestinationDetails } from "@/lib/data/destination-details";

type ThingsToDoProps = {
  details: DestinationDetails;
};

export default function ThingsToDo({
  details,
}: ThingsToDoProps) {
  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Things to do
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
            Make the most of your visit
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Explore some of the experiences and activities worth considering
            during your trip.
          </p>
        </div>

        {/* Activities */}
        {details.thingsToDo.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {details.thingsToDo.map((activity, index) => (
              <ActivityCard
                key={`${activity.title}-${index}`}
                title={activity.title}
                description={activity.description}
                category={activity.category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
            <p className="text-sm text-muted">
              Activities for this destination will be added soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ActivityCard({
  title,
  description,
  category,
  index,
}: {
  title: string;
  description: string;
  category: string;
  index: number;
}) {
  return (
    <article className="group rounded-2xl border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-semibold text-primary">
          {String(index + 1).padStart(2, "0")}
        </div>

        <span className="rounded-full border border-border bg-surface-light px-2.5 py-1 text-[11px] capitalize text-muted">
          {category}
        </span>
      </div>

      <h3 className="mt-6 text-base font-semibold text-white transition-colors group-hover:text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted">
        {description}
      </p>
    </article>
  );
}