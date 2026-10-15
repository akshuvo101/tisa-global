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
  Compass,
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
      shell.style.setProperty(
        "--assistant-viewport-height",
        `${viewport?.height ?? window.innerHeight}px`,
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
            content: item.content,
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

  const starterPrompts = [
    "I want to visit Dubai for 5 days from Dhaka.",
    "Plan a 7-day Japan trip for me.",
    "I have a budget of ৳100,000. Where can I go?",
    "What documents do I need for a Dubai trip?",
  ];

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      <Navbar />
      <main
        ref={shellRef}
        className="flex min-h-0 w-full flex-col overflow-hidden bg-background text-foreground"
        style={{
          height:
            "calc(var(--assistant-viewport-height, 100dvh) - var(--assistant-navbar-height, 72px))",
        }}
      >
        <div className="relative mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden border-x border-border">
          <aside className="assistant-sidebar hidden w-[280px] shrink-0 border-r border-border bg-surface/35 lg:block xl:w-[304px]">
            <AssistantSidebar profile={travelProfile} />
          </aside>

          {sidebarOpen && (
            <div className="absolute inset-0 z-30 lg:hidden">
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
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-6 [scrollbar-gutter:stable] sm:px-6 sm:py-8 lg:px-8"
            >
              <div className="assistant-context-toolbar sticky top-0 z-10 -mx-4 mb-6 flex min-h-12 items-center gap-2 border-b border-border/60 bg-background/65 px-4 py-1.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <button
                  ref={sidebarTriggerRef}
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open travel sidebar"
                  aria-expanded={sidebarOpen}
                  aria-controls="assistant-sidebar-dialog"
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-border/80 bg-surface/80 px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-surface-light lg:hidden"
                >
                  <Menu aria-hidden="true" className="h-4 w-4 text-primary" />
                  <span>Trip tools</span>
                </button>
                <div
                  aria-label="Current trip context"
                  className="min-w-0 flex-1 overflow-x-auto"
                >
                  <TravelProfileTags profile={travelProfile} />
                </div>
              </div>
              {messages.length === 0 ? (
                <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center py-4 sm:py-8">
                  <div className="mb-8 text-center sm:mb-10">
                    <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-primary/20 bg-primary-soft text-primary shadow-[0_12px_36px_rgba(8,126,155,0.1)]">
                      <Sparkles aria-hidden="true" className="h-6 w-6" />
                    </div>

                    <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {destination
                        ? `Planning a trip to ${destination.name}?`
                        : "Where do you want to go?"}
                    </h3>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
                      I can help you understand
                      costs, documents, visa
                      requirements, itinerary ideas,
                      and how to actually plan the
                      trip.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {starterPrompts.map(
                      (prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() =>
                            void sendMessage(
                              prompt,
                            )
                          }
                          disabled={loading}
                          className="group min-h-20 rounded-2xl border border-border bg-surface/55 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-light disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <p className="text-sm leading-6 text-foreground/85">
                            {prompt}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            Try this prompt <span aria-hidden="true">→</span>
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-7 pb-3 sm:space-y-9 sm:pb-5">
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
                          <div className="max-w-[92%] break-words rounded-2xl rounded-br-md border border-primary/15 bg-primary-soft/70 px-4 py-3.5 sm:max-w-[85%] sm:px-5 sm:py-4">
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                              {item.content}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full max-w-3xl">
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
                              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
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

                                  <div className="grid gap-3 md:grid-cols-2">
                                    {item.data.recommendations.map(
                                      (
                                        recommendation,
                                        recommendationIndex,
                                      ) => (
                                        <div
                                          key={`${recommendation.title}-${recommendationIndex}`}
                                          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                                        >
                                          <h4 className="text-sm font-semibold text-white">
                                            {
                                              recommendation.title
                                            }
                                          </h4>

                                          <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {
                                              recommendation.description
                                            }
                                          </p>

                                          <p className="mt-3 text-xs leading-5 text-sky-300/80">
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

                              {/* Verified events */}
                              {item.data.events.length > 0 && (
                                <div>
                                  <SectionTitle icon="📅">Verified events for you</SectionTitle>

                                  <div className="grid gap-3 md:grid-cols-2">
                                    {item.data.events.map((event) => (
                                      <div
                                        key={event.id}
                                        className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.025] p-5"
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                            Verified by TISA
                                          </span>
                                          {event.category && (
                                            <span className="text-[11px] text-slate-500">{event.category}</span>
                                          )}
                                        </div>
                                        <h4 className="mt-3 text-sm font-semibold text-white">{event.title}</h4>
                                        <p className="mt-2 text-xs text-slate-500">
                                          {[event.city, event.country].filter(Boolean).join(", ") || "International"}
                                          {event.startDate ? ` · ${event.startDate}` : ""}
                                        </p>
                                        {event.invitationAvailability && (
                                          <p className="mt-2 text-xs text-slate-400">Invitation: {event.invitationAvailability}</p>
                                        )}
                                        <p className="mt-3 text-xs leading-5 text-slate-400">{event.reason}</p>
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
                                          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                                        >
                                          <div className="flex gap-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/[0.08] text-xs font-semibold text-sky-300">
                                              {day.day}
                                            </div>

                                            <div className="min-w-0">
                                              <h4 className="text-sm font-semibold text-white">
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
                                                      className="flex gap-2 text-sm leading-6 text-slate-400"
                                                    >
                                                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />

                                                      <span>
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
                              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                                <SectionTitle icon="💰">
                                  Estimated cost
                                </SectionTitle>

                                <div className="mb-5 rounded-xl border border-sky-400/10 bg-sky-400/[0.04] p-4">
                                  <p className="text-xs text-slate-500">
                                    Estimated total
                                  </p>

                                  <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
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
                                          className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                                        >
                                          <p className="text-xs text-slate-500">
                                            {
                                              label as string
                                            }
                                          </p>

                                          <p className="mt-1 text-sm font-medium text-slate-200">
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
                                          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
                                        >
                                          <div className="flex items-start justify-between gap-4">
                                            <div>
                                              <h4 className="text-sm font-semibold text-white">
                                                {
                                                  document.name
                                                }
                                              </h4>

                                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {
                                                  document.description
                                                }
                                              </p>
                                            </div>

                                            <span
                                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
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
                              {item.data
                                .nextActions
                                .length > 0 && (
                                <div>
                                  <SectionTitle icon="→">
                                    Next steps
                                  </SectionTitle>

                                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
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

                                            <span>
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
                              <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-400/[0.07] to-transparent p-5">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
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
                                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300"
                                  >
                                    Build this trip
                                    <span className="ml-2">
                                      →
                                    </span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  )}

                  {/* Loading */}
                  {loading && (
                    <div className="flex justify-start">
                      <div role="status" className="w-full max-w-3xl">
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
                <div role="alert" className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
                  <p className="text-sm leading-6 text-red-600 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="assistant-composer z-10 shrink-0 border-t border-border bg-background/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6 sm:py-5 lg:px-8">
              <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-3xl"
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
                    placeholder="Tell TISA Global about your trip..."
                    className="max-h-[min(35dvh,180px)] min-h-11 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted sm:px-3"
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