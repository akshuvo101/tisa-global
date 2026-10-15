import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";

import DestinationHero from "@/components/destinations/DestinationHero";
import DestinationQuickFacts from "@/components/destinations/DestinationQuickFacts";
import DestinationOverview from "@/components/destinations/DestinationOverview";
import GettingThere from "@/components/destinations/GettingThere";
import BestTimeToVisit from "@/components/destinations/BestTimeToVisit";
import CostEstimate from "@/components/destinations/CostEstimate";
import VisaDocuments from "@/components/destinations/VisaDocuments";
import ThingsToDo from "@/components/destinations/ThingsToDo";
import TravelTips from "@/components/destinations/TravelTips";
import DestinationAICTA from "@/components/destinations/DestinationAICTA";

import { destinations } from "@/lib/data/destination";
import { getDestinationDetails } from "@/lib/data/destination-details";

type DestinationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { id } = await params;

  const destination = destinations.find(
    (item) => item.id === id,
  );

  const details = getDestinationDetails(id);

  if (!destination || !details) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <DestinationHero destination={destination} />

      {/* Quick Facts */}
      <DestinationQuickFacts
        destination={destination}
        details={details}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 py-20 lg:grid-cols-[1fr_340px]">
          {/* Main Column */}
          <div className="min-w-0">
            <DestinationOverview details={details} />

            <GettingThere details={details} />

            <BestTimeToVisit details={details} />

            <CostEstimate details={details} />

            <VisaDocuments details={details} />

            <ThingsToDo details={details} />

            <TravelTips details={details} />

            <DestinationAICTA destination={destination} />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Ready to go?
              </p>

              <h2 className="mt-3 text-xl font-semibold text-white">
                Build your trip to {destination.name}
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                Tell TISA Global your departure city, travelers, duration, and
                budget. We&apos;ll turn the destination into a practical trip
                plan.
              </p>

              <Link
                href={`/planner?destination=${destination.id}`}
                className="mt-6 flex h-12 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
              >
                Plan My Trip
              </Link>

              <Link
                href={`/ai?destination=${destination.id}`}
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl border border-primary/15 bg-primary-soft text-sm font-medium text-primary"
              >
                <span>✦</span>
                Ask TISA AI
              </Link>

              {/* Save button is already available in DestinationHero */}
            </div>

            <div className="mt-4 rounded-3xl border border-border bg-surface-light p-6">
              <p className="text-sm font-medium text-white">
                Travel smarter
              </p>

              <p className="mt-2 text-xs leading-5 text-muted">
                Destination information, prices, availability, and entry
                requirements can change. Always verify important travel
                information before booking.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}