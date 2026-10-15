import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/api";
import { articleInputSchema } from "@/lib/articles/validation";

const PAGE_SIZE = 20;
const ARTICLE_COLUMNS =
  "id,title,slug,excerpt,content,cover_image_url,category,tags,seo_title,seo_description,source_links,last_verified_at,status,author_id,published_at,created_at,updated_at";

type ArticleListRow = {
  id: string;
  author_id: string | null;
  category: string | null;
  [key: string]: unknown;
};

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const category = url.searchParams.get("category") ?? "all";
  const status = url.searchParams.get("status") ?? "all";
  const requestedPage = Number(url.searchParams.get("page")) || 1;
  const page = Math.max(1, Math.min(Math.floor(requestedPage), 100_000));

  let query = auth.supabase
    .from("articles")
    .select(ARTICLE_COLUMNS, { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search.replace(/[%_,]/g, " ")}%`);
  }
  if (category !== "all") query = query.eq("category", category);
  if (status !== "all") query = query.eq("status", status);

  const from = (page - 1) * PAGE_SIZE;
  const [{ data: articles, count, error }, { data: categoryRows, error: categoriesError }] =
    await Promise.all([
      query.order("updated_at", { ascending: false }).range(from, from + PAGE_SIZE - 1),
      auth.supabase.from("articles").select("category").order("category"),
    ]);

  if (error || categoriesError) {
    console.error("GET /api/admin/articles failed:", error ?? categoriesError);
    return errorResponse("DATABASE_ERROR", "Unable to load articles.", 500);
  }

  const rows = (articles ?? []) as ArticleListRow[];
  const authorIds = Array.from(
    new Set(rows.map((article) => article.author_id).filter(Boolean)),
  );
  let authors: { id: string; full_name: string | null; email: string | null }[] = [];

  if (authorIds.length) {
    const result = await auth.supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", authorIds);
    if (result.error) {
      console.error("GET /api/admin/articles author lookup failed:", result.error);
      return errorResponse("DATABASE_ERROR", "Unable to load article authors.", 500);
    }
    authors = result.data ?? [];
  }

  const authorMap = new Map<string, string>(
    authors.map((author) => [
      author.id,
      author.full_name?.trim() || author.email || "Admin",
    ]),
  );
  const total = count ?? 0;

  return NextResponse.json({
    success: true,
    data: {
      articles: rows.map((article) => ({
        ...article,
        author_name: article.author_id
          ? authorMap.get(article.author_id) ?? "Admin"
          : "—",
      })),
      categories: Array.from(
        new Set(
          ((categoryRows ?? []) as { category: string | null }[])
            .map((row) => row.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      },
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }

  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues[0]?.message ?? "Article details are invalid.",
        },
      },
      { status: 422 },
    );
  }

  const article = parsed.data;
  const publishedAt =
    article.status === "published" ? new Date().toISOString() : null;
  const { data, error } = await auth.supabase
    .from("articles")
    .insert({
      ...article,
      last_verified_at: article.last_verified_at
        ? `${article.last_verified_at}T00:00:00.000Z`
        : null,
      author_id: auth.user.id,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .select(ARTICLE_COLUMNS)
    .single();

  if (error) {
    console.error("POST /api/admin/articles failed:", error);
    if (error.code === "23505") {
      return errorResponse("SLUG_CONFLICT", "That slug is already in use.", 409);
    }
    return errorResponse("DATABASE_ERROR", "Unable to create article.", 500);
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
