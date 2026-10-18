
import { z } from "zod";

import type { AppLanguage, WebSearchResult } from "@/types/ai";

/* =========================================================
   Configuration
========================================================= */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const DEFAULT_MAX_RESULTS = 8;
const MAX_ALLOWED_RESULTS = 10;
const REQUEST_TIMEOUT_MS = 12_000;

/* =========================================================
   Types and validation
========================================================= */

const searchArgsSchema = z
  .object({
    query: z.string().trim().min(2).max(300),
    maxResults: z.number().int().min(1).max(MAX_ALLOWED_RESULTS).optional(),
    intent: z.enum(["upcoming_events", "funding"]),
  })
  .strict();

const tavilyResponseSchema = z.object({
  results: z
    .array(
      z.object({
        title: z.string().optional().default("Untitled result"),
        url: z
          .string()
          .url()
          .refine((value) => {
            const protocol = new URL(value).protocol;
            return protocol === "http:" || protocol === "https:";
          }),
        content: z.string().optional().default(""),
        raw_content: z.string().nullable().optional(),
        score: z.number().optional(),
        published_date: z.string().nullable().optional(),
      }),
    )
    .optional()
    .default([]),
});

export type { WebSearchResult };

export type WebSearchResponse = {
  success: boolean;
  query: string;
  results: WebSearchResult[];
  message: string;
};

type CategorizedWebSearchResult = WebSearchResult & {
  category: "conference" | "funding";
};

export function deduplicateWebSearchResults<T extends WebSearchResult>(
  results: T[],
): T[] {
  const seen = new Set<string>();

  return results.filter((result) => {
    const url = new URL(result.sourceUrl);
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    for (const parameter of [...url.searchParams.keys()]) {
      if (/^(?:utm_.+|gclid|fbclid|mc_cid|mc_eid)$/i.test(parameter)) {
        url.searchParams.delete(parameter);
      }
    }
    url.searchParams.sort();

    const key = url.toString();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildFundingSummary(
  results: CategorizedWebSearchResult[],
  language: AppLanguage,
  searchPerformed = false,
  searchSuccessful = true,
): string | null {
  const fundingResults = results.filter(
    (result) => result.category === "funding",
  );
  if (fundingResults.length === 0 && !searchPerformed) return null;

  const isBangla = language === "bn";
  if (searchPerformed && !searchSuccessful) {
    return isBangla
      ? "এই মুহূর্তে বৃত্তির লাইভ অনুসন্ধান করা যায়নি। একটু পরে আবার চেষ্টা করুন, অথবা কোন দেশ বা বিষয় নিয়ে খুঁজব বলুন।"
      : "I couldn’t complete the live scholarship search just now. Please try again shortly, or tell me a country or field to start with.";
  }

  if (fundingResults.length === 0) {
    return isBangla
      ? "আপনার শর্তের সঙ্গে মেলে এমন নির্ভরযোগ্য বৃত্তির তথ্য পাইনি। চাইলে দেশ, বিষয় বা ডিগ্রির স্তর বদলে খুঁজে দেখতে পারি।"
      : "I couldn’t find a reliable scholarship match for your criteria. I can broaden the search by country, field, or degree level.";
  }

  const potentialMatches = fundingResults.filter(
    (result) =>
      result.opportunityType === "undergraduate_scholarship" &&
      result.sourceRole === "primary_source_candidate" &&
      result.targetFit === "confirmed" &&
      result.status !== "closed" &&
      result.status !== "eligibility_restricted",
  );

  if (potentialMatches.length > 0) {
    return isBangla
      ? "আপনার শর্তের সঙ্গে মেলে এমন সম্ভাব্য বৃত্তির তথ্য নিচের কার্ডে আছে। আবেদন করার আগে যোগ্যতা, সময়সীমা ও অর্থায়ন প্রদানকারীর কাছে নিশ্চিত করুন।"
      : "I found potential scholarship matches for your criteria in the cards below. Confirm eligibility, deadlines, and funding with each provider before applying.";
  }

  return isBangla
    ? "কিছু সম্পর্কিত সুযোগ পেয়েছি, তবে কোনোটির তথ্যই আপনার যোগ্যতা ও বর্তমান আবেদনের অবস্থা নিশ্চিত করে না। কার্ডগুলো দেখুন, অথবা লক্ষ্য দেশ বা বিষয় বললে খোঁজটি আরও নির্দিষ্ট করব।"
    : "I found a few related leads, but none confirms both your eligibility and a current application cycle. Check the cards, or tell me your target country or field and I’ll narrow the search.";
}

/* =========================================================
   Source metadata helpers
========================================================= */

/**
 * Derive a readable source name from a valid URL.
 * This identifies the domain; it does not prove that the
 * page is official or that its claims are accurate.
 */
function getSourceName(url: string): string {
  try {
    const hostname = new URL(url).hostname
      .toLowerCase()
      .replace(/^www\./, "");

    return hostname || "Unknown source";
  } catch {
    return "Unknown source";
  }
}

function findEvidenceSentence(
  content: string,
  pattern: RegExp,
): string | null {
  return findEvidenceSentences(content, pattern, 1);
}

function findEvidenceSentences(
  content: string,
  pattern: RegExp,
  limit: number,
): string | null {
  const sentences = content
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/)
    .filter((part, index, all) => {
      const normalized = part.trim().toLowerCase();
      return (
        pattern.test(part) &&
        normalized.length > 0 &&
        all.findIndex((candidate) => candidate.trim().toLowerCase() === normalized) ===
          index
      );
    })
    .slice(0, limit);

  return sentences.length > 0
    ? sentences.map((sentence) => sentence.trim()).join(" ").slice(0, 1200)
    : null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanScrapedContent(value: string): string {
  const cleaned = value
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(
      /<(script|style|nav|footer|header|aside|noscript|svg|form|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      " ",
    )
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|\/)[^)]+\)/g, "$1")
    .replace(/<(td|th)\b[^>]*>/gi, " ")
    .replace(/<\/(td|th)\s*>/gi, " | ")
    .replace(/<br\b[^>]*>|<\/(p|div|li|h[1-6]|section|article|tr|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/gm, "")
    .replace(/```[\s\S]*?```|`([^`]+)`/g, "$1")
    .replace(/\*\*|__|~~|[*_]/g, "")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\b(?:utm_[a-z0-9_]+|gclid|fbclid|mc_cid|mc_eid)=[^\s&]+/gi, " ")
    .replace(/(?:\?|\s)(?:utm_[a-z0-9_]+|gclid|fbclid|mc_cid|mc_eid)(?:=[^\s&]*)?/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (entity, code: string) => {
      const point = Number.parseInt(code, 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/&#(\d+);/g, (entity, code: string) => {
      const point = Number.parseInt(code, 10);
      return point <= 0x10ffff ? String.fromCodePoint(point) : entity;
    })
    .replace(/&(?:nbsp|amp|quot|lt|gt|apos);/gi, (entity) =>
      decodeEntities(entity),
    )
    .replace(/\r/g, "\n");
  const withoutTableSeparators = cleaned.replace(
    /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm,
    "",
  );

  const seen = new Set<string>();
  const paragraphs = withoutTableSeparators
    .split(/\n+/)
    .map((paragraph) =>
      paragraph
        .replace(/\s*\|\s*/g, " — ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^(?:[-|:]\s*)+|(?:\s*[-|:])+$/g, ""),
    )
    .map((paragraph) => {
      if (!paragraph || paragraph.length < 18) return "";
      if ((paragraph.match(/—/g)?.length ?? 0) >= 2) return "";
      if (
        /^(?:home|menu|navigation|skip to (?:main )?content|accept all|cookie settings|privacy policy|terms(?: of service)?|sign in|log in|share this page|related (?:articles|posts|links)|recommended for you|advertisement|sponsored content|read more|learn more|subscribe|newsletter|we use cookies|this site uses cookies|this website uses cookies|by continuing to browse)\b/i.test(
          paragraph,
        ) ||
        (/\b(?:our mission|join our community|discover more|world[- ]class|empowering|sign up|subscribe|learn more|read more|we are committed)\b/i.test(
          paragraph,
        ) &&
          !/\b(?:eligib|deadline|application|undergraduate|bachelor|tuition|coverage|stipend|scholarship|award|grant)\b/i.test(
            paragraph,
          )) ||
        /\b(?:utm_[a-z]+|tracking pixel|page views|analytics event|enable javascript|javascript required|access denied|page not found|404 error|error(?:\s+(?:loading|fetching|retrieving|processing|occurred|code))?|(?:unable|failed)\s+to\s+(?:load|fetch|retrieve)|internal server error|temporarily unavailable|something went wrong|cloudflare ray id)\b/i.test(
          paragraph,
        )
      ) {
        return "";
      }

      const uniqueSentences: string[] = [];
      for (const sentence of paragraph.split(/(?<=[.!?])\s+/)) {
        const key = sentence
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim();
        if (key && !seen.has(key)) {
          seen.add(key);
          uniqueSentences.push(sentence);
        }
      }
      return uniqueSentences.join(" ").trim();
    })
    .filter((paragraph): paragraph is string => typeof paragraph === "string" && paragraph.length >= 18);

  return paragraphs.join("\n\n").slice(0, 6000);
}

function summarizeScrapedContent(
  content: string,
  intent: "upcoming_events" | "funding",
): string {
  const limit = intent === "funding" ? 700 : 1200;
  if (content.length <= limit) return content;

  const paragraphs = content.split(/\n\n+/);
  const relevantFundingParagraphs = paragraphs.filter((paragraph) =>
    /\b(scholarships?|fellowships?|funding|grants?|applications?|deadlines?|eligib|undergraduate|bachelor|country|countries|tuition|stipend|coverage|awards?)\b/i.test(
      paragraph,
    ),
  );
  const summaryContent =
    intent === "funding" && relevantFundingParagraphs.length > 0
      ? relevantFundingParagraphs.join("\n\n")
      : content;
  const summary = summaryContent.slice(0, limit);
  const lastBoundary = Math.max(
    summary.lastIndexOf(". "),
    summary.lastIndexOf("\n"),
  );
  return summary.slice(0, lastBoundary > limit * 0.6 ? lastBoundary + 1 : limit).trim();
}

function getFundingEvidenceText(content: string): string {
  const relevantSentence =
    /\b(scholarships?|fellowships?|financial aid|funding|grants?|awards?|applications?|applicants?|deadlines?|eligib|open to|citizens|nationals|country|countries|undergraduate|undergrad|bachelor|computer science|computing|tuition|travel|airfare|accommodation|housing|living costs?|living expenses|visa|blocked account|financial resources|stipend|fee waiver|tuition waiver|tuition discount|tuition-free|loan|fully funded|partially funded|all subjects|all fields|women|female|men|male|must be enrolled|restricted to students|not eligible|ineligible|excluded|cannot apply)\b/i;
  const genericSentence =
    /\b(?:read more|learn more|subscribe|newsletter|our mission|join our community|discover more|world[- ]class|empowering|sign up|follow us|contact us)\b/i;
  const seen = new Set<string>();
  return content
    .split(/\n+/)
    .map((paragraph) =>
      paragraph
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => {
          const key = sentence.toLowerCase();
          if (
            sentence.length < 18 ||
            !relevantSentence.test(sentence) ||
            genericSentence.test(sentence) ||
            seen.has(key)
          ) {
            return false;
          }
          seen.add(key);
          return true;
        })
        .join(" "),
    )
    .filter((paragraph) => paragraph.length > 0)
    .join("\n");
}

function cleanSearchTitle(value: string): string {
  return decodeEntities(
    value
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]*>/g, " ")
      .replace(/^\s{0,3}#{1,6}\s+/, "")
      .replace(/\*\*|__|~~|[*_`]/g, "")
      .replace(/\s*[|·—-]\s*(?:home|homepage|official website|scholarship portal)\s*$/i, "")
      .replace(/\s+/g, " ")
      .trim(),
  ).slice(0, 300);
}

function findApplicationLink(
  rawContent: string | null | undefined,
  sourceUrl: string,
): string | null {
  if (!rawContent) return null;
  const linkContent = rawContent.replace(
    /<(script|style|nav|header|footer|aside|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    " ",
  );
  const candidates: { label: string; href: string }[] = [];

  for (const match of linkContent.matchAll(
    /\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/gi,
  )) {
    candidates.push({ label: match[1], href: match[2] });
  }
  for (const match of linkContent.matchAll(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
  )) {
    candidates.push({
      label: match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      href: match[1]
        .replace(/&amp;/gi, "&")
        .replace(/&quot;|&#34;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'"),
    });
  }

  for (const candidate of candidates) {
    if (
      !/\b(?:apply(?:\s+now|\s+online)?|application(?:\s+(?:portal|form|page|system))?)\b/i.test(
        candidate.label,
      )
    ) {
      continue;
    }
    try {
      const url = new URL(candidate.href, sourceUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      for (const parameter of [...url.searchParams.keys()]) {
        if (/^(?:utm_.+|gclid|fbclid|mc_cid|mc_eid)$/i.test(parameter)) {
          url.searchParams.delete(parameter);
        }
      }
      url.hash = "";
      return url.toString();
    } catch {
      continue;
    }
  }

  return null;
}

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function parseDate(value: string): string | null {
  const isoMatch = value.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== `${year}-${month}-${day}`
      ? null
      : `${year}-${month}-${day}`;
  }

  const monthNames = Object.keys(MONTHS).join("|");
  const monthFirst = new RegExp(
    `\\b(${monthNames})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*(?:-|–|to)\\s*\\d{1,2})?(?:,)?\\s+(20\\d{2})\\b`,
    "i",
  );
  const dayFirst = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*(?:-|–|to)\\s*\\d{1,2})?\\s+(${monthNames})\\.?[,]?\\s+(20\\d{2})\\b`,
    "i",
  );
  const match = value.match(monthFirst) ?? value.match(dayFirst);
  if (!match) return null;

  const month = MONTHS[match[1].toLowerCase()];
  const isMonthFirst = month !== undefined;
  const monthIndex = isMonthFirst
    ? month
    : MONTHS[match[2].toLowerCase()];
  const day = Number(isMonthFirst ? match[2] : match[1]);
  const year = Number(match[3]);
  if (monthIndex === undefined) return null;
  const date = new Date(Date.UTC(year, monthIndex, day));

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === monthIndex &&
    date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null;
}

function findDatedEvidence(
  content: string,
  pattern: RegExp,
  excludeNonEventDates = false,
): { evidence: string | null; date: string | null } {
  const sentence = content
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/)
    .find(
      (part) =>
        pattern.test(part) &&
        (!excludeNonEventDates ||
          !/\b(deadline|application(?:s)? (?:close|due)|apply by|registration|published|updated|announced|announcement)\b/i.test(
            part,
          )) &&
        parseDate(part),
    );

  return {
    evidence: sentence?.trim().slice(0, 500) ?? null,
    date: sentence ? parseDate(sentence) : null,
  };
}

function getDeadlineStatus(
  date: string | null,
  today: string,
): "future" | "past" | "unknown" {
  if (!date) return "unknown";
  return date >= today ? "future" : "past";
}

function isGovernmentOrEducationDomain(url: string): boolean {
  const hostname = new URL(url).hostname.toLowerCase();
  return (
    /(?:^|\.)gov(?:\.[a-z]{2})?$/.test(hostname) ||
    /(?:^|\.)edu(?:\.[a-z]{2})?$/.test(hostname) ||
    /(?:^|\.)ac\.[a-z]{2}$/.test(hostname)
  );
}

function isUniversityDomain(sourceUrl: string): boolean {
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    return (
      /(?:^|\.)edu(?:\.[a-z]{2})?$/.test(hostname) ||
      /(?:^|\.)ac\.[a-z]{2}$/.test(hostname)
    );
  } catch {
    return false;
  }
}

function isPrimarySourceCandidate(
  sourceUrl: string,
  hasRetrievedPageContent: boolean,
): boolean {
  if (!hasRetrievedPageContent) return false;
  try {
    const hostname = new URL(sourceUrl).hostname.toLowerCase();
    const officialProviderDomains = [
      "studyinkorea.go.kr",
      "turkiyeburslari.gov.tr",
      "stipendiumhungaricum.hu",
      "daad.de",
      "make-it-in-germany.com",
      "auswaertiges-amt.de",
    ];
    if (
      isGovernmentOrEducationDomain(sourceUrl) ||
      officialProviderDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      )
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function hasOpenApplicationEvidence(content: string): boolean {
  return content
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/)
    .some(
      (sentence) =>
        /\b(?:applications? (?:are )?(?:(?:now|currently) )?open|accepting applications (?:now|currently)|application (?:period|window) (?:is )?(?:now|currently )?open|the application cycle is open)\b/i.test(
          sentence,
        ) &&
        !/\b(?:not|never|no longer|not yet)\b/i.test(sentence),
    );
}

function findFutureApplicationCycle(
  content: string,
  today: string,
): string | null {
  const sentence = content
    .split(/(?:\r?\n)+|(?<=[.!?])\s+/)
    .find(
      (part) =>
        /\b(?:application cycle|applications?|scholarship round)\b/i.test(part) &&
        /\b(?:will open|opens|opening|will begin|begins|starts|next cycle|next round)\b/i.test(
          part,
        ) &&
        !/\b(?:will not|won't|not|never|cancelled|canceled)\b/i.test(part) &&
        parseDate(part) !== null &&
        (parseDate(part) as string) > today,
    );

  return sentence?.trim().slice(0, 500) ?? null;
}

function hasClosedApplicationEvidence(content: string): boolean {
  return /\b(?:applications? (?:are )?(?:now )?closed|no longer accepting applications|application period (?:is )?closed|funding is closed|fully allocated|fully awarded)\b/i.test(
    content,
  );
}

function isRestrictedForBangladeshiUndergraduates(
  content: string,
): boolean {
  const explicitBangladeshExclusion =
    /\b(?:Bangladesh(?:i)?|citizens? of Bangladesh|nationals? of Bangladesh)\b.{0,60}\b(?:not eligible|excluded|cannot apply|ineligible)\b|\b(?:not eligible|excluded|cannot apply|ineligible)\b.{0,60}\b(?:Bangladesh(?:i)?|citizens? of Bangladesh|nationals? of Bangladesh)\b/i.test(
      content,
    );
  const exclusiveCountryRequirement =
    /\b(?:only|exclusively)\s+(?:for|open to)\s+(?:citizens|residents|nationals|students)\s+of\s+[A-Z][\w-]+|\b(?:citizens|residents|nationals|applicants?)\s+of\s+[A-Z][\w-]+\s+only\b/i.test(content);
  const graduateOnlyRequirement =
    /\b(?:graduate|postgraduate|master'?s|PhD|doctoral)\b.{0,45}\b(?:students?|candidates?|applicants?)\s+only\b|\bonly\s+(?:graduate|postgraduate|master'?s|PhD|doctoral)\s+(?:students?|candidates?)\b|\b(?:for|open to)\s+(?:master'?s|PhD|doctoral|postgraduate)\b.{0,35}\b(?:students?|candidates?)\b/i.test(content) &&
    !/\b(?:undergraduate|undergrad|bachelor'?s?)\b/i.test(content);

  return (
    explicitBangladeshExclusion ||
    (exclusiveCountryRequirement &&
      !/\bBangladesh(?:i)?\b/i.test(content)) ||
    graduateOnlyRequirement
  );
}

function getOpportunityType(
  content: string,
  title: string,
  sourceUrl: string,
): WebSearchResult["opportunityType"] {
  if (
    /\b(?:scholarship database|database of scholarships|scholarship directory|directory of scholarships|scholarship search (?:tool|portal|database)|search scholarships|scholarship roundup|list of scholarships)\b/i.test(
      `${title}\n${content}`,
    )
  ) {
    return "other_funding";
  }

  if (
    /\b(?:student loans?|education loans?|educational loans?|loan funding|loan program(?:me)?)\b/i.test(
      `${title}\n${content}`,
    )
  ) {
    return "student_loan";
  }

  if (
    /\b(?:graduate|postgraduate|master'?s|PhD|doctoral)\b.{0,45}\b(?:students?|candidates?|applicants?|funding|scholarships?)\b/i.test(content) &&
    !/\b(?:undergraduate|undergrad|bachelor'?s?)\b/i.test(content)
  ) {
    return "graduate_funding";
  }

  if (
    /\b(?:tuition(?: fees?)? (?:are )?(?:generally )?(?:free|not charged|waived)|(?:do not|does not|generally do not) charge tuition(?: fees?)?|(?:generally )?no fees for .{0,60}(?:courses?|programmes?|programs?)|no tuition fees|tuition-free education|semester contribution)\b/i.test(
      content,
    ) &&
    !/\b(?:scholarship|fellowship|grant|award|financial aid)\b/i.test(content)
  ) {
    return "tuition_policy";
  }

  if (
    /\b(?:tuition fee waiver|tuition waiver|waiver of tuition|tuition discount|tuition fee discount|discount on tuition)\b/i.test(
      `${title}\n${content}`,
    )
  ) {
    return isUniversityDomain(sourceUrl)
      ? "university_tuition_waiver"
      : "tuition_discount";
  }

  if (
    /\b(?:women|female|men|male)(?:'s)?\s+(?:applicants?|students?|candidates?)\s+only\b|\b(?:only|exclusively)\s+(?:for|open to)\s+(?:women|men|female|male)\b|\b(?:women|female|men|male)(?:'s)?\s+(?:scholarship|fellowship|award|grant)\b/i.test(
      content,
    )
  ) {
    return "gender_restricted";
  }

  if (
    /\b(?:only for students? (?:at|from|of)|must be enrolled at|restricted to students? at|exclusively for students? at)\s+[A-Z][\w&.' -]{2,80}\b/i.test(
      content,
    )
  ) {
    return "institution_restricted";
  }

  if (
    /\bconference|student travel grant|travel grant to attend|travel support to attend|student volunteer\b/i.test(
      content,
    )
  ) {
    return "conference_travel_grant";
  }

  if (
    /\b(?:scholarship|fellowship|financial aid|tuition waiver)\b/i.test(content) &&
    /\b(?:undergraduate|undergrad|bachelor'?s?)\b/i.test(content)
  ) {
    return "undergraduate_scholarship";
  }

  return "other_funding";
}

function getTargetFit(input: {
  content: string;
  sourceRole: WebSearchResult["sourceRole"];
  opportunityType: WebSearchResult["opportunityType"];
}): WebSearchResult["targetFit"] {
  if (input.sourceRole !== "primary_source_candidate") return "unconfirmed";

  const content = input.content;
  const explicitSubjectExclusion =
    /\b(?:computer science|computing|CS)\b.{0,60}\b(?:not eligible|excluded|cannot apply|ineligible)\b|\b(?:not eligible|excluded|cannot apply|ineligible)\b.{0,60}\b(?:computer science|computing|CS)\b/i.test(
      content,
    );
  if (
    isRestrictedForBangladeshiUndergraduates(content) ||
    explicitSubjectExclusion ||
    input.opportunityType === "gender_restricted" ||
    input.opportunityType === "institution_restricted" ||
    input.opportunityType === "graduate_funding"
  ) {
    return "restricted";
  }

  const matchingEligibilityBlock = content.split(/\n+/).some((block) => {
    const countryConfirmed =
      /\bBangladesh(?:i)?\b/i.test(block) &&
      /\b(?:eligible|eligibility|may apply|can apply|open to|citizens?|nationals?|eligible countries include)\b/i.test(
        block,
      ) &&
      !/\b(?:not eligible|ineligible|cannot apply|excluded)\b/i.test(block);
    const positiveEligibility =
      /\b(?:eligible|eligibility|may apply|can apply|open to|fields?|disciplines?|programs?|degrees?)\b/i.test(
        block,
      ) &&
      !/\b(?:not eligible|ineligible|cannot apply|excluded)\b/i.test(block);
    const subjectConfirmed =
      /\b(?:computer science|computing|computer engineering|software engineering|STEM|artificial intelligence|machine learning|data science)\b/i.test(
        block,
      ) && positiveEligibility;
    const allSubjectsConfirmed =
      /\ball (?:academic )?fields of study\b|\ball subjects\b/i.test(block);
    return (
      countryConfirmed &&
      /\b(?:undergraduate|undergrad|bachelor'?s?)\b/i.test(block) &&
      (subjectConfirmed || allSubjectsConfirmed)
    );
  });

  return input.opportunityType === "undergraduate_scholarship" &&
    matchingEligibilityBlock
    ? "confirmed"
    : "unconfirmed";
}

function scoreRelevance(text: string): number {
  const normalized = text.toLowerCase();
  let score = 0;

  if (/\bbangladesh(?:i)?\b/.test(normalized)) score += 2;
  if (/\bundergraduate|undergrad|bachelor'?s?\b/.test(normalized)) score += 2;
  if (/\bcomputer science|computing|artificial intelligence|\bai\b|\bcs\b|machine learning|data science|software engineering\b/.test(normalized)) {
    score += 2;
  }
  if (/\bconference|scholarship|travel grant|fee waiver|student volunteer|funding\b/.test(normalized)) {
    score += 1;
  }

  return score;
}

function getOpportunityStatus(input: {
  deadlineStatus: "future" | "past" | "unknown";
  eventDateStatus: "upcoming" | "concluded" | "unknown";
  openEvidence: boolean;
  futureApplicationCycle: boolean;
  closedEvidence: boolean;
  eligibilityRestricted: boolean;
  isConferenceFunding: boolean;
  isNonScholarshipFunding: boolean;
  primarySourceCandidate: boolean;
}): {
  status: WebSearchResult["status"];
  statusReason: string;
} {
  if (input.isNonScholarshipFunding) {
    return {
      status: "not_applicable",
      statusReason:
        "This is a tuition policy, fee waiver, discount, or loan rather than a scholarship application.",
    };
  }

  if (!input.primarySourceCandidate && input.deadlineStatus === "unknown") {
    return {
      status: "status_unconfirmed",
      statusReason:
        "This is a discovery source, not a primary scholarship-provider or official application source. Confirm application status with the provider.",
    };
  }

  if (input.isConferenceFunding && input.eventDateStatus === "concluded") {
    return {
      status: "closed",
      statusReason: "The funding is tied to a concluded event.",
    };
  }

  if (input.deadlineStatus === "past" && !input.futureApplicationCycle) {
    return {
      status: "closed",
      statusReason: "The source shows that the application deadline has passed.",
    };
  }

  if (input.closedEvidence && !input.futureApplicationCycle) {
    return {
      status: "closed",
      statusReason: "The source explicitly says applications are closed.",
    };
  }

  if (!input.primarySourceCandidate) {
    return {
      status: "status_unconfirmed",
      statusReason:
        "This is a discovery source, not a primary scholarship-provider or official application source. Confirm application status with the provider.",
    };
  }

  if (input.eligibilityRestricted) {
    return {
      status: "eligibility_restricted",
      statusReason:
        "Retrieved source text indicates a country or academic-level restriction. Confirm the exact criteria with the provider.",
    };
  }

  if (input.openEvidence && input.deadlineStatus !== "past") {
    return {
      status: "open",
      statusReason:
        "The retrieved source explicitly says applications are open. Confirm details on the source page.",
    };
  }

  if (input.futureApplicationCycle) {
    return {
      status: "upcoming",
      statusReason:
        "The retrieved source describes a future application cycle. Confirm the cycle details on the provider's source page.",
    };
  }

  return {
    status: "status_unconfirmed",
    statusReason:
      "The retrieved source does not confirm whether applications are open or when the next application cycle begins.",
  };
}

/* =========================================================
   Web search
========================================================= */

/**
 * Server-side Tavily search.
 *
 * Search results are unverified by default.
 * A result must not be marked official or verified merely
 * because Tavily returned it.
 */
export async function searchWeb(input: {
  query: string;
  maxResults?: number;
  intent: "upcoming_events" | "funding";
}): Promise<WebSearchResponse> {
  const parsed = searchArgsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      query: input.query,
      results: [],
      message: "Invalid web search parameters.",
    };
  }

  const {
    query,
    maxResults = DEFAULT_MAX_RESULTS,
    intent,
  } = parsed.data;

  if (!TAVILY_API_KEY) {
    console.error("[TISA AI] TAVILY_API_KEY is not configured.");

    return {
      success: false,
      query,
      results: [],
      message: "Web search is not configured.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(TAVILY_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: `${query} ${
          intent === "funding"
            ? "official scholarship provider university application portal eligibility deadline current application"
            : "conference student registration"
        }`,
        topic: "general",
        search_depth: "advanced",
        max_results: maxResults,
        include_answer: false,
        include_raw_content: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[TISA AI] Tavily search failed.", {
        status: response.status,
      });

      return {
        success: false,
        query,
        results: [],
        message:
          response.status === 429
            ? "Web search rate limit reached."
            : "The web search provider returned an error.",
      };
    }

    const rawData: unknown = await response.json();
    const parsedResponse = tavilyResponseSchema.safeParse(rawData);

    if (!parsedResponse.success) {
      console.error("[TISA AI] Invalid Tavily response structure.");

      return {
        success: false,
        query,
        results: [],
        message: "The web search provider returned invalid data.",
      };
    }

    // Timestamp records when this search response was processed.
    const lastCheckedAt = new Date().toISOString();

    const today = lastCheckedAt.slice(0, 10);
    const results: WebSearchResult[] = parsedResponse.data.results
      .map((item): WebSearchResult => {
        const rawPageContent = item.raw_content?.trim() ?? "";
        const hasRetrievedPageContent = rawPageContent.length > 0;
        const cleanedContent = cleanScrapedContent(
          hasRetrievedPageContent ? rawPageContent : item.content,
        );
        const evidenceText =
          intent === "funding" && hasRetrievedPageContent
            ? getFundingEvidenceText(cleanedContent)
            : intent === "funding"
              ? ""
              : cleanedContent;
        const content = summarizeScrapedContent(
          intent === "funding" && hasRetrievedPageContent
            ? evidenceText
            : cleanedContent,
          intent,
        );
        const sourceText = evidenceText;
        const title = cleanSearchTitle(item.title);
        const applicationUrl = findApplicationLink(
          item.raw_content,
          item.url,
        );
        const sourceRole = isPrimarySourceCandidate(
          item.url,
          hasRetrievedPageContent,
        )
          ? "primary_source_candidate"
          : "discovery_source";
        const deadlineFact = findDatedEvidence(
          sourceText,
          /\b(?:deadline|apply by|application(?:s)? (?:close|due)|application period (?:ends?|closes?)|last date|due on|closes on|applications close|submit by)\b/i,
        );
        const futureApplicationCycle = findFutureApplicationCycle(
          evidenceText,
          today,
        );
        const eventFact = findDatedEvidence(
          sourceText,
          /\b(?:event|conference|summit|workshop|symposium|congress)\b.{0,80}\b(?:dates?|takes place|will be held|held|scheduled|runs|from|on|will occur|occurs|is)\b|\b(?:dates?|takes place|will be held|held|scheduled|runs|from|on|will occur|occurs)\b.{0,80}\b(?:event|conference|summit|workshop|symposium|congress)\b/i,
          true,
        );
        const eventDateStatus = !eventFact.date
          ? "unknown"
          : eventFact.date > today
            ? "upcoming"
            : "concluded";
        const opportunityType = getOpportunityType(
          `${title}\n${hasRetrievedPageContent ? sourceText : cleanedContent}`,
          title,
          item.url,
        );
        const targetFit = getTargetFit({
          content: sourceText,
          sourceRole,
          opportunityType,
        });
        const eligibilityRestricted =
          sourceRole === "primary_source_candidate" &&
          (targetFit === "restricted" ||
            isRestrictedForBangladeshiUndergraduates(sourceText) ||
            opportunityType === "graduate_funding" ||
            opportunityType === "gender_restricted" ||
            opportunityType === "institution_restricted");
        const isConferenceFunding =
          opportunityType === "conference_travel_grant";
        const confirmedDeadlineFact =
          sourceRole === "primary_source_candidate" ? deadlineFact : null;
        const deadlineStatus = getDeadlineStatus(
          confirmedDeadlineFact?.date ?? null,
          today,
        );
        const opportunityStatus = getOpportunityStatus({
          deadlineStatus,
          eventDateStatus,
          openEvidence: hasOpenApplicationEvidence(evidenceText),
          futureApplicationCycle: futureApplicationCycle !== null,
          closedEvidence: hasClosedApplicationEvidence(evidenceText),
          eligibilityRestricted,
          isConferenceFunding,
          isNonScholarshipFunding: [
            "tuition_policy",
            "university_tuition_waiver",
            "tuition_discount",
            "student_loan",
          ].includes(opportunityType),
          primarySourceCandidate: sourceRole === "primary_source_candidate",
        });
        const relevanceScore = scoreRelevance(`${title}\n${sourceText}`);
        const confirmedApplicationUrl =
          sourceRole === "primary_source_candidate" ? applicationUrl : null;

        return {
          title,
          url: item.url,
          content,
          score: item.score ?? null,
          publishedDate: item.published_date ?? null,
          sourceUrl: item.url,
          sourceName: getSourceName(item.url),
          sourceClassification: isGovernmentOrEducationDomain(item.url)
            ? "government_or_education_domain"
            : "other",
          sourceRole,
          verificationStatus: "unverified" as const,
          lastCheckedAt,
          deadline: confirmedDeadlineFact?.evidence ?? null,
          deadlineStatus,
          applicationUrl: confirmedApplicationUrl,
          eligibility:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  sourceText,
                  /\b(?:eligib\w*|who can apply|applicants? must|open to|citizens? of|nationality|must be enrolled|students? from)\b/i,
                )
              : null,
          eventDate: eventFact.evidence,
          eventDateStatus,
          registration: findEvidenceSentence(
            sourceText,
            /\b(student registration|student rate|student fee|register|registration fee|registration (?:is|closes|deadline|open))\b/i,
          ),
          fundingDetails: findEvidenceSentence(
            sourceText,
            /\b(scholarship|travel grant|fee waiver|funding|financial support|stipend|reimburse)\b/i,
          ),
          eligibleCountries:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  sourceText,
                  /\b(?:eligible countries|countries eligible|open to (?:students?|citizens?|applicants?) from|applicants? from|citizens? of|nationals? of)\b|\bBangladesh(?:i)?\b.{0,100}\b(?:eligible|eligibility|may apply|can apply|open to|students?|citizens?|nationals?)\b/i,
                )
              : null,
          academicLevel:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  sourceText,
                  /\b(?:undergraduate|undergrad|bachelor'?s?|graduate|master'?s?|PhD|doctoral|academic level)\b/i,
                )
              : null,
          subjectEligibility:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  sourceText,
                  /\b(?:computer science|computing|computer engineering|software engineering|STEM|artificial intelligence|machine learning|data science|all (?:academic )?fields of study|all subjects)\b/i,
                )
              : null,
          fundingAmount:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  sourceText,
                  /\b(?:fully funded|partially funded|(?:up to|monthly stipend of|stipend of)\s?(?:USD|US\$|BDT|৳|EUR|€|GBP|£|KRW|₩|TRY|₺|HUF|Ft|\$)?\s?\d[\d,.]*|(?:USD|US\$|BDT|৳|EUR|€|GBP|£|KRW|₩|TRY|₺|HUF|Ft|\$)\s?\d[\d,.]*)\b/i,
                )
              : null,
          fundingCoverage:
            sourceRole === "primary_source_candidate"
              ? findEvidenceSentence(
                  evidenceText,
                  /\b(?:covers?|covering|coverage|tuition|travel|airfare|accommodation|housing|living expenses|stipend|meal|registration fee|fee waiver|tuition waiver|tuition discount|fully funded|partially funded)\b/i,
                )
              : null,
          tuitionCost:
            sourceRole === "primary_source_candidate" &&
            opportunityType === "tuition_policy"
                ? findEvidenceSentences(
                    evidenceText,
                    /\b(?:tuition|semester contribution|semester fee|enrolment fee|no fees for|charge fees?)\b/i,
                    5,
                  )
                : null,
          livingCost:
            sourceRole === "primary_source_candidate" &&
            opportunityType === "tuition_policy"
                ? findEvidenceSentence(
                    evidenceText,
                    /\b(?:living costs?|living expenses?|cost of living)\b/i,
                  )
                : null,
          visaFinancialRequirement:
            sourceRole === "primary_source_candidate" &&
            opportunityType === "tuition_policy"
                ? findEvidenceSentence(
                    evidenceText,
                    /\b(?:visa|proof of financial|financial resources|blocked account|financial security)\b/i,
                  )
                : null,
          paperRequirements: findEvidenceSentence(
            sourceText,
            /\b(?:paper submission|paper acceptance|accepted papers?|abstract submission|submit an abstract|present a paper|poster presentation|research paper)\b/i,
          ),
          opportunityType,
          status: opportunityStatus.status,
          statusReason: opportunityStatus.statusReason,
          relevance:
            targetFit !== "confirmed" || eligibilityRestricted
              ? "other"
              : relevanceScore >= 6
              ? "priority"
              : relevanceScore >= 3
                ? "related"
                : "other",
          targetFit,
        };
      })
      .filter((result) =>
        input.intent === "funding" ? result.content.length > 0 : true,
      )
      .filter((result) =>
        input.intent === "upcoming_events"
          ? result.eventDateStatus === "upcoming"
          : true,
      )
      .sort((a, b) => {
        const isVerifiedUndergraduate = (result: WebSearchResult) =>
          result.opportunityType === "undergraduate_scholarship" &&
          result.sourceRole === "primary_source_candidate" &&
          result.targetFit === "confirmed" &&
          result.status !== "closed" &&
          result.status !== "eligibility_restricted";
        if (isVerifiedUndergraduate(a) !== isVerifiedUndergraduate(b)) {
          return isVerifiedUndergraduate(a) ? -1 : 1;
        }
        const typePriority = (type: WebSearchResult["opportunityType"]) =>
          type === "undergraduate_scholarship"
            ? 0
            : type === "university_tuition_waiver"
              ? 1
              : 2;
        if (typePriority(a.opportunityType) !== typePriority(b.opportunityType)) {
          return typePriority(a.opportunityType) - typePriority(b.opportunityType);
        }
        if (
          (a.sourceRole === "primary_source_candidate") !==
          (b.sourceRole === "primary_source_candidate")
        ) {
          return a.sourceRole === "primary_source_candidate" ? -1 : 1;
        }
        if (
          (a.status === "eligibility_restricted") !==
          (b.status === "eligibility_restricted")
        ) {
          return a.status === "eligibility_restricted" ? 1 : -1;
        }
        const relevancePriority = (relevance: WebSearchResult["relevance"]) =>
          relevance === "priority" ? 0 : relevance === "related" ? 1 : 2;
        if (relevancePriority(a.relevance) !== relevancePriority(b.relevance)) {
          return relevancePriority(a.relevance) - relevancePriority(b.relevance);
        }
        const statusPriority = (status: WebSearchResult["status"]) =>
          status === "open"
            ? 0
            : status === "upcoming"
              ? 1
              : status === "status_unconfirmed"
                ? 2
                : status === "eligibility_restricted"
                  ? 3
                  : 4;
        if (statusPriority(a.status) !== statusPriority(b.status)) {
          return statusPriority(a.status) - statusPriority(b.status);
        }
        if (a.sourceClassification !== b.sourceClassification) {
          return a.sourceClassification === "government_or_education_domain"
            ? -1
            : 1;
        }
        return (b.score ?? 0) - (a.score ?? 0);
      });

    const uniqueResults = deduplicateWebSearchResults(results);

    return {
      success: true,
      query,
      results: uniqueResults,
      message:
        uniqueResults.length > 0
          ? input.intent === "upcoming_events"
            ? "Only results with an explicit future event date in the retrieved source text are included. Dates and other claims remain unverified until confirmed on the original page."
            : "Potential undergraduate matches require retrieved official-page evidence for Bangladesh eligibility, undergraduate level, and CS/STEM fit. Search snippets and third-party pages are discovery leads only; missing details are Not confirmed."
          : input.intent === "upcoming_events"
            ? "No results with an explicitly supported future event date were found; past and undated results were excluded."
            : "No matching opportunity results were returned.",
    };
  } catch (error) {
    const timedOut =
      error instanceof Error && error.name === "AbortError";

    console.error("[TISA AI] Web search request failed.", {
      timedOut,
      message:
        error instanceof Error
          ? error.message
          : "Unknown search error",
    });

    return {
      success: false,
      query,
      results: [],
      message: timedOut
        ? "The web search request timed out."
        : "Web search is temporarily unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
