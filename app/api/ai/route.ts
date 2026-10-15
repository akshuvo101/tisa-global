
import { NextResponse } from "next/server";

import { generateTISAGlobalResponse } from "@/lib/ai/gemini";
import type { AIRequest } from "@/types/ai";
import { getVerifiedEventIntelligence } from "@/lib/ai/event-intelligence";

const MAX_HISTORY_MESSAGES = 6;
const MAX_MESSAGE_LENGTH = 1200;

/* -------------------------------------------------------------------------- */
/* Conversation history                                                      */
/* -------------------------------------------------------------------------- */

function buildConversationHistory(
  history: AIRequest["history"],
): string {
  if (!history?.length) {
    return "No previous conversation.";
  }

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => {
      const content = item.content
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH);

      return `${item.role}: ${content}`;
    })
    .join("\n");
}

/* -------------------------------------------------------------------------- */
/* Travel profile                                                             */
/* -------------------------------------------------------------------------- */

function buildTravelProfile(
  context: AIRequest["context"],
): string {
  return `
Destination: ${context?.destination ?? "Unknown"}
Destination ID: ${context?.destinationId ?? "Unknown"}
Departure city: ${context?.departureCity ?? "Unknown"}
Travelers: ${context?.travelers ?? "Unknown"}
Duration: ${
    context?.durationDays
      ? `${context.durationDays} days`
      : "Unknown"
  }
Budget: ${
    context?.budget
      ? `${context.budget} ${context.currency ?? "BDT"}`
      : "Unknown"
  }
Currency: ${context?.currency ?? "BDT"}
Travel style: ${context?.travelStyle ?? "Unknown"}
`.trim();
}

/* -------------------------------------------------------------------------- */
/* Destination context                                                        */
/* -------------------------------------------------------------------------- */

function buildDestinationContext(
  destinationContext: AIRequest["destinationContext"],
): string {
  if (!destinationContext) {
    return "No structured destination context is available.";
  }

  const transportOptions =
    destinationContext.howToGetThere.fromBangladesh
      .map(
        (option) =>
          `- ${option.title}: ${option.description}${
            option.estimatedDuration
              ? ` (${option.estimatedDuration})`
              : ""
          }`,
      )
      .join("\n");

  const activities = destinationContext.thingsToDo
    .map(
      (activity) =>
        `- ${activity.title}: ${activity.description} (${activity.category})`,
    )
    .join("\n");

  const travelTips = destinationContext.travelTips
    .map(
      (tip) =>
        `- ${tip.title}: ${tip.description}`,
    )
    .join("\n");

  return `
Destination name:
${destinationContext.name}

Country:
${destinationContext.country}

City / area:
${destinationContext.city ?? "Unknown"}

Destination ID:
${destinationContext.id}

Description:
${destinationContext.description}

Categories:
${destinationContext.categories.join(", ")}

Best time to visit:
${destinationContext.bestTimeToVisit ?? "Unknown"}

Recommended days:
${
    destinationContext.recommendedDays
      ? `${destinationContext.recommendedDays.min}-${destinationContext.recommendedDays.max} days`
      : "Unknown"
  }

Overview:
${destinationContext.overview}

Best time details:
${destinationContext.bestTime.summary}

Recommended months:
${destinationContext.bestTime.months.join(", ")}

How to get there from Bangladesh:
${transportOptions}

Local transportation:
${destinationContext.howToGetThere.localTransport}

Destination cost guidance:
${JSON.stringify(
    destinationContext.estimatedCost,
    null,
    2,
  )}

Visa and document guidance:
${JSON.stringify(
    destinationContext.visaAndDocuments,
    null,
    2,
  )}

Things to do:
${activities}

Travel tips:
${travelTips}
`.trim();
}

/* -------------------------------------------------------------------------- */
/* Prompt                                                                     */
/* -------------------------------------------------------------------------- */

function buildPrompt(
  body: AIRequest,
  history: string,
  eventIntelligence: string,
): string {
  const context = body.context ?? {};
  const language = body.language ?? "bn";

  const responseLanguage =
    language === "en" ? "English" : "Bangla";

  const destinationContext = buildDestinationContext(
    body.destinationContext,
  );

  return `
You are TISA AI, an AI-powered travel planning assistant.

Your purpose is to help users understand how to actually travel to a destination, including:

- Destination discovery
- Trip planning
- Estimated travel costs
- Itinerary planning
- Visa and document guidance
- Transportation
- Travel options
- Practical travel recommendations

You are continuing an existing travel planning conversation.

==================================================
CURRENT TRAVEL PROFILE
==================================================

The current travel profile is the source of truth for
the user's existing trip.

Preserve all existing information unless the user
explicitly changes it.

${buildTravelProfile(context)}

==================================================
STRUCTURED DESTINATION CONTEXT
==================================================

The following information comes from TISA Global's
destination data.

Use this information as the primary destination-specific
context when answering the user's questions.

Do not ignore this context.

If the user asks about costs, transportation, visa,
documents, best time, activities, or travel tips for
this destination, use the relevant information below.

${destinationContext}

==================================================
VERIFIED TISA EVENT DATA
==================================================

The following event records come from TISA's verified event database.
They are the only source you may use for current conference/event facts.
If this section says no matching verified events are available, do not invent alternatives.

${eventIntelligence}

==================================================
RECENT CONVERSATION
==================================================

${history}

==================================================
NEW USER MESSAGE
==================================================

${body.message.trim()}

==================================================
TRIP REFINEMENT RULES
==================================================

The user may ask you to modify the existing trip.

1. MAKE IT CHEAPER

Keep the same destination and general trip purpose.

Reduce appropriate costs such as:
- Accommodation level
- Activities
- Transportation
- Dining
- Other optional expenses

Update the itinerary and cost estimate accordingly.

2. INCREASE THE BUDGET

Keep the destination and duration unless the user
explicitly changes them.

Improve appropriate parts of the trip such as:
- Accommodation
- Activities
- Transportation
- Dining
- Travel comfort

Update the estimated costs accordingly.

3. ADD MORE DAYS

Keep the existing destination and trip context.

Increase the duration by the requested number of days.

Extend:
- Itinerary
- Activities
- Cost estimate

4. FAMILY TRAVEL

If the user says they are travelling with family,
update the traveler count only when a specific number
is provided.

If no number is provided, keep the existing traveler
count and acknowledge that more information may be needed.

5. CHANGE DESTINATION

Only change the destination when the user clearly
specifies a new destination.

When the destination changes, recalculate:
- Itinerary
- Recommendations
- Documents
- Estimated costs
- Travel guidance

Do not continue using destination-specific information
from the previous destination after the destination
has clearly changed.

6. REMOVE A PLACE

Remove the requested destination, activity, or place
from the itinerary.

Keep the rest of the trip unchanged where possible.

7. ADD MORE NATURE

Keep:
- Destination
- Duration
- Travelers
- Budget

unless the user explicitly changes them.

Modify the itinerary to include more nature-oriented
activities.

8. REDUCE TRAVEL TIME

Keep the same destination where possible.

Prefer:
- Geographically efficient routes
- Fewer unnecessary transfers
- Better-connected activities
- Practical transportation

==================================================
DESTINATION CONTEXT RULES
==================================================

1. Treat structured destination context as
application-provided context, not live information.

2. Use the provided destination data when generating
destination-specific recommendations.

3. Cost values are estimates, not live prices.

4. Never present illustrative cost ranges as guaranteed
booking prices.

5. Visa and entry information may change over time.

6. Never claim that visa, immigration, legal, airline,
hotel, or entry requirements are guaranteed to be current
unless verified from an appropriate current source.

7. When discussing visa or entry requirements, recommend
checking the relevant official government, embassy,
immigration, or airline source before booking.

8. If the provided destination context does not contain
enough information to answer a question, do not invent
specific facts.

9. When the user changes destination, use the newly
provided destination context if available.

10. If no destination context is available, use general
travel-planning reasoning and avoid presenting
unverified destination-specific facts as authoritative.

==================================================
GENERAL RULES
==================================================

1. Preserve all previously established travel information.

2. Only change information affected by the user's latest
request.

3. Whenever a field changes, update all dependent information.

Examples:

- Duration changes
  → Update itinerary and cost.

- Traveler count changes
  → Update cost.

- Destination changes
  → Update recommendations, itinerary, documents, and cost.

- Budget changes
  → Adapt recommendations and estimated costs.

4. Never create contradictory travel information.

5. Always return the COMPLETE updated travel profile.

6. The travelProfile in the response must represent the
latest known state after processing the user's message.

7. Cost estimates must be reasonable ranges.

Do not invent fake exact prices.

8. Do not claim that visa, entry, legal, airline, hotel,
or pricing information is guaranteed to be current unless
it has been verified from an appropriate current source.

9. When information can change over time, clearly tell the
user to verify it with the relevant official source.

10. Keep recommendations practical and relevant to the
user's actual trip.

11. Do not reset the trip profile simply because some
information is unknown.

12. When information is missing, preserve existing values
and only ask for additional information when it is actually
needed.

13. Do not fabricate unavailable destination details simply
to make the response look complete.

==================================================
RESPONSE LANGUAGE
==================================================

Respond in ${responseLanguage}.

==================================================
OUTPUT
==================================================

Return the complete structured TISA AI response
according to the required response schema.
`.trim();
}

/* -------------------------------------------------------------------------- */
/* Error handling                                                             */
/* -------------------------------------------------------------------------- */

function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit")
  );
}

/* -------------------------------------------------------------------------- */
/* POST                                                                       */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AIRequest;

    if (!body.message?.trim()) {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        { status: 400 },
      );
    }

    const language = body.language ?? "bn";

    const history = buildConversationHistory(
      body.history,
    );

    const eventIntelligence = await getVerifiedEventIntelligence(body.message, 12);
    const prompt = buildPrompt(body, history, eventIntelligence);

    console.log(
      "[TISA AI] Sending request to Gemini...",
    );

    const result = await generateTISAGlobalResponse(
      prompt,
      language,
    );

    console.log(
      "[TISA AI] Gemini response received.",
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("====================================");
    console.error("[TISA AI] BACKEND ERROR");
    console.error(error);
    console.error("====================================");

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          error:
            "TISA AI is temporarily unavailable because the AI usage limit has been reached. Please try again later.",
        },
        { status: 429 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        error:
          "Unable to generate a travel response right now.",
        ...(process.env.NODE_ENV === "development"
          ? { details: message }
          : {}),
      },
      { status: 500 },
    );
  }
}
