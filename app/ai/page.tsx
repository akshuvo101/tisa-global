"use client";

import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Compass,
  FileText,
  GraduationCap,
  MapPin,
  Menu,
  Plane,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import type { AIResponse, TravelProfile } from "@/types/ai";

import { destinations } from "@/lib/data/destination";
import { getDestinationDetails } from "@/lib/data/destination-details";

import Navbar from "@/components/layout/Navbar";
import PageLoading from "@/components/layout/PageLoading";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ChatMessage =
  | {
      role: "user";
      content: string;
    }
  | {
      role: "assistant";
      content: string;
      data: AIResponse;
    };

function isFundingInquiry(
  messages: ChatMessage[],
  assistantIndex: number,
): boolean {
  const response = messages[assistantIndex];
  if (response?.role !== "assistant") return false;

  const lastUserMessage = messages
    .slice(0, assistantIndex)
    .reverse()
    .find((message) => message.role === "user");

  return (
    response.data.webResults?.some(
      (result) => result.category === "funding",
    ) === true ||
    (lastUserMessage?.role === "user" &&
      /\b(?:scholarships?|bursaries|funding|grants?|financial aid|fee waivers?|stipends?|fellowships?|student volunteer)\b|স্কলারশিপ|বৃত্তি|অর্থায়ন|অর্থায়ন|অনুদান|ফেলোশিপ|স্টাইপেন্ড/i.test(
        lastUserMessage.content,
      ))
  );
}

function getAssistantHistoryContent(message: Extract<ChatMessage, { role: "assistant" }>) {
  const visibleContext = {
    itinerary: message.data.itinerary.slice(0, 4).map((day) => ({
      day: day.day,
      title: day.title.slice(0, 100),
      activities: day.activities
        .slice(0, 2)
        .map((activity) => activity.slice(0, 120)),
    })),
    estimatedTotal: {
      currency: message.data.costEstimate.currency,
      ...message.data.costEstimate.total,
    },
    opportunities: message.data.webResults?.slice(0, 2).map((result) => ({
      title: result.title.slice(0, 120),
      category: result.category,
      status: result.status,
      deadline: result.deadline?.slice(0, 140) ?? null,
      eligibility: result.eligibility?.slice(0, 180) ?? null,
      funding: result.fundingCoverage?.slice(0, 120) ?? null,
      applicationUrl: result.applicationUrl?.slice(0, 240) ?? null,
      sourceUrl: result.sourceUrl.slice(0, 240),
    })),
    events: message.data.events.slice(0, 2).map((event) => ({
      title: event.title.slice(0, 120),
      date: event.startDate,
      sourceUrl: event.sourceUrl?.slice(0, 240) ?? null,
    })),
  };
  const hasVisibleContext =
    visibleContext.itinerary.length > 0 ||
    (visibleContext.opportunities?.length ?? 0) > 0 ||
    visibleContext.events.length > 0 ||
    message.data.costEstimate.total.min !== 0 ||
    message.data.costEstimate.total.max !== 0;

  return hasVisibleContext
    ? `${message.content.slice(0, 600)}\nPreviously shown plan and results: ${JSON.stringify(visibleContext)}`
    : message.content;
}

const starterCategories = [
  {
    title: "Trip Planning",
    description: "Shape a trip around your time, budget, and travel style.",
    icon: Plane,
    prompts: [
      "Plan a 5-day Japan trip from Dhaka for two people.",
      "Where can I travel from Dhaka on a ৳100,000 budget?",
    ],
  },
  {
    title: "Conferences & Events",
    description: "Discover upcoming conferences, events, and student opportunities.",
    icon: CalendarDays,
    prompts: [
      "Find future AI conferences in Asia with student registration for Bangladeshi undergraduates.",
      "Find future CS/AI conferences for Bangladeshi undergraduates and include paper requirements.",
    ],
  },
  {
    title: "Scholarships, Travel Grants & Fee Waivers",
    description: "Look for funding options and check their stated eligibility.",
    icon: GraduationCap,
    prompts: [
      "Find currently open CS/AI conference travel grants for Bangladeshi undergraduates.",
      "Find scholarships and fee waivers for Bangladesh undergraduate CS students, with eligibility and deadlines.",
    ],
  },
  {
    title: "Visa & Travel Documents",
    description: "Get a practical checklist and know what to confirm officially.",
    icon: FileText,
    prompts: [
      "What documents should I prepare for a Japan tourist visa from Bangladesh?",
      "What should I check before traveling to Singapore for a conference?",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Small UI helpers                                                           */
/* -------------------------------------------------------------------------- */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
      {children}
    </span>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-base">{icon}</span>

      <h3 className="text-sm font-semibold text-white">
        {children}
      </h3>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  const formatted = amount.toLocaleString();

  return currency === "BDT"
    ? `৳${formatted}`
    : `${currency} ${formatted}`;
}

type OpportunityResult = NonNullable<AIResponse["webResults"]>[number];

function WebOpportunityCards({
  results,
}: {
  results: OpportunityResult[];
}) {
  const statusStyles: Record<OpportunityResult["status"], string> = {
    open: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    upcoming: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    closed: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    not_applicable: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    eligibility_restricted:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    status_unconfirmed:
      "border-amber-400/20 bg-amber-400/10 text-amber-200",
  };
  const statusLabels: Record<OpportunityResult["status"], string> = {
    open: "Open",
    upcoming: "Upcoming",
    closed: "Closed",
    not_applicable: "Not a scholarship",
    eligibility_restricted: "Eligibility Restricted",
    status_unconfirmed: "Status unconfirmed",
  };
  const opportunityTypeLabels: Record<
    OpportunityResult["opportunityType"],
    string
  > = {
    undergraduate_scholarship: "Undergraduate scholarship",
    university_tuition_waiver: "University-specific tuition waiver (not necessarily a scholarship)",
    tuition_discount: "Tuition discount (not a scholarship)",
    graduate_funding: "Master's / PhD funding",
    conference_travel_grant: "Conference travel grant",
    gender_restricted: "Gender-restricted award",
    institution_restricted: "Institution-restricted award",
    tuition_policy: "Tuition / cost information (not a scholarship)",
    student_loan: "Student loan (not a scholarship)",
    other_funding: "Other funding",
  };

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      {results.map((result, index) => (
        <article
          key={`${result.url}-${index}`}
          className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface/55 p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="max-w-full rounded-full border border-primary/15 bg-primary-soft px-2.5 py-1 text-[10px] font-medium text-primary">
              {result.category === "funding"
                ? opportunityTypeLabels[result.opportunityType]
                : "Conference / event"}
            </span>
            <span
              className={`max-w-full rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusStyles[result.status]}`}
            >
              {statusLabels[result.status]}
            </span>
          </div>
          <h4 className="mt-3 min-w-0 text-sm font-semibold leading-6 text-foreground [overflow-wrap:anywhere]">
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary hover:underline"
            >
              {result.title}
            </a>
          </h4>
          <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted [overflow-wrap:anywhere]">
            {result.content || "Open the source for details."}
          </p>
          <p className="mt-3 text-xs leading-5 text-foreground/85">
            <span className="font-semibold">Status:</span> {result.statusReason}
          </p>
          {result.eventDate && (
            <p className="mt-2 text-xs leading-5 text-foreground/85">
              <span className="font-semibold">Event date:</span>{" "}
              {result.eventDate}
            </p>
          )}
          <p className="mt-2 text-xs leading-5 text-foreground/85">
            <span className="font-semibold">Deadline:</span>{" "}
            {result.deadline ?? "Not confirmed"}
          </p>
          <p className="mt-2 text-xs leading-5 text-foreground/85">
            <span className="font-semibold">Eligibility:</span>{" "}
            {result.eligibility ?? "Not confirmed"}
          </p>
          <p className="mt-2 text-xs leading-5 text-foreground/85">
            <span className="font-semibold">Eligible countries:</span>{" "}
            {result.eligibleCountries ?? "Not confirmed"}
          </p>
          <p className="mt-2 text-xs leading-5 text-foreground/85">
            <span className="font-semibold">Academic level:</span>{" "}
            {result.academicLevel ?? "Not confirmed"}
          </p>
          {result.category === "funding" && (
            <p className="mt-2 text-xs leading-5 text-foreground/85">
              <span className="font-semibold">CS/STEM eligibility:</span>{" "}
              {result.subjectEligibility ?? "Not confirmed"}
            </p>
          )}
          {result.opportunityType === "tuition_policy" && (
            <>
              <p className="mt-2 text-xs leading-5 text-foreground/85">
                <span className="font-semibold">Tuition fees:</span>{" "}
                {result.tuitionCost ?? "Not confirmed"}
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/85">
                <span className="font-semibold">Living costs:</span>{" "}
                {result.livingCost ?? "Not confirmed"}
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/85">
                <span className="font-semibold">Visa financial requirement:</span>{" "}
                {result.visaFinancialRequirement ?? "Not confirmed"}
              </p>
            </>
          )}
          {result.category === "conference" && (
            <>
              <p className="mt-2 text-xs leading-5 text-foreground/85">
                <span className="font-semibold">Student registration:</span>{" "}
                {result.registration ?? "Not confirmed"}
              </p>
              <p className="mt-2 text-xs leading-5 text-foreground/85">
                <span className="font-semibold">Paper requirements:</span>{" "}
                {result.paperRequirements ??
                  "Not confirmed"}
              </p>
            </>
          )}
          {result.category === "funding" && (
            <p className="mt-2 text-xs leading-5 text-foreground/85">
              <span className="font-semibold">Funding amount:</span>{" "}
              {result.fundingAmount ?? "Not confirmed"}
            </p>
          )}
          {result.category === "funding" && (
            <p className="mt-2 text-xs leading-5 text-foreground/85">
              <span className="font-semibold">Funding coverage:</span>{" "}
              {result.fundingCoverage ?? "Not confirmed"}
            </p>
          )}
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 max-w-full items-center gap-1.5 break-all text-xs font-medium text-primary hover:underline"
          >
            Source page: {result.sourceName}
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          </a>
          {result.category === "funding" && (
            <p className="mt-2 text-xs leading-5 text-foreground/85 [overflow-wrap:anywhere]">
              <span className="font-semibold">Official application link:</span>{" "}
              {result.applicationUrl ? (
                <a
                  href={result.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open application page
                </a>
              ) : (
                "Not confirmed"
              )}
            </p>
          )}
          {result.sourceRole === "primary_source_candidate" ? (
            <p className="mt-1 text-[10px] leading-4 text-muted">
              Primary-source candidate; source claims are not independently verified.
            </p>
          ) : (
            <p className="mt-1 text-[10px] leading-4 text-muted">
              Discovery source only; its claims do not confirm eligibility or deadlines.
            </p>
          )}
          <p className="mt-2 text-[10px] leading-4 text-muted">
            Last checked:{" "}
            {new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "UTC",
            }).format(new Date(result.lastCheckedAt))}{" "}
            UTC
          </p>
        </article>
      ))}
    </div>
  );
}

function FundingOpportunitySections({
  results,
}: {
  results: OpportunityResult[];
}) {
  if (results.length === 0) return null;

  const potentialMatches = results.filter(
    (result) =>
      result.opportunityType === "undergraduate_scholarship" &&
      result.sourceRole === "primary_source_candidate" &&
      result.targetFit === "confirmed" &&
      result.status !== "closed" &&
      result.status !== "eligibility_restricted",
  );
  const universityWaivers = results.filter(
    (result) =>
      result.opportunityType === "university_tuition_waiver" &&
      result.sourceRole === "primary_source_candidate",
  );
  const unverifiedLeads = results.filter(
    (result) =>
      !potentialMatches.includes(result) &&
      !universityWaivers.includes(result),
  );

  return (
    <div className="space-y-6">
      {potentialMatches.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
            Potential undergraduate matches
          </h4>
          <>
            <p className="mb-3 text-xs leading-5 text-muted">
              Retrieved official-page text appears to support the stated
              eligibility. Confirm current details with the provider.
            </p>
            <WebOpportunityCards results={potentialMatches} />
          </>
        </section>
      )}
      {universityWaivers.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
            University-specific tuition waivers
          </h4>
          <p className="mb-3 text-xs leading-5 text-muted">
            These are university-published tuition waivers, not necessarily
            scholarships. Missing eligibility or dates are not confirmed.
          </p>
          <WebOpportunityCards results={universityWaivers} />
        </section>
      )}
      {unverifiedLeads.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
            Related, unconfirmed results
          </h4>
          <p className="mb-3 text-xs leading-5 text-muted">
            Leads may include postgraduate awards, loans, tuition discounts,
            general tuition policies, restricted opportunities, and third-party
            pages. They are not confirmed undergraduate scholarship matches.
            Missing facts show as “Not confirmed.”
          </p>
          <WebOpportunityCards results={unverifiedLeads} />
        </section>
      )}
    </div>
  );
}

function ScholarshipNextSteps() {
  return (
    <div>
      <SectionTitle icon="→">Scholarship next steps</SectionTitle>
      <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5">
        <ul className="space-y-3">
          {[
            "Open the source page and confirm the current application cycle and deadline.",
            "Check that Bangladeshi undergraduate Computer Science students meet the country, degree-level, and subject criteria.",
            "Confirm the award coverage, required documents, and any institution, gender, or conference restrictions.",
            "Apply only through an application link published by the scholarship provider.",
          ].map((action) => (
            <li
              key={action}
              className="flex gap-3 text-sm leading-6 text-slate-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {action}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AssistantSidebar({
  profile,
  onNavigate,
}: {
  profile: TravelProfile;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-5 xl:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Your workspace
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
          Travel, thoughtfully planned.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Explore ideas, shape your itinerary, and get practical guidance for
          your next journey.
        </p>
      </div>

      <section
        aria-labelledby="assistant-current-trip"
        className="assistant-trip-card relative mt-7 overflow-hidden rounded-2xl border border-primary/20 p-4"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p
              id="assistant-current-trip"
              className="text-xs font-semibold text-primary"
            >
              CURRENT TRIP
            </p>
            <MapPin aria-hidden="true" className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 min-w-0 whitespace-normal break-words text-lg font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">
            {profile.destination ?? "A journey starts here"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted">
            {profile.destination
              ? "Your trip details update as you plan with TISA AI."
              : "Choose a destination or tell TISA AI what you have in mind."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.departureCity && (
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80">
                From {profile.departureCity}
              </span>
            )}
            {profile.durationDays && (
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80">
                {profile.durationDays} days
              </span>
            )}
            {profile.travelers && (
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80">
                {profile.travelers}{" "}
                {profile.travelers === 1 ? "traveler" : "travelers"}
              </span>
            )}
            {profile.budget && (
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-foreground/80">
                Budget {formatCurrency(profile.budget, profile.currency)}
              </span>
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        />
      </section>

      <nav aria-label="Travel planning" className="mt-7">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          Plan your journey
        </p>
        <div className="space-y-1">
          <div
            aria-current="page"
            className="flex min-h-12 items-center gap-3 rounded-xl border border-primary/15 bg-primary-soft/60 px-3 text-sm font-semibold text-foreground"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-background/70 text-primary">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
            </span>
            Travel assistant
          </div>
          <Link
            href="/explore"
            onClick={onNavigate}
            className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-light hover:text-foreground focus-visible:bg-surface-light"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/50 text-primary transition-colors group-hover:border-primary/20 group-hover:bg-primary-soft">
              <Compass aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="flex-1">Explore destinations</span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Link>
          <Link
            href="/planner"
            onClick={onNavigate}
            className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-surface-light hover:text-foreground focus-visible:bg-surface-light"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-background/50 text-primary transition-colors group-hover:border-primary/20 group-hover:bg-primary-soft">
              <Plane aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="flex-1">Trip planner</span>
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </Link>
        </div>
      </nav>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              A little more clarity
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Travel requirements can change. Confirm visa, entry, and pricing
            details with official sources before you go.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Travel profile UI                                                          */
/* -------------------------------------------------------------------------- */

function TravelProfileTags({
  profile,
}: {
  profile: TravelProfile;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {profile.destination && (
        <Tag>{profile.destination}</Tag>
      )}

      {profile.departureCity && (
        <Tag>From {profile.departureCity}</Tag>
      )}

      {profile.durationDays && (
        <Tag>{profile.durationDays} days</Tag>
      )}

      {profile.travelers && (
        <Tag>
          {profile.travelers}{" "}
          {profile.travelers === 1
            ? "traveler"
            : "travelers"}
        </Tag>
      )}

      {profile.budget && (
        <Tag>
          Budget{" "}
          {profile.currency === "BDT"
            ? "৳"
            : profile.currency}{" "}
          {profile.budget.toLocaleString()}
        </Tag>
      )}

      {profile.travelStyle && (
        <Tag>{profile.travelStyle}</Tag>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Planner URL                                                                */
/* -------------------------------------------------------------------------- */

function getPlannerUrl(data: AIResponse) {
  const profile = data.travelProfile;
  const params = new URLSearchParams();

  /* ---------------------------------------------------------------------- */
  /* Travel profile                                                         */
  /* ---------------------------------------------------------------------- */

  if (profile.destinationId) {
    params.set(
      "destination",
      profile.destinationId,
    );
  }

  if (profile.departureCity) {
    params.set(
      "departure",
      profile.departureCity,
    );
  }

  if (profile.travelers) {
    params.set(
      "travelers",
      String(profile.travelers),
    );
  }

  if (profile.durationDays) {
    params.set(
      "duration",
      String(profile.durationDays),
    );
  }

  if (profile.budget) {
    params.set(
      "budget",
      String(profile.budget),
    );
  }

  if (profile.travelStyle) {
    params.set(
      "style",
      profile.travelStyle,
    );
  }

  /* ---------------------------------------------------------------------- */
  /* AI total estimate                                                      */
  /* ---------------------------------------------------------------------- */

  if (data.costEstimate?.total) {
    const { min, max } =
      data.costEstimate.total;

    if (
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      min >= 0 &&
      max >= min
    ) {
      params.set(
        "estimateMin",
        String(min),
      );

      params.set(
        "estimateMax",
        String(max),
      );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* AI detailed cost breakdown                                             */
  /* ---------------------------------------------------------------------- */

  if (data.costEstimate) {
    const costEstimate = {
      currency:
        data.costEstimate.currency,

      total:
        data.costEstimate.total,

      flight:
        data.costEstimate.flight,

      accommodation:
        data.costEstimate.accommodation,

      food:
        data.costEstimate.food,

      transport:
        data.costEstimate.transport,

      activities:
        data.costEstimate.activities,

      visaAndFees:
        data.costEstimate.visaAndFees,

      note:
        data.costEstimate.note,
    };

    try {
      params.set(
        "costEstimate",
        JSON.stringify(costEstimate),
      );
    } catch {
      // Planner will fall back to the total estimate.
    }
  }

  /* ---------------------------------------------------------------------- */
  /* AI itinerary                                                           */
  /* ---------------------------------------------------------------------- */

  if (
    Array.isArray(data.itinerary) &&
    data.itinerary.length > 0
  ) {
    const itinerary =
      data.itinerary
        .slice(0, 30)
        .map((day) => ({
          day: day.day,
          title: day.title,

          activities:
            Array.isArray(day.activities)
              ? day.activities.slice(0, 8)
              : [],
        }));

    try {
      params.set(
        "itinerary",
        JSON.stringify(itinerary),
      );
    } catch {
      // Planner will use its fallback itinerary.
    }
  }

  /* ---------------------------------------------------------------------- */
  /* AI documents                                                           */
  /* ---------------------------------------------------------------------- */

  if (
    Array.isArray(data.documents) &&
    data.documents.length > 0
  ) {
    const documents =
      data.documents
        .slice(0, 10)
        .map((document) => ({
          name: document.name,
          description:
            document.description,
          status: document.status,
        }));

    try {
      params.set(
        "documents",
        JSON.stringify(documents),
      );
    } catch {
      // Planner will use an empty document list.
    }
  }

  const query = params.toString();

  return query
    ? `/planner?${query}`
    : "/planner";
}

/* -------------------------------------------------------------------------- */
/* AI Page                                                                    */
/* -------------------------------------------------------------------------- */

export default function AIPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading your travel assistant" />}>
      <AIPageContent />
    </Suspense>
  );
}

function AIPageContent() {
  const searchParams = useSearchParams();

  const destinationId =
    searchParams.get("destination");

  const initialPrompt =
    searchParams.get("prompt")?.trim() ?? "";

  /* ------------------------------------------------------------------------ */
  /* Destination context                                                      */
  /* ------------------------------------------------------------------------ */

  const destination = useMemo(
    () =>
      destinations.find(
        (item) => item.id === destinationId,
      ) ?? null,
    [destinationId],
  );

  const destinationDetails = useMemo(
    () =>
      destinationId
        ? getDestinationDetails(destinationId)
        : null,
    [destinationId],
  );

  /**
   * Destination-specific knowledge sent to the AI.
   */
  const destinationContext = useMemo(() => {
    if (!destination || !destinationDetails) {
      return undefined;
    }

    return {
      id: destination.id,
      name: destination.name,
      country: destination.country,
      city: destination.city,
      description: destination.description,
      categories: destination.category,
      bestTimeToVisit:
        destination.bestTimeToVisit,
      recommendedDays:
        destination.recommendedDays,

      overview: destinationDetails.overview,

      bestTime: destinationDetails.bestTime,

      estimatedCost:
        destinationDetails.estimatedCost,

      visaAndDocuments:
        destinationDetails.visaAndDocuments,

      thingsToDo:
        destinationDetails.thingsToDo,

      travelTips:
        destinationDetails.travelTips,

      howToGetThere:
        destinationDetails.howToGetThere,
    };
  }, [destination, destinationDetails]);

  /* ------------------------------------------------------------------------ */
  /* Travel profile                                                           */
  /* ------------------------------------------------------------------------ */

  const [travelProfile, setTravelProfile] =
    useState<TravelProfile>(() => ({
      destination:
        destination?.name ?? null,

      destinationId:
        destination?.id ?? null,

      departureCity:
        searchParams
          .get("departure")
          ?.trim() || "Dhaka",

      travelers: getPositiveNumber(
        searchParams.get("travelers"),
        1,
        20,
        1,
      ),

      durationDays: getPositiveNumber(
        searchParams.get("duration"),
        1,
        30,
        null,
      ),

      budget: getPositiveNumber(
        searchParams.get("budget"),
        0,
        Number.MAX_SAFE_INTEGER,
        null,
      ),

      currency: "BDT",

      travelStyle: getTravelStyle(
        searchParams.get("style"),
      ),

      language: "bn",
    }));

  const syncedDestinationRef = useRef(destination);

  if (syncedDestinationRef.current !== destination) {
    syncedDestinationRef.current = destination;
    setTravelProfile((current) => ({
      ...current,
      destination: destination?.name ?? null,
      destinationId: destination?.id ?? null,
    }));
  }

  /* ------------------------------------------------------------------------ */
  /* Conversation state                                                       */
  /* ------------------------------------------------------------------------ */

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const shellRef = useRef<HTMLElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const sidebarTriggerRef = useRef<HTMLButtonElement>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  const sidebarWasOpenRef = useRef(false);

  const promptSentRef =
    useRef(false);

  useEffect(() => {
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const shell = shellRef.current;
    const navbar = document.querySelector("header");
    const viewport = window.visualViewport;

    const updateViewport = () => {
      if (!shell) return;
      const viewportHeight = Math.floor(
        Math.min(
          viewport?.height ?? window.innerHeight,
          window.innerHeight,
        ),
      );
      shell.style.setProperty(
        "--assistant-viewport-height",
        `${viewportHeight}px`,
      );
      shell.style.setProperty(
        "--assistant-navbar-height",
        `${navbar?.getBoundingClientRect().height ?? 72}px`,
      );
    };

    updateViewport();
    viewport?.addEventListener("resize", updateViewport);
    viewport?.addEventListener("scroll", updateViewport);
    window.addEventListener("resize", updateViewport);

    const observer = navbar
      ? new ResizeObserver(updateViewport)
      : null;
    if (navbar) observer?.observe(navbar);

    return () => {
      document.documentElement.style.overflow =
        previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      viewport?.removeEventListener("resize", updateViewport);
      viewport?.removeEventListener("scroll", updateViewport);
      window.removeEventListener("resize", updateViewport);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const conversation = conversationRef.current;
    conversation?.scrollTo({
      top: conversation.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [messages.length, loading]);

  useEffect(() => {
    const textarea = composerRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [message]);

  useEffect(() => {
    if (!sidebarOpen) {
      if (sidebarWasOpenRef.current) {
        sidebarTriggerRef.current?.focus();
      }
      sidebarWasOpenRef.current = false;
      return;
    }

    sidebarWasOpenRef.current = true;
    sidebarCloseRef.current?.focus();

    const handleDrawerKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const drawer = document.getElementById("assistant-sidebar-dialog");
      const focusable = drawer?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable?.[0];
      const last = focusable?.[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleDrawerKeyboard);
    return () => window.removeEventListener("keydown", handleDrawerKeyboard);
  }, [sidebarOpen]);

  /* ------------------------------------------------------------------------ */
  /* Send message                                                             */
  /* ------------------------------------------------------------------------ */

  const sendMessage = useCallback(
    async (content?: string) => {
      const text = (
        content ?? message
      ).trim();

      if (!text || loading) {
        return;
      }

      setMessage("");
      setError("");

      const userMessage: ChatMessage = {
        role: "user",
        content: text,
      };

      setMessages((current) => [
        ...current,
        userMessage,
      ]);

      setLoading(true);

      try {
        /*
         * Keep only recent conversation turns
         * to control prompt size and Gemini usage.
         */
        const history = messages
          .slice(-8)
          .map((item) => ({
            role: item.role,
            content:
              item.role === "assistant"
                ? getAssistantHistoryContent(item)
                : item.content,
          }));

        const response = await fetch(
          "/api/ai",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message: text,
              context: travelProfile,
              destinationContext,
              history,
              language:
                travelProfile.language,
            }),
          },
        );

        const data: AIResponse | {
          error: string;
        } = await response.json();

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "Something went wrong.",
          );
        }

        if ("error" in data) {
          throw new Error(data.error);
        }

        setTravelProfile(
          data.travelProfile,
        );

        const assistantMessage: ChatMessage =
          {
            role: "assistant",
            content: data.message,
            data,
          };

        setMessages((current) => [
          ...current,
          assistantMessage,
        ]);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to TISA AI.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      destinationContext,
      loading,
      message,
      messages,
      travelProfile,
    ],
  );

  /* ------------------------------------------------------------------------ */
  /* Initial prompt                                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !initialPrompt ||
      promptSentRef.current
    ) {
      return;
    }

    promptSentRef.current = true;

    void sendMessage(initialPrompt);
  }, [initialPrompt, sendMessage]);

  /* ------------------------------------------------------------------------ */
  /* Form submit                                                              */
  /* ------------------------------------------------------------------------ */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void sendMessage();
  }

  /* ------------------------------------------------------------------------ */
  /* Starter prompts                                                          */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Navbar useWideBreakpoint />
      <main
        ref={shellRef}
        className="assistant-experience flex min-h-0 w-full flex-col overflow-hidden bg-background text-foreground"
        style={{
          height:
            "calc(var(--assistant-viewport-height, 100dvh) - var(--assistant-navbar-height, 72px))",
        }}
      >
        <div className="relative mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden border-x border-border">
          <aside className="assistant-sidebar hidden w-[280px] shrink-0 border-r border-border bg-surface/35 xl:block 2xl:w-[304px]">
            <AssistantSidebar profile={travelProfile} />
          </aside>

          {sidebarOpen && (
            <div className="absolute inset-0 z-30 xl:hidden">
              <button
                type="button"
                aria-label="Close travel sidebar"
                onClick={() => setSidebarOpen(false)}
                className="absolute inset-0 h-full w-full bg-slate-950/60 backdrop-blur-[2px]"
              />
              <aside
                id="assistant-sidebar-dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Travel planning sidebar"
                className="assistant-sidebar-drawer absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col border-r border-border bg-surface shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Travel workspace
                  </span>
                  <button
                    ref={sidebarCloseRef}
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close travel sidebar"
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted transition hover:bg-surface-light hover:text-foreground"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <AssistantSidebar
                  profile={travelProfile}
                  onNavigate={() => setSidebarOpen(false)}
                />
              </aside>
            </div>
          )}

          <section
            aria-label="TISA Global travel assistant"
            inert={sidebarOpen}
            className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            {/* Conversation */}
            <div
              ref={conversationRef}
              aria-label="Conversation"
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-4 [scrollbar-gutter:stable] min-[375px]:px-4 sm:px-6 sm:py-6 xl:px-8 xl:py-8"
            >
              <div className="assistant-context-toolbar sticky top-0 z-10 -mx-3 mb-4 flex min-h-12 items-center px-3 py-1.5 min-[375px]:-mx-4 min-[375px]:px-4 sm:-mx-6 sm:px-6 xl:hidden">
                <button
                  ref={sidebarTriggerRef}
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open travel sidebar"
                  aria-expanded={sidebarOpen}
                  aria-controls="assistant-sidebar-dialog"
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border/80 bg-surface/80 px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-surface-light xl:hidden"
                >
                  <Menu aria-hidden="true" className="h-4 w-4 text-primary" />
                  <span>Trip tools</span>
                </button>
              </div>
              {messages.length === 0 ? (
                <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col py-4 min-[375px]:py-5 sm:py-8">
                  <div className="mb-6 text-center min-[375px]:mb-7 sm:mb-9">
                    <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-primary/20 bg-primary-soft text-primary shadow-[0_12px_36px_rgba(8,126,155,0.1)]">
                      <Sparkles aria-hidden="true" className="h-6 w-6" />
                    </div>

                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                      Your next chapter starts here
                    </p>
                    <h3 className="mx-auto max-w-4xl text-[clamp(1.5rem,4vw,2.5rem)] font-semibold tracking-tight text-foreground">
                      {destination
                        ? `Let’s plan ${destination.name} and what comes next`
                        : "Travel further. Find your next opportunity."}
                    </h3>

                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted min-[375px]:text-[15px]">
                      Plan a memorable trip, discover conferences and funding,
                      or get clear on the documents you’ll need. Start with a
                      prompt below or ask anything.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                    {starterCategories.map((category) => {
                      const Icon = category.icon;

                      return (
                        <section
                          key={category.title}
                          className="group min-w-0 rounded-2xl border border-border bg-surface/55 p-3.5 transition-colors hover:border-primary/25 hover:bg-surface/80 min-[375px]:p-4 sm:p-5"
                          aria-label={category.title}
                        >
                          <div className="mb-4 flex items-start gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary-soft text-primary">
                              <Icon aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                              <h4 className="break-words text-sm font-semibold leading-5 text-foreground">
                                {category.title}
                              </h4>
                              <p className="mt-1 text-xs leading-5 text-muted">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            {category.prompts.map((prompt) => (
                              <button
                                key={prompt}
                                type="button"
                                onClick={() => void sendMessage(prompt)}
                                disabled={loading}
                                className="group/prompt flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/45 px-3 py-2.5 text-left text-xs leading-5 text-foreground/85 transition-colors hover:border-primary/25 hover:bg-primary-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[13px]"
                              >
                                <span>{prompt}</span>
                                <ArrowRight
                                  aria-hidden="true"
                                  className="h-4 w-4 shrink-0 text-primary opacity-70 transition-transform group-hover/prompt:translate-x-0.5 group-hover/prompt:opacity-100"
                                />
                              </button>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  <p className="mt-5 break-words text-center text-[11px] leading-5 text-muted">
                    Live web results are unverified. Check the original sources
                    for current deadlines, eligibility, and travel requirements.
                  </p>
                </div>
              ) : (
                <div className="mx-auto w-full max-w-5xl space-y-6 pb-3 sm:space-y-8 sm:pb-5">
                  {messages.map(
                    (item, index) => (
                      <div
                        key={`${item.role}-${index}`}
                        className={
                          item.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >
                        {item.role === "user" ? (
                          <div className="max-w-[96%] break-words rounded-2xl rounded-br-md border border-primary/15 bg-primary-soft/70 px-3.5 py-3 sm:max-w-[85%] sm:px-5 sm:py-4 [overflow-wrap:anywhere]">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                              {item.content}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full min-w-0 max-w-5xl">
                            <div className="mb-3 flex items-center gap-2">
                              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
                                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                              </div>

                              <span className="text-xs font-medium text-muted">
                                TISA AI
                              </span>
                            </div>

                            <div className="space-y-6">
                              {/* AI message */}
                              <p aria-live="polite" className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground/85 sm:text-[15px] sm:leading-8">
                                {item.content}
                              </p>

                              {/* Trip context */}
                              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 min-[375px]:p-4 sm:p-5">
                                <SectionTitle icon="🧭">
                                  Trip context
                                </SectionTitle>

                                <TravelProfileTags
                                  profile={
                                    item.data
                                      .travelProfile
                                  }
                                />
                              </div>

                              {/* Recommendations */}
                              {item.data
                                .recommendations
                                .length > 0 && (
                                <div>
                                  <SectionTitle icon="✨">
                                    Suggestions
                                  </SectionTitle>

                                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                                    {item.data.recommendations.map(
                                      (
                                        recommendation,
                                        recommendationIndex,
                                      ) => (
                                        <div
                                          key={`${recommendation.title}-${recommendationIndex}`}
                                          className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 min-[375px]:p-4 sm:p-5 [overflow-wrap:anywhere]"
                                        >
                                          <h4 className="break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">
                                            {
                                              recommendation.title
                                            }
                                          </h4>

                                          <p className="mt-2 break-words text-sm leading-6 text-slate-400 [overflow-wrap:anywhere]">
                                            {
                                              recommendation.description
                                            }
                                          </p>

                                          <p className="mt-3 break-words text-xs leading-5 text-sky-300/80 [overflow-wrap:anywhere]">
                                            {
                                              recommendation.reason
                                            }
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Live web results */}
                              {(item.data.webResults?.length ?? 0) > 0 ||
                                item.data.fundingSearchPerformed === true ? (
                                <section>
                                  <SectionTitle icon="🔎">
                                    Live web results
                                  </SectionTitle>
                                  <p className="-mt-2 mb-4 text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                                    External web sources are not verified by
                                    TISA. Undergraduate scholarships are listed
                                    separately from graduate funding, conference
                                    travel grants, and restricted awards.
                                    Confirm dates, eligibility, application
                                    status, and funding on each source page.
                                  </p>
                                  {item.data.webResults?.some(
                                    (result) => result.category === "funding",
                                  ) ||
                                    item.data.fundingSearchPerformed === true ? (
                                    <div className="mb-6">
                                      <FundingOpportunitySections
                                        results={
                                          item.data.webResults?.filter(
                                            (result) =>
                                              result.category === "funding",
                                          ) ?? []
                                        }
                                      />
                                    </div>
                                  ) : null}
                                  {item.data.webResults?.some(
                                    (result) =>
                                      result.category === "conference" &&
                                      result.status !== "eligibility_restricted" &&
                                      result.status !== "closed" &&
                                      result.relevance !== "other",
                                  ) && (
                                    <div className="mb-6">
                                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                                        Priority matches
                                      </h4>
                                      <WebOpportunityCards
                                        results={item.data.webResults.filter(
                                          (result) =>
                                            result.category === "conference" &&
                                            result.status !== "eligibility_restricted" &&
                                            result.status !== "closed" &&
                                            result.relevance !== "other",
                                        )}
                                      />
                                    </div>
                                  )}
                                  {item.data.webResults?.some(
                                    (result) =>
                                      result.category === "conference" &&
                                      (result.status === "eligibility_restricted" ||
                                        result.status === "closed"),
                                  ) && (
                                    <div className="mb-6">
                                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                                        Closed or eligibility-restricted
                                      </h4>
                                      <p className="mb-3 text-xs leading-5 text-muted">
                                        These are shown for context and are not
                                        primary recommendations.
                                      </p>
                                      <WebOpportunityCards
                                        results={item.data.webResults.filter(
                                          (result) =>
                                            result.category === "conference" &&
                                            (result.status === "eligibility_restricted" ||
                                              result.status === "closed"),
                                        )}
                                      />
                                    </div>
                                  )}
                                  {item.data.webResults?.some(
                                    (result) =>
                                      result.category === "conference" &&
                                      result.status !== "eligibility_restricted" &&
                                      result.status !== "closed" &&
                                      result.relevance === "other",
                                  ) && (
                                    <div>
                                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
                                        Other search matches
                                      </h4>
                                      <p className="mb-3 text-xs leading-5 text-muted">
                                        These results lack enough evidence of
                                        a close fit to the target profile.
                                      </p>
                                      <WebOpportunityCards
                                        results={item.data.webResults.filter(
                                          (result) =>
                                            result.category === "conference" &&
                                            result.status !== "eligibility_restricted" &&
                                            result.status !== "closed" &&
                                            result.relevance === "other",
                                        )}
                                      />
                                    </div>
                                  )}
                                </section>
                              ) : null}

                              {/* Verified events */}
                              {item.data.events.length > 0 && (
                                <div>
                                  <SectionTitle icon="📅">Verified events for you</SectionTitle>

                                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                                    {item.data.events.map((event) => (
                                      <div
                                        key={event.id}
                                        className="min-w-0 overflow-hidden rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5"
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                            Verified by TISA
                                          </span>
                                          {event.category && (
                                            <span className="text-[11px] text-slate-500">{event.category}</span>
                                          )}
                                        </div>
                                        <h4 className="mt-3 break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{event.title}</h4>
                                        <p className="mt-2 text-xs text-slate-500">
                                          {[event.city, event.country].filter(Boolean).join(", ") || "International"}
                                          {event.startDate ? ` · ${event.startDate}` : ""}
                                        </p>
                                        {event.invitationAvailability && (
                                          <p className="mt-2 text-xs text-slate-400">Invitation: {event.invitationAvailability}</p>
                                        )}
                                        <p className="mt-3 break-words text-xs leading-5 text-slate-400 [overflow-wrap:anywhere]">{event.reason}</p>
                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                          <Link href={`/events/${event.slug}`} className="text-xs font-medium text-sky-300">View event →</Link>
                                          {event.sourceUrl && (
                                            <a href={event.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-slate-300">Source</a>
                                          )}
                                        </div>
                                        {event.lastVerifiedAt && (
                                          <p className="mt-3 text-[10px] text-slate-600">Last verified {new Date(event.lastVerifiedAt).toLocaleDateString()}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Itinerary */}
                              {item.data
                                .itinerary
                                .length > 0 && (
                                <div>
                                  <SectionTitle icon="🗺️">
                                    Suggested itinerary
                                  </SectionTitle>

                                  <div className="space-y-3">
                                    {item.data.itinerary.map(
                                      (day) => (
                                        <div
                                          key={day.day}
                                          className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5"
                                        >
                                          <div className="flex gap-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/[0.08] text-xs font-semibold text-sky-300">
                                              {day.day}
                                            </div>

                                            <div className="min-w-0">
                                              <h4 className="break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">
                                                {
                                                  day.title
                                                }
                                              </h4>

                                              <ul className="mt-3 space-y-2">
                                                {day.activities.map(
                                                  (
                                                    activity,
                                                    activityIndex,
                                                  ) => (
                                                    <li
                                                      key={`${day.day}-${activityIndex}`}
                                                      className="flex min-w-0 gap-2 text-sm leading-6 text-slate-400 [overflow-wrap:anywhere]"
                                                    >
                                                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />

                                                      <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                                                        {
                                                          activity
                                                        }
                                                      </span>
                                                    </li>
                                                  ),
                                                )}
                                              </ul>
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Cost estimate */}
                              {!isFundingInquiry(messages, index) && (
                              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 min-[375px]:p-4 sm:p-5">
                                <SectionTitle icon="💰">
                                  Estimated cost
                                </SectionTitle>

                                <div className="mb-5 min-w-0 rounded-xl border border-sky-400/10 bg-sky-400/[0.04] p-3.5 min-[375px]:p-4">
                                  <p className="text-xs text-slate-500">
                                    Estimated total
                                  </p>

                                  <p className="mt-1 break-words text-xl font-semibold tracking-tight text-white min-[375px]:text-2xl [overflow-wrap:anywhere]">
                                    {formatCurrency(
                                      item.data
                                        .costEstimate
                                        .total
                                        .min,
                                      item.data
                                        .costEstimate
                                        .currency,
                                    )}{" "}
                                    –{" "}
                                    {formatCurrency(
                                      item.data
                                        .costEstimate
                                        .total
                                        .max,
                                      item.data
                                        .costEstimate
                                        .currency,
                                    )}
                                  </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  {[
                                    [
                                      "Flights",
                                      item.data
                                        .costEstimate
                                        .flight,
                                    ],
                                    [
                                      "Accommodation",
                                      item.data
                                        .costEstimate
                                        .accommodation,
                                    ],
                                    [
                                      "Food",
                                      item.data
                                        .costEstimate
                                        .food,
                                    ],
                                    [
                                      "Transport",
                                      item.data
                                        .costEstimate
                                        .transport,
                                    ],
                                    [
                                      "Activities",
                                      item.data
                                        .costEstimate
                                        .activities,
                                    ],
                                    [
                                      "Visa & fees",
                                      item.data
                                        .costEstimate
                                        .visaAndFees,
                                    ],
                                  ].map(
                                    ([label, range]) => {
                                      const cost =
                                        range as {
                                          min: number;
                                          max: number;
                                        };

                                      return (
                                        <div
                                          key={
                                            label as string
                                          }
                                          className="min-w-0 rounded-xl border border-white/[0.06] bg-black/10 p-3 [overflow-wrap:anywhere] min-[375px]:p-4"
                                        >
                                          <p className="text-xs text-slate-500">
                                            {
                                              label as string
                                            }
                                          </p>

                                          <p className="mt-1 break-words text-sm font-medium text-slate-200 [overflow-wrap:anywhere]">
                                            {formatCurrency(
                                              cost.min,
                                              item.data
                                                .costEstimate
                                                .currency,
                                            )}{" "}
                                            –{" "}
                                            {formatCurrency(
                                              cost.max,
                                              item.data
                                                .costEstimate
                                                .currency,
                                            )}
                                          </p>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>

                                <p className="mt-4 text-xs leading-5 text-slate-500">
                                  {
                                    item.data
                                      .costEstimate
                                      .note
                                  }
                                </p>
                              </div>
                              )}

                              {/* Documents */}
                              {item.data
                                .documents
                                .length > 0 && (
                                <div>
                                  <SectionTitle icon="📄">
                                    Documents &
                                    requirements
                                  </SectionTitle>

                                  <div className="space-y-3">
                                    {item.data.documents.map(
                                      (
                                        document,
                                        documentIndex,
                                      ) => (
                                        <div
                                          key={`${document.name}-${documentIndex}`}
                                          className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5"
                                        >
                                          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                              <h4 className="break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">
                                                {
                                                  document.name
                                                }
                                              </h4>

                                              <p className="mt-2 break-words text-sm leading-6 text-slate-400 [overflow-wrap:anywhere]">
                                                {
                                                  document.description
                                                }
                                              </p>
                                            </div>

                                            <span
                                              className={`max-w-full shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                document.status ===
                                                "likely"
                                                  ? "bg-emerald-400/10 text-emerald-300"
                                                  : document.status ===
                                                      "depends"
                                                    ? "bg-amber-400/10 text-amber-300"
                                                    : "bg-slate-400/10 text-slate-300"
                                              }`}
                                            >
                                              {
                                                document.status
                                              }
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Next actions */}
                              {isFundingInquiry(messages, index) ? (
                                <ScholarshipNextSteps />
                              ) : item.data
                                .nextActions
                                .length > 0 && (
                                <div>
                                  <SectionTitle icon="→">
                                    Next steps
                                  </SectionTitle>

                                  <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5">
                                    <ul className="space-y-3">
                                      {item.data.nextActions.map(
                                        (
                                          action,
                                          actionIndex,
                                        ) => (
                                          <li
                                            key={
                                              actionIndex
                                            }
                                            className="flex gap-3 text-sm leading-6 text-slate-400"
                                          >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />

                                            <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                                              {
                                                action
                                              }
                                            </span>
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              {/* Build this trip */}
                              {!isFundingInquiry(messages, index) && (
                              <div className="min-w-0 rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-400/[0.07] to-transparent p-3.5 [overflow-wrap:anywhere] min-[375px]:p-4 sm:p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-white">
                                      Ready to build this
                                      trip?
                                    </h3>

                                    <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
                                      Continue with this
                                      destination, budget,
                                      duration, travelers,
                                      travel style, cost
                                      estimate, documents,
                                      and AI itinerary in
                                      the Trip Planner.
                                    </p>
                                  </div>

                                  <a
                                    href={getPlannerUrl(
                                      item.data,
                                    )}
                                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300 md:w-auto"
                                  >
                                    Build this trip
                                    <span className="ml-2">
                                      →
                                    </span>
                                  </a>
                                </div>
                              </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}

                  {/* Loading */}
                  {loading && (
                    <div className="flex justify-start">
                      <div role="status" className="w-full max-w-5xl">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary-soft text-primary">
                            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                          </div>

                          <span className="text-xs font-medium text-slate-400">
                            TISA AI
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 py-2">
                          <span className="sr-only">TISA AI is preparing a response</span>
                          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-primary/60" />

                          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:150ms]" />

                          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-primary/60 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div role="alert" className="mx-auto mt-6 w-full max-w-5xl break-words rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 [overflow-wrap:anywhere]">
                  <p className="text-sm leading-6 text-red-600 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="assistant-composer z-10 shrink-0 border-t border-border bg-background/95 px-2.5 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur min-[375px]:px-3 min-[375px]:pt-3 sm:px-6 sm:py-4 xl:px-8">
              <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-5xl"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface/70 p-2 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 sm:gap-3">
                  <textarea
                    ref={composerRef}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (!loading) {
                          void sendMessage();
                        }
                      }
                    }}
                    rows={1}
                    aria-label="Message TISA AI"
                    placeholder="Ask about trips, conferences, funding, or travel documents..."
                    className="max-h-[min(35dvh,180px)] min-h-11 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:line-clamp-2 placeholder:text-muted sm:px-3"
                  />

                  <button
                    type="submit"
                    disabled={
                      !message.trim() ||
                      loading
                    }
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-background transition duration-200 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                    aria-label="Send message"
                  >
                    <Send aria-hidden="true" className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <p className="assistant-composer-note mt-2 hidden text-center text-[11px] leading-5 text-muted sm:block">
                  TISA AI provides travel
                  guidance. Verify current visa,
                  entry, pricing, and legal
                  requirements with official
                  sources.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getPositiveNumber(
  value: string | null,
  min: number,
  max: number,
  fallback: number | null = null,
) {
  if (
    value === null ||
    value.trim() === ""
  ) {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  if (number < min || number > max) {
    return fallback;
  }

  return number;
}

function getTravelStyle(
  value: string | null,
): TravelProfile["travelStyle"] {
  if (
    value === "budget" ||
    value === "balanced" ||
    value === "comfort" ||
    value === "luxury"
  ) {
    return value;
  }

  return null;
}