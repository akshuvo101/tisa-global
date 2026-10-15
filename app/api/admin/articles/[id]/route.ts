import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/api";
import {
  articleInputSchema,
  articleStatusUpdateSchema,
  type ArticleStatus,
} from "@/lib/articles/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ARTICLE_COLUMNS =
  "id,title,slug,excerpt,content,cover_image_url,category,tags,seo_title,seo_description,source_links,last_verified_at,status,author_id,published_at,created_at,updated_at";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status },
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const { data: article, error } = await auth.supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(`GET /api/admin/articles/${id} failed:`, error);
    return errorResponse("DATABASE_ERROR", "Unable to load article.", 500);
  }
  if (!article) return errorResponse("NOT_FOUND", "Article not found.", 404);

  let authorName = "—";
  if (article.author_id) {
    const { data: author, error: authorError } = await auth.supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", article.author_id)
      .maybeSingle();
    if (authorError) {
      console.error(`GET /api/admin/articles/${id} author lookup failed:`, authorError);
      return errorResponse("DATABASE_ERROR", "Unable to load article author.", 500);
    }
    authorName = author?.full_name?.trim() || author?.email || "Admin";
  }

  return NextResponse.json({
    success: true,
    data: { ...article, author_name: authorName },
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }

  const statusUpdate = articleStatusUpdateSchema.safeParse(body);
  if (!statusUpdate.success) {
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

    const { data: current, error: currentError } = await auth.supabase
      .from("articles")
      .select("status,published_at")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      console.error(`PATCH /api/admin/articles/${id} lookup failed:`, currentError);
      return errorResponse("DATABASE_ERROR", "Unable to update article.", 500);
    }
    if (!current) return errorResponse("NOT_FOUND", "Article not found.", 404);

    const article = parsed.data;
    const publishedAt =
      article.status === "draft"
        ? null
        : article.status === "published"
          ? current.status === "published" && current.published_at
            ? current.published_at
            : new Date().toISOString()
          : current.published_at;

    const { data, error } = await auth.supabase
      .from("articles")
      .update({
        ...article,
        last_verified_at: article.last_verified_at
          ? `${article.last_verified_at}T00:00:00.000Z`
          : null,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(ARTICLE_COLUMNS)
      .maybeSingle();

    if (error) {
      console.error(`PATCH /api/admin/articles/${id} failed:`, error);
      if (error.code === "23505") {
        return errorResponse("SLUG_CONFLICT", "That slug is already in use.", 409);
      }
      return errorResponse("DATABASE_ERROR", "Unable to update article.", 500);
    }
    if (!data) return errorResponse("NOT_FOUND", "Article not found.", 404);

    return NextResponse.json({ success: true, data });
  }

  const { data: current, error: currentError } = await auth.supabase
    .from("articles")
    .select("status,published_at")
    .eq("id", id)
    .maybeSingle();
  if (currentError) {
    console.error(`PATCH /api/admin/articles/${id} lookup failed:`, currentError);
    return errorResponse("DATABASE_ERROR", "Unable to update article.", 500);
  }
  if (!current) return errorResponse("NOT_FOUND", "Article not found.", 404);

  const nextStatus: ArticleStatus = statusUpdate.data.status;
  const publishedAt =
    nextStatus === "draft"
      ? null
      : nextStatus === "published"
        ? current.status === "published" && current.published_at
          ? current.published_at
          : new Date().toISOString()
        : current.published_at;

  const { data, error } = await auth.supabase
    .from("articles")
    .update({
      status: nextStatus,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(ARTICLE_COLUMNS)
    .maybeSingle();

  if (error) {
    console.error(`PATCH /api/admin/articles/${id} status update failed:`, error);
    return errorResponse("DATABASE_ERROR", "Unable to update article status.", 500);
  }
  if (!data) return errorResponse("NOT_FOUND", "Article not found.", 404);

  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const { data, error } = await auth.supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(`DELETE /api/admin/articles/${id} failed:`, error);
    return errorResponse("DATABASE_ERROR", "Unable to delete article.", 500);
  }
  if (!data) return errorResponse("NOT_FOUND", "Article not found.", 404);

  return NextResponse.json({ success: true, data: { id: data.id } });
}
