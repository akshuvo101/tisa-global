import type { DestinationDetails } from "@/lib/data/destination-details";

type DestinationOverviewProps = {
  details: DestinationDetails;
};

export default function DestinationOverview({
  details,
}: DestinationOverviewProps) {
  return (
    <section className="border-b border-border py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
              About the destination
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Get to know the place
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-muted sm:text-lg">
              {details.overview}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}