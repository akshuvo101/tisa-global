import { createClient } from "@/lib/supabase/server";
import {
  isOptimizableArticleImage,
  isSecureArticleImage,
} from "@/lib/articles/images";

export { isOptimizableArticleImage, isSecureArticleImage };

export type PublicArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  source_links: unknown;
  last_verified_at: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export const publicArticleColumns =
  "id,title,slug,excerpt,content,cover_image_url,category,tags,seo_title,seo_description,source_links,last_verified_at,published_at,updated_at";

export async function getPublishedArticleBySlug(slug: string) {
  const supabase = await createClient();
  return supabase
    .from("articles")
    .select(publicArticleColumns)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
}

export type ArticleSource = {
  label: string;
  url: string;
};

export function getArticleSources(value: unknown): ArticleSource[] {
  let links: unknown = value;
  if (typeof value === "string") {
    try {
      links = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(links)) return [];

  return links.flatMap((entry): ArticleSource[] => {
    if (typeof entry === "string") {
      return safeSource(entry, entry);
    }
    if (!entry || typeof entry !== "object") return [];

    const record = entry as Record<string, unknown>;
    const url = typeof record.url === "string" ? record.url : "";
    const label =
      (typeof record.label === "string" && record.label) ||
      (typeof record.title === "string" && record.title) ||
      (typeof record.name === "string" && record.name) ||
      url;

    return safeSource(label, url);
  });
}

function safeSource(label: string, value: string): ArticleSource[] {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return [];
    return [{ label: label.slice(0, 200), url: url.toString() }];
  } catch {
    return [];
  }
}
