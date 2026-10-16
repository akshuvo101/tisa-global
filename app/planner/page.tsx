"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { destinations } from "@/lib/data/destination";
import Navbar from "@/components/layout/Navbar";
import PageLoading from "@/components/layout/PageLoading";
import { saveTrip } from "@/lib/trips/storage";
import type { SavedTrip } from "@/types/trip";

type TravelStyle =
  | "budget"
  | "balanced"
  | "comfort"
  | "luxury";

type PlannerItineraryDay = {
  day: number;
  title: string;
  description?: string;
  activities?: string[];
};

type PlannerForm = {
  destinationId: string;
  departureCity: string;
  travelers: number;
  durationDays: number;
  travelStyle: TravelStyle;
  budget: string;
};

type CostRange = {
  min: number;
  max: number;
};

type PlannerCostEstimate = {
  currency: string;

  flight: CostRange;
  accommodation: CostRange;
  food: CostRange;
  transport: CostRange;
  activities: CostRange;
  visaAndFees: CostRange;
  insurance?: CostRange;
  misc?: CostRange;

  total: CostRange;

  note: string;
};

type PlannerDocument = {
  name: string;
  description: string;
  status: "likely" | "depends" | "verify";
};

const travelStyles: {
  value: TravelStyle;
  label: string;
  description: string;
}[] = [
    {
      value: "budget",
      label: "Budget",
      description: "Keep costs low",
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Comfort + value",
    },
    {
      value: "comfort",
      label: "Comfort",
      description: "More convenience",
    },
    {
      value: "luxury",
      label: "Luxury",
      description: "Premium experience",
    },
  ];

const defaultForm: PlannerForm = {
  destinationId: destinations[0]?.id ?? "",
  departureCity: "Dhaka",
  travelers: 2,
  durationDays: 5,
  travelStyle: "balanced",
  budget: "",
};

/* -------------------------------------------------------------------------- */
/* Initial form                                                               */
/* -------------------------------------------------------------------------- */

function getInitialForm(
  searchParams: URLSearchParams,
): PlannerForm {
  const destinationParam =
    searchParams.get("destination");

  const departureParam =
    searchParams.get("departure");

  const travelersParam = Number(
    searchParams.get("travelers"),
  );

  const durationParam = Number(
    searchParams.get("duration"),
  );

  const budgetParam =
    searchParams.get("budget");

  const styleParam =
    searchParams.get("style");

  const destinationExists = destinations.some(
    (item) => item.id === destinationParam,
  );

  const validTravelStyle = travelStyles.some(
    (style) => style.value === styleParam,
  );

  const validTravelers =
    Number.isFinite(travelersParam) &&
    travelersParam >= 1;

  const validDuration =
    Number.isFinite(durationParam) &&
    durationParam >= 1;

  const validBudget =
    budgetParam !== null &&
    budgetParam.trim() !== "" &&
    Number.isFinite(Number(budgetParam)) &&
    Number(budgetParam) >= 0;

  return {
    destinationId: destinationExists
      ? destinationParam!
      : defaultForm.destinationId,

    departureCity:
      departureParam?.trim() ||
      defaultForm.departureCity,

    travelers: validTravelers
      ? Math.min(
        20,
        Math.max(1, travelersParam),
      )
      : defaultForm.travelers,

    durationDays: validDuration
      ? Math.min(
        30,
        Math.max(1, durationParam),
      )
      : defaultForm.durationDays,

    travelStyle: validTravelStyle
      ? (styleParam as TravelStyle)
      : defaultForm.travelStyle,

    budget: validBudget
      ? budgetParam!
      : defaultForm.budget,
  };
}

/* -------------------------------------------------------------------------- */
/* AI total estimate                                                          */
/* -------------------------------------------------------------------------- */

function getAIEstimate(
  searchParams: URLSearchParams,
): CostRange | null {
  const min = Number(
    searchParams.get("estimateMin"),
  );

  const max = Number(
    searchParams.get("estimateMax"),
  );

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min < 0 ||
    max < 0 ||
    max < min
  ) {
    return null;
  }

  return {
    min,
    max,
  };
}

/* -------------------------------------------------------------------------- */
/* AI detailed cost estimate                                                  */
/* -------------------------------------------------------------------------- */

function getAICostEstimate(
  searchParams: URLSearchParams,
): PlannerCostEstimate | null {
  const raw =
    searchParams.get("costEstimate");

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    const isValidRange = (
      value: unknown,
    ): value is CostRange => {
      if (
        !value ||
        typeof value !== "object"
      ) {
        return false;
      }

      const range =
        value as Record<
          string,
          unknown
        >;

      return (
        typeof range.min === "number" &&
        typeof range.max === "number" &&
        Number.isFinite(range.min) &&
        Number.isFinite(range.max) &&
        range.min >= 0 &&
        range.max >= range.min
      );
    };

    const hasValidRequiredRanges =
      typeof parsed.currency ===
      "string" &&
      isValidRange(parsed.flight) &&
      isValidRange(
        parsed.accommodation,
      ) &&
      isValidRange(parsed.food) &&
      isValidRange(parsed.transport) &&
      isValidRange(
        parsed.activities,
      ) &&
      isValidRange(
        parsed.visaAndFees,
      ) &&
      isValidRange(parsed.total);

    if (!hasValidRequiredRanges) {
      return null;
    }

    return {
      currency: parsed.currency,

      flight: parsed.flight,

      accommodation:
        parsed.accommodation,

      food: parsed.food,

      transport:
        parsed.transport,

      activities:
        parsed.activities,

      visaAndFees:
        parsed.visaAndFees,

      insurance:
        isValidRange(parsed.insurance)
          ? parsed.insurance
          : undefined,

      misc:
        isValidRange(parsed.misc)
          ? parsed.misc
          : undefined,

      total:
        parsed.total,

      note:
        typeof parsed.note ===
          "string"
          ? parsed.note
          : "AI-generated planning estimate.",
    };
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* AI documents                                                               */
/* -------------------------------------------------------------------------- */

function getAIDocuments(
  searchParams: URLSearchParams,
): PlannerDocument[] {
  const raw =
    searchParams.get("documents");

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .slice(0, 10)
      .filter(
        (item) =>
          item &&
          typeof item.name === "string" &&
          typeof item.description ===
          "string" &&
          (
            item.status === "likely" ||
            item.status === "depends" ||
            item.status === "verify"
          ),
      )
      .map((item) => ({
        name: item.name.trim(),
        description:
          item.description.trim(),
        status: item.status,
      }))
      .filter(
        (item) =>
          item.name &&
          item.description,
      );
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* AI itinerary                                                               */
/* -------------------------------------------------------------------------- */

function getAIItinerary(
  searchParams: URLSearchParams,
): PlannerItineraryDay[] | null {
  const raw =
    searchParams.get("itinerary");

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (
      !Array.isArray(parsed) ||
      parsed.length === 0
    ) {
      return null;
    }

    const cleaned: PlannerItineraryDay[] =
      parsed
        .slice(0, 30)
        .map((item, index) => {
          const activities =
            Array.isArray(item?.activities)
              ? item.activities
                .filter(
                  (activity: unknown) =>
                    typeof activity ===
                    "string",
                )
                .slice(0, 8)
              : [];

          return {
            day:
              typeof item?.day ===
                "number" &&
                item.day > 0
                ? Math.floor(item.day)
                : index + 1,

            title:
              typeof item?.title ===
                "string" &&
                item.title.trim()
                ? item.title.trim()
                : `Day ${index + 1}`,

            description:
              typeof item?.description ===
                "string"
                ? item.description.trim()
                : undefined,

            activities,
          };
        })
        .filter(
          (item) => item.title,
        );

    return cleaned.length > 0
      ? cleaned
      : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* AI URL                                                                     */
/* -------------------------------------------------------------------------- */

function buildAIUrl(
  form: PlannerForm,
) {
  const params =
    new URLSearchParams();

  if (form.destinationId) {
    params.set(
      "destination",
      form.destinationId,
    );
  }

  if (form.departureCity.trim()) {
    params.set(
      "departure",
      form.departureCity.trim(),
    );
  }

  params.set(
    "travelers",
    String(form.travelers),
  );

  params.set(
    "duration",
    String(form.durationDays),
  );

  params.set(
    "style",
    form.travelStyle,
  );

  if (form.budget.trim()) {
    params.set(
      "budget",
      form.budget.trim(),
    );
  }

  return `/ai?${params.toString()}`;
}

function buildAIUrlWithPrompt(
  form: PlannerForm,
  prompt: string,
) {
  const baseUrl =
    buildAIUrl(form);

  return `${baseUrl}&prompt=${encodeURIComponent(
    prompt,
  )}`;
}

/* -------------------------------------------------------------------------- */
/* Planner page                                                               */
/* -------------------------------------------------------------------------- */

export default function PlannerPage() {
  return (
    <Suspense fallback={<PageLoading label="Preparing your trip planner" />}>
      <PlannerPageContent />
    </Suspense>
  );
}

function PlannerPageContent() {
  const searchParams =
    useSearchParams();

  const [form, setForm] =
    useState<PlannerForm>(() =>
      getInitialForm(searchParams),
    );

  const [planned, setPlanned] =
    useState(
      searchParams.has("destination") ||
      searchParams.has("duration") ||
      searchParams.has("budget"),
    );

  const [aiEstimate] =
    useState<CostRange | null>(() =>
      getAIEstimate(searchParams),
    );

  const [aiCostEstimate] =
    useState<PlannerCostEstimate | null>(
      () =>
        getAICostEstimate(
          searchParams,
        ),
    );

  const [aiDocuments] =
    useState<PlannerDocument[]>(() =>
      getAIDocuments(searchParams),
    );

  const [aiItinerary] =
    useState<
      PlannerItineraryDay[] | null
    >(() =>
      getAIItinerary(
        searchParams,
      ),
    );

  const [saved, setSaved] =
    useState(false);

  const destination =
    useMemo(
      () =>
        destinations.find(
          (item) =>
            item.id ===
            form.destinationId,
        ),
      [form.destinationId],
    );

  /* ------------------------------------------------------------------------ */
  /* Prototype fallback estimate                                              */
  /* ------------------------------------------------------------------------ */

  const prototypeBudget =
    useMemo(() => {
      const basePerPerson = {
        budget: 45000,
        balanced: 75000,
        comfort: 115000,
        luxury: 190000,
      };

      const base =
        basePerPerson[
        form.travelStyle
        ] ?? 75000;

      const durationMultiplier =
        Math.max(
          form.durationDays / 5,
          0.7,
        );

      return Math.round(
        base *
        durationMultiplier *
        Math.max(
          form.travelers,
          1,
        ),
      );
    }, [
      form.durationDays,
      form.travelers,
      form.travelStyle,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Fallback itinerary                                                       */
  /* ------------------------------------------------------------------------ */

  const fallbackItinerary =
    useMemo(() => {
      const destinationName =
        destination?.name ??
        "your destination";

      const activities = [
        {
          title:
            "Arrival & settle in",
          description: `Arrive from ${form.departureCity}, check in, and get familiar with ${destinationName}.`,
        },
        {
          title:
            "Explore the highlights",
          description: `Visit some of the most important places and experiences around ${destinationName}.`,
        },
        {
          title:
            "Local experience",
          description:
            "Experience local food, culture, neighborhoods, and everyday life.",
        },
        {
          title:
            "Adventure day",
          description:
            "Keep this day flexible for activities, attractions, or a nearby day trip.",
        },
        {
          title:
            "Relax & discover",
          description:
            "Use the day for shopping, food, photography, or anything you missed.",
        },
        {
          title:
            "Flexible exploration",
          description:
            "Add another attraction, revisit a favorite place, or explore somewhere nearby.",
        },
        {
          title: "Departure",
          description:
            "Check out, complete your final activities, and prepare for the journey home.",
        },
      ];

      return Array.from(
        {
          length:
            form.durationDays,
        },
        (_, index) => ({
          day: index + 1,
          ...activities[
          Math.min(
            index,
            activities.length - 1,
          )
          ],
        }),
      );
    }, [
      destination,
      form.departureCity,
      form.durationDays,
    ]);

  const itinerary =
    aiItinerary ??
    fallbackItinerary;

  /* ------------------------------------------------------------------------ */
  /* Form update                                                              */
  /* ------------------------------------------------------------------------ */

  function updateForm<
    K extends keyof PlannerForm,
  >(
    key: K,
    value: PlannerForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setPlanned(false);
    setSaved(false);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPlanned(true);
    setSaved(false);

    requestAnimationFrame(() => {
      document
        .getElementById("trip-results")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  }

  function handleEditPlan() {
    setPlanned(false);
    setSaved(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Save trip                                                                */
  /* ------------------------------------------------------------------------ */

  function handleSaveTrip() {
    if (!destination) {
      return;
    }

    const totalEstimate =
      aiCostEstimate?.total ??
      aiEstimate ?? {
        min: prototypeBudget,
        max: prototypeBudget,
      };

    const currency =
      aiCostEstimate?.currency ??
      "BDT";

    const now =
      new Date().toISOString();

    const trip = {
      id: `trip-${Date.now()}`,

      profile: {
        destination:
          destination.name,

        destinationId:
          destination.id,

        departureCity:
          form.departureCity.trim() ||
          null,

        travelers:
          form.travelers,

        durationDays:
          form.durationDays,

        budget: form.budget
          ? Number(form.budget)
          : null,

        currency,

        travelStyle:
          form.travelStyle,

        language: "bn",
      },

      title:
        `${destination.name} Trip`,

      itinerary:
        itinerary.map((day) => ({
          day: day.day,

          title: day.title,

          activities:
            "activities" in day
              ? day.activities ?? []
              : day.description
                ? [day.description]
                : [],
        })),

      costEstimate: {
        currency,

        total:
          totalEstimate,

        ...(aiCostEstimate
          ? {
            flight:
              aiCostEstimate.flight,

            accommodation:
              aiCostEstimate.accommodation,

            food:
              aiCostEstimate.food,

            transport:
              aiCostEstimate.transport,

            activities:
              aiCostEstimate.activities,

            visaAndFees:
              aiCostEstimate.visaAndFees,

            ...(aiCostEstimate.insurance
              ? {
                insurance:
                  aiCostEstimate.insurance,
              }
              : {}),

            ...(aiCostEstimate.misc
              ? {
                misc:
                  aiCostEstimate.misc,
              }
              : {}),
          }
          : {}),

        note:
          aiCostEstimate?.note ??
          (aiEstimate
            ? "AI-generated planning range. Actual costs vary by dates, availability, route, and travel choices."
            : "Prototype planning estimate. Actual costs vary by dates, availability, route, and travel choices."),
      },

      documents:
        aiDocuments.map(
          (document) => ({
            name:
              document.name,

            description:
              document.description,

            status:
              document.status,
          }),
        ),

      createdAt: now,
      updatedAt: now,
    } as SavedTrip;

    saveTrip(trip);

    setSaved(true);
  }

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Page intro */}
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-400">
            Trip planner
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Turn a destination into
            <span className="text-sky-300">
              {" "}
              a real trip.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Tell TISA Global where you want
            to go, how long you have,
            who is travelling, and how
            you like to travel.
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[420px_1fr] lg:px-8">
          {/* Planner form */}
          <form
            onSubmit={handleSubmit}
            className="relative z-20 h-fit rounded-3xl border border-white/8 bg-[#0d131d] p-4 sm:p-6 lg:sticky lg:top-8"
          >
            <div>
              <p className="text-sm font-semibold text-white">
                Tell us about your
                trip
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                You can change these
                details anytime.
              </p>
            </div>

            {/* Destination */}
            <div className="mt-7">
              <label
                htmlFor="destination"
                className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Destination
              </label>

              <select
                id="destination"
                value={
                  form.destinationId
                }
                onChange={(event) =>
                  updateForm(
                    "destinationId",
                    event.target.value,
                  )
                }
                className="mt-2 h-12 w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors focus:border-sky-400/40"
              >
                {destinations.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className="bg-[#0d131d]"
                    >
                      {item.name} —{" "}
                      {item.country}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Departure */}
            <div className="mt-5">
              <label
                htmlFor="departure"
                className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Departure city
              </label>

              <input
                id="departure"
                type="text"
                value={
                  form.departureCity
                }
                onChange={(event) =>
                  updateForm(
                    "departureCity",
                    event.target.value,
                  )
                }
                placeholder="e.g. Dhaka"
                className="mt-2 h-12 w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
              />
            </div>

            {/* Travelers + Duration */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="travelers"
                  className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
                >
                  Travelers
                </label>

                <input
                  id="travelers"
                  type="number"
                  min={1}
                  max={20}
                  value={
                    form.travelers
                  }
                  onChange={(event) =>
                    updateForm(
                      "travelers",
                      Math.min(
                        20,
                        Math.max(
                          1,
                          Number(
                            event.target
                              .value,
                          ) || 1,
                        ),
                      ),
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-sky-400/40"
                />
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
                >
                  Days
                </label>

                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={30}
                  value={
                    form.durationDays
                  }
                  onChange={(event) =>
                    updateForm(
                      "durationDays",
                      Math.min(
                        30,
                        Math.max(
                          1,
                          Number(
                            event.target
                              .value,
                          ) || 1,
                        ),
                      ),
                    )
                  }
                  className="mt-2 h-12 w-full rounded-xl border border-white/8 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-sky-400/40"
                />
              </div>
            </div>

            {/* Travel style */}
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                Travel style
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {travelStyles.map(
                  (style) => {
                    const active =
                      form.travelStyle ===
                      style.value;

                    return (
                      <button
                        key={
                          style.value
                        }
                        type="button"
                        onClick={() =>
                          updateForm(
                            "travelStyle",
                            style.value,
                          )
                        }
                        className={`rounded-xl border p-3 text-left transition-colors ${active
                          ? "border-sky-400/25 bg-sky-400/10"
                          : "border-white/8 bg-white/[0.02] hover:border-white/15"
                          }`}
                      >
                        <span
                          className={`block text-sm font-medium ${active
                            ? "text-sky-300"
                            : "text-white"
                            }`}
                        >
                          {
                            style.label
                          }
                        </span>

                        <span className="mt-1 block text-[11px] text-slate-500">
                          {
                            style.description
                          }
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="mt-6">
              <label
                htmlFor="budget"
                className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                Your budget{" "}
                <span className="normal-case">
                  (optional)
                </span>
              </label>

              <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-white/8 bg-white/[0.04] focus-within:border-sky-400/40">
                <span className="flex items-center border-r border-white/8 px-4 text-sm text-slate-500">
                  ৳
                </span>

                <input
                  id="budget"
                  type="number"
                  min={0}
                  value={form.budget}
                  onChange={(event) =>
                    updateForm(
                      "budget",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. 150000"
                  className="w-full bg-transparent px-4 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 flex h-12 w-full touch-manipulation items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01] active:scale-[0.98]"
            >
              Build My Trip <span className="ml-2">→</span>
            </button>
          </form>

          {/* Results */}

          {/* Results */}
          <div
            id="trip-results"
            className="scroll-mt-24"
            aria-live="polite"
          >
            {!planned ? (
              <EmptyPlannerState />
            ) : (
              <PlannerResult
                destination={destination}
                form={form}
                prototypeBudget={prototypeBudget}
                aiEstimate={aiEstimate}
                aiCostEstimate={aiCostEstimate}
                aiDocuments={aiDocuments}
                itinerary={itinerary}
                saved={saved}
                onSave={handleSaveTrip}
                onEdit={handleEditPlan}
              />
            )}
          </div>

        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function EmptyPlannerState() {
  return (
    <div className="flex min-h-[620px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.015] px-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/15 bg-sky-400/8 text-xl text-sky-300">
        ✦
      </div>

      <h2 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-white">
        Your trip will
        appear here.
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Choose a destination and
        tell us a little about your
        journey. TISA Global will turn
        those details into a starting
        itinerary.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Planner result                                                             */
/* -------------------------------------------------------------------------- */

function PlannerResult({
  destination,
  form,
  prototypeBudget,
  aiEstimate,
  aiCostEstimate,
  aiDocuments,
  itinerary,
  saved,
  onSave,
  onEdit,
}: {
  destination:
  | (typeof destinations)[number]
  | undefined;

  form: PlannerForm;

  prototypeBudget: number;

  aiEstimate:
  | CostRange
  | null;

  aiCostEstimate:
  | PlannerCostEstimate
  | null;

  aiDocuments:
  PlannerDocument[];

  itinerary:
  PlannerItineraryDay[];

  saved: boolean;

  onSave: () => void;

  onEdit: () => void;
}) {
  const destinationName =
    destination?.name ??
    "Your destination";

  const aiUrl =
    buildAIUrl(form);

  const hasAIItinerary =
    itinerary.some(
      (day) =>
        Boolean(day.description) ||
        Boolean(
          day.activities &&
          day.activities.length > 0,
        ),
    );

  const displayEstimate =
    aiCostEstimate?.total ??
    aiEstimate ?? {
      min: prototypeBudget,
      max: prototypeBudget,
    };

  const displayCurrency =
    aiCostEstimate?.currency ??
    "BDT";

  const costItems: {
    label: string;
    range: CostRange;
  }[] = aiCostEstimate
      ? [
        {
          label: "Flights",
          range:
            aiCostEstimate.flight,
        },
        {
          label: "Accommodation",
          range:
            aiCostEstimate.accommodation,
        },
        {
          label: "Food",
          range:
            aiCostEstimate.food,
        },
        {
          label: "Transport",
          range:
            aiCostEstimate.transport,
        },
        {
          label: "Activities",
          range:
            aiCostEstimate.activities,
        },
        {
          label: "Visa & fees",
          range:
            aiCostEstimate.visaAndFees,
        },

        ...(aiCostEstimate.insurance
          ? [
            {
              label: "Insurance",
              range:
                aiCostEstimate.insurance,
            },
          ]
          : []),

        ...(aiCostEstimate.misc
          ? [
            {
              label: "Miscellaneous",
              range:
                aiCostEstimate.misc,
            },
          ]
          : []),
      ]
      : [];

  return (
    <div>
      {/* Result header */}
      <div className="rounded-3xl border border-white/8 bg-[#0d131d] p-7 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-400">
              Your trip
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              {destinationName}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {form.durationDays} days ·{" "}
              {form.travelers}{" "}
              {form.travelers === 1
                ? "traveler"
                : "travelers"}{" "}
              ·{" "}
              <span className="capitalize">
                {form.travelStyle}
              </span>
            </p>
          </div>

          <Link
            href={aiUrl}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-sky-400/15 bg-sky-400/[0.06] px-5 text-sm font-medium text-sky-300"
          >
            <span>✦</span>
            Ask TISA AI
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="From"
            value={
              form.departureCity ||
              "Not specified"
            }
          />

          <SummaryCard
            label="Duration"
            value={`${form.durationDays} days`}
          />

          <SummaryCard
            label={
              aiEstimate ||
                aiCostEstimate
                ? "AI estimated budget"
                : "Estimated budget"
            }
            value={`${formatCurrency(
              displayEstimate.min,
              displayCurrency,
            )} – ${formatCurrency(
              displayEstimate.max,
              displayCurrency,
            )}`}
          />
        </div>

        {form.budget &&
          Number(form.budget) >
          0 && (
            <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3 text-xs text-slate-400">
              Your stated budget:{" "}
              <span className="font-medium text-emerald-300">
                ৳
                {Number(
                  form.budget,
                ).toLocaleString()}
              </span>
            </div>
          )}

        <p className="mt-4 text-[11px] leading-5 text-slate-600">
          {aiEstimate ||
            aiCostEstimate
            ? "This estimate was generated from your TISA AI trip context. It is a planning range, not a live travel quote. Actual costs vary by dates, availability, route, and travel choices."
            : "Budget shown here is a prototype estimate for the planner experience, not a live travel quote. Actual costs vary by dates, availability, route, and travel choices."}
        </p>

        {/* Save trip */}
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          {saved ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  ✓ Trip saved
                  successfully
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your trip is now
                  available in My
                  Trips.
                </p>
              </div>

              <Link
                href="/account/trips"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.07]"
              >
                View My Trips →
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.01]"
            >
              Save This Trip
              <span className="ml-2">
                ♡
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed cost breakdown */}
      {aiCostEstimate && (
        <section className="mt-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-400">
              Cost breakdown
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
              Where your budget goes
            </h2>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {costItems.map(
              ({ label, range }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                >
                  <p className="text-xs text-slate-500">
                    {label}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-200">
                    {formatCurrency(
                      range.min,
                      aiCostEstimate.currency,
                    )}{" "}
                    –{" "}
                    {formatCurrency(
                      range.max,
                      aiCostEstimate.currency,
                    )}
                  </p>
                </div>
              ),
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            {aiCostEstimate.note}
          </p>
        </section>
      )}

      {/* Itinerary */}
      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
              Itinerary
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
              {hasAIItinerary
                ? "Your AI trip plan"
                : "Your starting plan"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="hidden text-sm text-slate-500 transition-colors hover:text-white sm:block"
          >
            Edit plan
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {itinerary.map(
            (day) => (
              <div
                key={day.day}
                className="group rounded-2xl border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-white/12"
              >
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-xs font-semibold text-slate-300">
                    {String(
                      day.day,
                    ).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                      Day {day.day}
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white">
                      {day.title}
                    </h3>

                    {day.description && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {
                          day.description
                        }
                      </p>
                    )}

                    {day.activities &&
                      day.activities.length >
                      0 && (
                        <ul className="mt-3 space-y-2">
                          {day.activities.map(
                            (
                              activity,
                              index,
                            ) => (
                              <li
                                key={`${day.day}-${index}`}
                                className="flex gap-2 text-sm leading-6 text-slate-400"
                              >
                                <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-sky-400/70" />

                                <span>
                                  {
                                    activity
                                  }
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Documents */}
      {aiDocuments.length >
        0 && (
          <section className="mt-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400">
                Documents
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-white">
                What you may need
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {aiDocuments.map(
                (
                  document,
                  index,
                ) => (
                  <div
                    key={`${document.name}-${index}`}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          {
                            document.name
                          }
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {
                            document.description
                          }
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${document.status ===
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

            <p className="mt-4 text-xs leading-5 text-slate-600">
              Visa and entry requirements
              can change. Verify current
              requirements with the relevant
              official authority before
              booking.
            </p>
          </section>
        )}

      {/* AI refinement */}
      <section className="mt-8">
        <div className="rounded-3xl border border-sky-400/10 bg-gradient-to-br from-sky-400/[0.08] via-white/[0.02] to-emerald-400/[0.05] p-7 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
            ✦
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            Make this trip
            yours.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Continue with TISA AI
            to refine this trip using
            natural language. Your
            current trip details will
            stay with you.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Make it cheaper",
              "Add more nature",
              "Reduce travel time",
              "Add shopping",
            ].map(
              (prompt) => (
                <Link
                  key={prompt}
                  href={buildAIUrlWithPrompt(
                    form,
                    prompt,
                  )}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-xs text-slate-400 transition-colors hover:border-sky-400/20 hover:text-sky-300"
                >
                  {prompt}
                </Link>
              ),
            )}
          </div>

          <Link
            href={aiUrl}
            className="mt-6 inline-flex text-sm font-medium text-sky-400 hover:text-sky-300"
          >
            Continue with TISA AI →
          </Link>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small UI components                                                        */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-slate-300">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Currency                                                                   */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  amount: number,
  currency: string,
) {
  if (currency === "BDT") {
    return `৳${amount.toLocaleString()}`;
  }

  return `${currency} ${amount.toLocaleString()}`;
}