/* =========================================================
   TISA AI — Gemini Model Configuration
   ========================================================= */

/**
 * All Gemini models used by TISA Global.
 *
 * Change model names here whenever you want to switch models.
 *
 * Example:
 *
 * primary.name = "your-new-gemini-model"
 *
 * You should not need to change gemini.ts just to switch models.
 */
import { ThinkingLevel } from "@google/genai";

export type GeminiThinkingLevel = ThinkingLevel;

export type GeminiModelConfig = {
  name: string;
  thinkingLevel: GeminiThinkingLevel;
};

/* =========================================================
   Model Configuration
   ========================================================= */

export const GEMINI_MODELS = {
  /**
   * Main model used for normal TISA AI requests.
   */
  primary: {
    name: process.env.GEMINI_MODEL ?? "gemini-flash-latest",
    thinkingLevel: ThinkingLevel.MEDIUM,
  },

  /**
   * Used only when the primary model fails because of
   * a temporary provider/server problem.
   *
   * It is NOT used for quota/rate-limit errors.
   */
  fallback: {
    name:
      process.env.GEMINI_FALLBACK_MODEL ??
      "gemini-flash-lite-latest",
    thinkingLevel: ThinkingLevel.MEDIUM,
  },

  /**
   * Reserved for future use.
   *
   * We currently do not automatically call this model
   * because unnecessary fallback requests can consume
   * additional free-tier quota.
   */
  secondFallback: {
    name:
      process.env.GEMINI_SECOND_FALLBACK_MODEL ??
      "gemini-3.5-flash-lite",
    thinkingLevel: ThinkingLevel.LOW,
  },
} satisfies Record<string, GeminiModelConfig>;

/* =========================================================
   Convenience Exports
   ========================================================= */

/**
 * Primary TISA AI model.
 */
export const PRIMARY_GEMINI_MODEL = GEMINI_MODELS.primary;

/**
 * Fallback TISA AI model.
 */
export const FALLBACK_GEMINI_MODEL = GEMINI_MODELS.fallback;

/**
 * Second fallback model.
 *
 * Currently reserved and not automatically used.
 */
export const SECOND_FALLBACK_GEMINI_MODEL =
  GEMINI_MODELS.secondFallback;