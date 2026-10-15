"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage";
import ArticleMarkdown from "@/components/articles/ArticleMarkdown";
import { formatArticleDate } from "@/lib/articles/format";

type PreviewArticle = {
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
  last_verified_at: string | null;
  status: string;
  author_name: string;
  updated_at: string | null;
};

export default function ArticlePreview({ articleId }: { articleId: string }) {
  const [article, setArticle] = useState<PreviewArticle | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result?.error?.message ?? "Unable to load preview.");
        }
        if (active) setArticle(result.data as PreviewArticle);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load preview.",
          );
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [articleId]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/admin/articles"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Articles
          </Link>
          <Link
            href={`/admin/articles/${articleId}/edit`}
            className="inline-flex h-10 items-center rounded-full border border-white/10 px-4 text-sm text-slate-300 hover:text-white"
          >
            Edit article
          </Link>
        </div>
        {error ? (
          <div role="alert" className="mt-10 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-5 text-sm text-rose-200">
            {error}
          </div>
        ) : !article ? (
          <div role="status" className="py-20 text-center text-sm text-slate-400">
            Loading preview...
          </div>
        ) : (
          <article className="mt-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">
            <ArticleCoverImage
              src={article.cover_image_url}
              title={article.title}
              category={article.category}
              sizes="(max-width: 768px) 100vw, 896px"
              className="aspect-[16/9]"
            />
            <div className="px-5 py-8 sm:px-10 sm:py-12">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sky-300">
                  {article.category}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-slate-400">
                  {article.status}
                </span>
                <span className="text-slate-600">/{article.slug}</span>
              </div>
              <h1 className="mt-7 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="mt-5 text-lg leading-8 text-slate-300">
                  {article.excerpt}
                </p>
              )}
              <p className="mt-6 text-xs text-slate-500">
                By {article.author_name}
                {article.last_verified_at
                  ? ` · Verified ${formatArticleDate(article.last_verified_at)}`
                  : ""}
              </p>
              {article.tags?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.05] px-3 py-1 text-xs text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="my-9 border-t border-white/[0.08]" />
              <ArticleMarkdown content={article.content} />
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
