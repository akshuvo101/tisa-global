export type TravelStyle =
  | "budget"
  | "balanced"
  | "comfort"
  | "luxury";

export type AppLanguage = "bn" | "en";

export type TravelProfile = {
  destination: string | null;
  destinationId: string | null;
  departureCity: string | null;
  travelers: number | null;
  durationDays: number | null;
  budget: number | null;
  currency: string;
  travelStyle: TravelStyle | null;
  language: AppLanguage;
};

/* -------------------------------------------------------------------------- */
/* Destination context                                                        */
/* -------------------------------------------------------------------------- */

export type DestinationAIContext = {
  id: string;
  name: string;
  country: string;
  city?: string;

  description: string;
  categories: string[];

  bestTimeToVisit?: string;

  recommendedDays?: {
    min: number;
    max: number;
  };

  overview: string;

  bestTime: {
    summary: string;
    months: string[];
  };

  estimatedCost: {
    currency: string;

    flight: {
      min: number;
      max: number;
    };

    accommodation: {
      min: number;
      max: number;
    };

    food: {
      min: number;
      max: number;
    };

    transport: {
      min: number;
      max: number;
    };

    activities: {
      min: number;
      max: number;
    };

    visaAndFees: {
      min: number;
      max: number;
    };

    insurance: {
      min: number;
      max: number;
    };

    misc: {
      min: number;
      max: number;
    };

    total: {
      min: number;
      max: number;
    };

    note: string;
  };

  visaAndDocuments: {
    status:
      | "verify"
      | "likely_required"
      | "may_not_be_required";

    summary: string;

    documents: string[];

    note: string;
  };

  thingsToDo: {
    title: string;
    description: string;
    category: string;
  }[];

  travelTips: {
    title: string;
    description: string;
  }[];

  howToGetThere: {
    fromBangladesh: {
      type: string;
      title: string;
      description: string;
      estimatedDuration?: string;
    }[];

    localTransport: string;
  };
};

/* -------------------------------------------------------------------------- */
/* AI request                                                                 */
/* -------------------------------------------------------------------------- */

export type AIRequest = {
  message: string;

  language: AppLanguage;

  context?: Partial<TravelProfile>;

  destinationContext?: DestinationAIContext;

  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
};

export type WebSearchResult = {
  title: string;
  url: string;
  content: string;
  score: number | null;
  publishedDate: string | null;
  sourceUrl: string;
  sourceName: string;
  verificationStatus:
    | "official_source"
    | "partially_verified"
    | "unverified";
  sourceClassification: "government_or_education_domain" | "other";
  sourceRole: "primary_source_candidate" | "discovery_source";
  lastCheckedAt: string;
  deadline: string | null;
  deadlineStatus: "future" | "past" | "unknown";
  applicationUrl: string | null;
  eligibility: string | null;
  eventDate: string | null;
  eventDateStatus: "upcoming" | "concluded" | "unknown";
  registration: string | null;
  fundingDetails: string | null;
  eligibleCountries: string | null;
  academicLevel: string | null;
  subjectEligibility: string | null;
  fundingAmount: string | null;
  fundingCoverage: string | null;
  tuitionCost: string | null;
  livingCost: string | null;
  visaFinancialRequirement: string | null;
  paperRequirements: string | null;
  opportunityType:
    | "undergraduate_scholarship"
    | "university_tuition_waiver"
    | "tuition_discount"
    | "graduate_funding"
    | "conference_travel_grant"
    | "gender_restricted"
    | "institution_restricted"
    | "tuition_policy"
    | "student_loan"
    | "other_funding";
  status:
    | "open"
    | "upcoming"
    | "closed"
    | "not_applicable"
    | "eligibility_restricted"
    | "status_unconfirmed";
  statusReason: string;
  relevance: "priority" | "related" | "other";
  targetFit: "confirmed" | "unconfirmed" | "restricted";
};

/* -------------------------------------------------------------------------- */
/* AI response                                                                */
/* -------------------------------------------------------------------------- */

export type AIResponse = {
  message: string;

  travelProfile: TravelProfile;

  recommendations: {
    title: string;
    description: string;
    reason: string;
  }[];

  itinerary: {
    day: number;
    title: string;
    activities: string[];
  }[];

  costEstimate: {
    currency: string;

    flight: {
      min: number;
      max: number;
    };

    accommodation: {
      min: number;
      max: number;
    };

    food: {
      min: number;
      max: number;
    };

    transport: {
      min: number;
      max: number;
    };

    activities: {
      min: number;
      max: number;
    };

    visaAndFees: {
      min: number;
      max: number;
    };

    total: {
      min: number;
      max: number;
    };

    note: string;
  };

  documents: {
    name: string;
    description: string;
    status: "likely" | "depends" | "verify";
  }[];

  events: {
    id: string;
    title: string;
    slug: string;
    country: string | null;
    city: string | null;
    startDate: string | null;
    endDate: string | null;
    category: string | null;
    registrationStatus: string | null;
    invitationAvailability: string | null;
    lastVerifiedAt: string | null;
    sourceUrl: string | null;
    sourceName: string | null;
    reason: string;
  }[];

  webResults?: (WebSearchResult & {
    category: "conference" | "funding";
  })[];
  fundingSearchPerformed?: boolean;

  nextActions: string[];
};