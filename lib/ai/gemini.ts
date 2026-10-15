import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

import type {
  AIResponse,
  AppLanguage,
} from "@/types/ai";

import {
  GEMINI_MODELS,
} from "@/lib/ai/models";

/* =========================================================
   Configuration
========================================================= */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/*
 * Free-tier friendly settings.
 *
 * We only retry genuine temporary provider failures.
 * Quota/rate-limit errors are NOT retried.
 */
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1200;

/* =========================================================
   Zod validation
========================================================= */

const languageSchema = z.enum(["bn", "en"]);

const travelStyleSchema = z.enum([
  "budget",
  "balanced",
  "comfort",
  "luxury",
]);

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();

const travelProfileSchema = z.object({
  destination: nullableString,
  destinationId: nullableString,
  departureCity: nullableString,
  travelers: nullableNumber,
  durationDays: nullableNumber,
  budget: nullableNumber,
  currency: z.string(),
  travelStyle: travelStyleSchema.nullable(),
  language: languageSchema,
});

const costRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

const aiResponseSchema = z.object({
  message: z.string(),

  travelProfile: travelProfileSchema,

  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      reason: z.string(),
    }),
  ),

  itinerary: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      activities: z.array(z.string()),
    }),
  ),

  costEstimate: z.object({
    currency: z.string(),

    flight: costRangeSchema,
    accommodation: costRangeSchema,
    food: costRangeSchema,
    transport: costRangeSchema,
    activities: costRangeSchema,
    visaAndFees: costRangeSchema,
    total: costRangeSchema,

    note: z.string(),
  }),

  documents: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      status: z.enum([
        "likely",
        "depends",
        "verify",
      ]),
    }),
  ),

  events: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      country: z.string().nullable(),
      city: z.string().nullable(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
      category: z.string().nullable(),
      registrationStatus: z.string().nullable(),
      invitationAvailability: z.string().nullable(),
      lastVerifiedAt: z.string().nullable(),
      sourceUrl: z.string().nullable(),
      sourceName: z.string().nullable(),
      reason: z.string(),
    }),
  ),

  nextActions: z.array(z.string()),
});

/* =========================================================
   Gemini Structured Output Schema
========================================================= */

const responseSchema = {
  type: Type.OBJECT,

  properties: {
    message: {
      type: Type.STRING,
    },

    travelProfile: {
      type: Type.OBJECT,

      properties: {
        destination: {
          type: Type.STRING,
          nullable: true,
        },

        destinationId: {
          type: Type.STRING,
          nullable: true,
        },

        departureCity: {
          type: Type.STRING,
          nullable: true,
        },

        travelers: {
          type: Type.NUMBER,
          nullable: true,
        },

        durationDays: {
          type: Type.NUMBER,
          nullable: true,
        },

        budget: {
          type: Type.NUMBER,
          nullable: true,
        },

        currency: {
          type: Type.STRING,
        },

        travelStyle: {
          type: Type.STRING,
          enum: [
            "budget",
            "balanced",
            "comfort",
            "luxury",
          ],
          nullable: true,
        },

        language: {
          type: Type.STRING,
          enum: ["bn", "en"],
        },
      },

      required: [
        "destination",
        "destinationId",
        "departureCity",
        "travelers",
        "durationDays",
        "budget",
        "currency",
        "travelStyle",
        "language",
      ],
    },

    recommendations: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          title: {
            type: Type.STRING,
          },

          description: {
            type: Type.STRING,
          },

          reason: {
            type: Type.STRING,
          },
        },

        required: [
          "title",
          "description",
          "reason",
        ],
      },
    },

    itinerary: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          day: {
            type: Type.NUMBER,
          },

          title: {
            type: Type.STRING,
          },

          activities: {
            type: Type.ARRAY,

            items: {
              type: Type.STRING,
            },
          },
        },

        required: [
          "day",
          "title",
          "activities",
        ],
      },
    },

    costEstimate: {
      type: Type.OBJECT,

      properties: {
        currency: {
          type: Type.STRING,
        },

        flight: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        accommodation: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        food: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        transport: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        activities: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        visaAndFees: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        total: {
          type: Type.OBJECT,

          properties: {
            min: {
              type: Type.NUMBER,
            },

            max: {
              type: Type.NUMBER,
            },
          },

          required: ["min", "max"],
        },

        note: {
          type: Type.STRING,
        },
      },

      required: [
        "currency",
        "flight",
        "accommodation",
        "food",
        "transport",
        "activities",
        "visaAndFees",
        "total",
        "note",
      ],
    },

    documents: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          name: {
            type: Type.STRING,
          },

          description: {
            type: Type.STRING,
          },

          status: {
            type: Type.STRING,
            enum: [
              "likely",
              "depends",
              "verify",
            ],
          },
        },

        required: [
          "name",
          "description",
          "status",
        ],
      },
    },

    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          slug: { type: Type.STRING },
          country: { type: Type.STRING, nullable: true },
          city: { type: Type.STRING, nullable: true },
          startDate: { type: Type.STRING, nullable: true },
          endDate: { type: Type.STRING, nullable: true },
          category: { type: Type.STRING, nullable: true },
          registrationStatus: { type: Type.STRING, nullable: true },
          invitationAvailability: { type: Type.STRING, nullable: true },
          lastVerifiedAt: { type: Type.STRING, nullable: true },
          sourceUrl: { type: Type.STRING, nullable: true },
          sourceName: { type: Type.STRING, nullable: true },
          reason: { type: Type.STRING },
        },
        required: [
          "id", "title", "slug", "country", "city", "startDate", "endDate",
          "category", "registrationStatus", "invitationAvailability", "lastVerifiedAt",
          "sourceUrl", "sourceName", "reason"
        ],
      },
    },

    nextActions: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },
    },
  },

  required: [
    "message",
    "travelProfile",
    "recommendations",
    "itinerary",
    "costEstimate",
    "documents",
    "events",
    "nextActions",
  ],
};

/* =========================================================
   System Instruction
========================================================= */

const systemInstruction = `
You are TISA AI, the intelligent travel guidance assistant inside TISA Global.

TISA Global helps users answer:

"I want to visit this place. How can I go, what do I need, and approximately how much will it cost?"

Your job is to provide practical, personalized travel guidance.

CORE RESPONSIBILITIES:

1. Destination guidance
2. Trip planning
3. Cost estimation
4. Visa and document guidance
5. Transportation guidance
6. Travel-style recommendations
7. Itinerary generation
8. Context-aware conversation

--------------------------------------------------
CONVERSATION CONTINUITY
--------------------------------------------------

Always preserve the user's existing travel context.

The current travel profile may contain:

- destination
- destinationId
- departureCity
- travelers
- durationDays
- budget
- currency
- travelStyle
- language

When the user provides new information, update ONLY the relevant field(s).

Examples:

User:
"My budget is 150000 taka."

Update:
budget = 150000
currency = BDT

Do NOT remove:
destination
departureCity
travelers
durationDays
travelStyle

User:
"Add two more days."

If durationDays was 5:
durationDays = 7

Keep the existing destination, budget, travelers, etc.

User:
"Make it cheaper."

Adjust the travel style, accommodation assumptions, activities, or itinerary while preserving the destination and duration unless the user explicitly changes them.

User:
"Add Mount Fuji."

Keep the existing destination and trip details. Modify the itinerary and recommendations to include Mount Fuji when geographically/logistically reasonable.

Never reset the entire travel profile unless the user explicitly asks to start a new trip.

--------------------------------------------------
LANGUAGE
--------------------------------------------------

The requested language is provided by the application.

If language = "bn":

- Respond naturally in Bangla.
- Keep destination names, city names, attraction names, airline names, hotel names, visa terms, and common technical travel terms in English when that sounds natural.
- Do not produce awkward literal translations.
- Use Bangla numerals only if they naturally improve readability; Arabic numerals are acceptable.

If language = "en":

- Respond naturally in English.
- Do not translate proper names unnecessarily.

The "message" field must use the requested language.

--------------------------------------------------
TRAVEL PROFILE
--------------------------------------------------

Return the COMPLETE updated travelProfile in every response.

If a value is unknown, use null.

Do not invent missing user information.

Default currency:

- BDT for a Bangladesh-based user when appropriate.

--------------------------------------------------
COST ESTIMATION
--------------------------------------------------

Cost estimates must be reasonable ranges, NOT fake exact prices.

Consider when possible:

- flights
- accommodation
- food
- local transportation
- activities
- visa and government fees
- travel insurance
- miscellaneous expenses

Do not claim that an estimate is a live quote.

If exact real-time prices are unavailable, clearly state that the figures are approximate.

For Bangladesh-origin trips, BDT is preferred when reasonable.

The total should approximately correspond to the component ranges.

If the user provides a fixed total budget, respect that budget when creating the suggested plan.

If the requested destination cannot reasonably fit the stated budget, explain the constraint and suggest practical adjustments.

--------------------------------------------------
VISA AND DOCUMENTS
--------------------------------------------------

Visa and immigration information can change.

Do NOT present uncertain visa requirements as guaranteed facts.

Use status:

"likely"
- commonly required or generally expected

"depends"
- depends on nationality, visa type, destination, duration, or circumstances

"verify"
- must be checked with the relevant official authority

Do not invent embassy rules, visa fees, processing times, approval probabilities, or legal requirements.

When discussing visa requirements, encourage verification through the relevant official embassy, immigration authority, or government source.

--------------------------------------------------
ITINERARY
--------------------------------------------------

Create a practical itinerary based on:

- destination
- duration
- budget
- travel style
- travelers
- user preferences

Avoid unrealistic schedules.

Do not overload a single day with distant locations.

--------------------------------------------------
RECOMMENDATIONS
--------------------------------------------------

Recommendations should be relevant to the user's current trip.

Do not recommend random destinations unless the user asks for alternatives.

Each recommendation must include:

- title
- description
- reason

--------------------------------------------------
NEXT ACTIONS
--------------------------------------------------

Provide practical next steps such as:

- confirm destination
- check visa requirements
- compare flights
- choose accommodation
- finalize itinerary
- review packages
- adjust budget

--------------------------------------------------
EVENT & CONFERENCE INTELLIGENCE
--------------------------------------------------

TISA has a verified event dataset supplied separately in the user prompt.
Use that dataset for conference/event facts.

RULES:
- Never invent an event, date, organizer, registration status, invitation availability, or source.
- Only recommend events present in the supplied VERIFIED EVENT DATA.
- Treat lastVerifiedAt as the freshness timestamp.
- If no supplied event matches the user's request, say that TISA does not currently have a verified matching event in its database.
- Do not claim that TISA issues or guarantees invitations. Use invitation assistance language.
- Do not claim visa approval or guaranteed registration.
- When discussing a specific event, preserve its source URL and verification information.
- The events array must contain only events selected from the supplied dataset.
- If the user is not asking about events/conferences, return an empty events array.

--------------------------------------------------
OUTPUT
--------------------------------------------------

Return ONLY the structured JSON requested by the API schema.

Do not return Markdown.

Do not wrap the JSON in code fences.

Do not add commentary outside the JSON.
`;

/* =========================================================
   Helpers
========================================================= */

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 429 errors are deliberately NOT retryable.
 *
 * A 429 can mean:
 * - free-tier quota exhausted
 * - rate limit reached
 * - project quota reached
 */
function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);

  if (status === 429) {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized = message.toLowerCase();

  if (
    normalized.includes("quota exceeded") ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("resource exhausted") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests")
  ) {
    return false;
  }

  return (
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    normalized.includes("503") ||
    normalized.includes("unavailable") ||
    normalized.includes("high demand") ||
    normalized.includes("temporarily unavailable")
  );
}

function isQuotaError(error: unknown): boolean {
  const status = getErrorStatus(error);

  if (status === 429) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized = message.toLowerCase();

  return (
    normalized.includes("quota exceeded") ||
    normalized.includes("resource_exhausted") ||
    normalized.includes("resource exhausted") ||
    normalized.includes("generate_content_free_tier_requests")
  );
}

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const status = (error as { status?: unknown }).status;

    if (typeof status === "number") {
      return status;
    }
  }

  return null;
}

function extractResponseText(response: unknown): string {
  if (
    typeof response === "object" &&
    response !== null &&
    "text" in response
  ) {
    const text = (response as { text?: unknown }).text;

    if (typeof text === "string") {
      return text.trim();
    }
  }

  throw new Error(
    "Gemini returned an empty response.",
  );
}

function parseJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (
      firstBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      return JSON.parse(
        cleaned.slice(
          firstBrace,
          lastBrace + 1,
        ),
      );
    }

    throw new Error(
      "Gemini returned invalid JSON.",
    );
  }
}

/* =========================================================
   Model-specific configuration
========================================================= */

/**
 * Build configuration for a specific Gemini model.
 *
 * Keeping this function model-agnostic means model names
 * and thinking levels are controlled entirely by models.ts.
 */
function getModelConfig(
  model: typeof GEMINI_MODELS.primary,
) {
  return {
    systemInstruction,

    responseMimeType: "application/json",

    responseSchema,

    thinkingConfig: {
      thinkingLevel: model.thinkingLevel,
    },
  };
}

/* =========================================================
   Generate with retry
========================================================= */

async function generateWithRetry(
  modelConfig: typeof GEMINI_MODELS.primary,
  prompt: string,
) {
  let lastError: unknown = null;

  for (
    let attempt = 0;
    attempt <= MAX_RETRIES;
    attempt++
  ) {
    try {
      console.log(
        `[TISA AI] Requesting ${modelConfig.name} (attempt ${
          attempt + 1
        }/${MAX_RETRIES + 1})...`,
      );

      const response =
        await ai.models.generateContent({
          model: modelConfig.name,
          contents: prompt,
          config: getModelConfig(modelConfig),
        });

      return response;
    } catch (error) {
      lastError = error;

      const status = getErrorStatus(error);
      const quotaError = isQuotaError(error);
      const retryable = isRetryableError(error);

      console.error(
        `[TISA AI] ${modelConfig.name} failed.`,
        {
          attempt: attempt + 1,
          status,
          quotaError,
          retryable,
          error,
        },
      );

      /*
       * NEVER retry quota errors.
       */
      if (quotaError) {
        throw error;
      }

      /*
       * Retry only temporary provider failures.
       */
      if (
        !retryable ||
        attempt >= MAX_RETRIES
      ) {
        break;
      }

      const delay =
        RETRY_DELAY_MS * (attempt + 1);

      console.log(
        `[TISA AI] Retrying ${modelConfig.name} in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        `Gemini request failed for ${modelConfig.name}.`,
      );
}

/* =========================================================
   Main TISA AI function
========================================================= */

export async function generateTISAGlobalResponse(
  prompt: string,
  language: AppLanguage = "en",
): Promise<AIResponse> {
  if (!prompt.trim()) {
    throw new Error(
      "TISA AI requires a non-empty prompt.",
    );
  }

  const languageInstruction =
    language === "bn"
      ? `
The requested response language is Bangla.
Write the "message" field naturally in Bangla while keeping
proper travel names and common travel terminology in English
where appropriate.
`
      : `
The requested response language is English.
Write the "message" field naturally in English.
`;

  const finalPrompt = `
${languageInstruction}

User request:

${prompt.trim()}
`;

  let response;

  /* =======================================================
     Primary model
  ======================================================= */

  try {
    response = await generateWithRetry(
      GEMINI_MODELS.primary,
      finalPrompt,
    );
  } catch (primaryError) {
    const primaryQuotaError =
      isQuotaError(primaryError);

    console.error(
      "====================================",
    );

    console.error(
      "[TISA AI] PRIMARY MODEL FAILED",
    );

    console.error({
      model: GEMINI_MODELS.primary.name,
      quotaError: primaryQuotaError,
      error: primaryError,
    });

    console.error(
      "====================================",
    );

    /*
     * CRITICAL FREE-TIER RULE:
     *
     * If primary failed because of quota/rate limit,
     * DO NOT call another model.
     */
    if (primaryQuotaError) {
      throw new Error(
        "TISA AI quota has been reached. Please try again later.",
      );
    }

    /* =====================================================
       Fallback model
    ===================================================== */

    try {
      console.log(
        `[TISA AI] Switching to fallback model: ${GEMINI_MODELS.fallback.name}`,
      );

      response = await generateWithRetry(
        GEMINI_MODELS.fallback,
        finalPrompt,
      );
    } catch (fallbackError) {
      const fallbackQuotaError =
        isQuotaError(fallbackError);

      console.error(
        "====================================",
      );

      console.error(
        "[TISA AI] FALLBACK MODEL FAILED",
      );

      console.error({
        model: GEMINI_MODELS.fallback.name,
        quotaError: fallbackQuotaError,
        error: fallbackError,
      });

      console.error(
        "====================================",
      );

      /*
       * Do not automatically call a second fallback.
       *
       * Every additional model request can consume
       * additional free-tier quota.
       */
      if (fallbackQuotaError) {
        throw new Error(
          "TISA AI quota has been reached. Please try again later.",
        );
      }

      throw new Error(
        "TISA AI is temporarily unavailable. Please try again.",
      );
    }
  }

  /* =======================================================
     Parse structured response
  ======================================================= */

  const text =
    extractResponseText(response);

  const parsed = parseJson(text);

  const validated =
    aiResponseSchema.safeParse(parsed);

  if (!validated.success) {
    console.error(
      "====================================",
    );

    console.error(
      "[TISA AI] RESPONSE VALIDATION FAILED",
    );

    console.error(
      validated.error.flatten(),
    );

    console.error(
      "Raw response:",
      text,
    );

    console.error(
      "====================================",
    );

    throw new Error(
      "TISA AI returned an unexpected response format.",
    );
  }

  return validated.data;
}

/* =========================================================
   Optional exports
========================================================= */

export {
  aiResponseSchema,
  travelProfileSchema,
};