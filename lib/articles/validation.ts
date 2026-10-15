import { z } from "zod";
import { isVerificationDateAllowed } from "@/lib/articles/format";

const sourceLinksSchema = z.string().transform((value, context) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    context.addIssue({
      code: "custom",
      message: "Source links must contain valid JSON.",
    });

    return z.NEVER;
  }
});

const articleStatusSchema = z.enum(["draft", "published", "archived"]);

export const articleStatusUpdateSchema = z.object({
  action: z.literal("status"),
  status: articleStatusSchema,
});

export const articleInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(250),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphenated slug."),
  excerpt: z.string().trim().max(500).transform((value) => value || null),
  content: z.string().trim().min(1, "Content is required."),
  cover_image_url: z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      if (!value) return true;

      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    }, "Cover image must be an HTTP or HTTPS URL.")
    .transform((value) => value || null),
  category: z.string().trim().min(1, "Category is required.").max(100),
  tags: z.array(z.string().trim().min(1)).max(50),
  seo_title: z.string().trim().max(250).transform((value) => value || null),
  seo_description: z
    .string()
    .trim()
    .max(500)
    .transform((value) => value || null),
  source_links: sourceLinksSchema,
  last_verified_at: z
    .string()
    .refine(
      isVerificationDateAllowed,
      "Enter a valid verification date on or before today (UTC).",
    )
    .nullable(),
  status: articleStatusSchema,
});

export type ArticleStatus = z.infer<typeof articleStatusSchema>;
export type ArticleInput = z.infer<typeof articleInputSchema>;
