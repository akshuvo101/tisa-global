"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getUtcDateToday } from "@/lib/articles/format";

type ArticleStatus = "draft" | "published" | "archived";

type Article = {
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
  status: ArticleStatus;
};

type ArticleFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  source_links: string;
  last_verified_at: string;
};

const emptyForm: ArticleFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "",
  tags: "",
  seo_title: "",
  seo_description: "",
  source_links: "[]",
  last_verified_at: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toForm(article: Article): ArticleFormValues {
  return {
    title: article.title ?? "",
    slug: article.slug ?? "",
    excerpt: article.excerpt ?? "",
    content: article.content ?? "",
    cover_image_url: article.cover_image_url ?? "",
    category: article.category ?? "",
    tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
    seo_title: article.seo_title ?? "",
    seo_description: article.seo_description ?? "",
    source_links: JSON.stringify(article.source_links ?? [], null, 2),
    last_verified_at: article.last_verified_at?.slice(0, 10) ?? "",
  };
}

function inputClassName() {
  return "mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40";
}

function textareaClassName() {
  return "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40";
}

export default function ArticleForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<ArticleFormValues>(emptyForm);
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!articleId) return;
    let active = true;

    async function loadArticle() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result?.error?.message ?? "Unable to load article.");
        }
        if (!active) return;
        const article = result.data as Article;
        setForm(toForm(article));
        setStatus(article.status);
      } catch (loadError) {
        if (!active) return;
        setMessage({
          type: "error",
          text:
            loadError instanceof Error
              ? loadError.message
              : "Unable to load article.",
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadArticle();
    return () => {
      active = false;
    };
  }, [articleId]);

  function update(field: keyof ArticleFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugEdited ? current.slug : slugify(value),
    }));
  }

  async function save(nextStatus: ArticleStatus) {
    if (!formRef.current?.reportValidity()) return;
    setSaving(true);
    setMessage(null);

    const payload = {
      ...form,
      tags: form.tags
        .split(/[\n,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
      last_verified_at: form.last_verified_at || null,
      status: nextStatus,
    };

    try {
      const response = await fetch(
        articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles",
        {
          method: articleId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message ?? "Unable to save article.");
      }

      if (articleId) {
        setStatus(nextStatus);
        setMessage({ type: "success", text: "Article saved successfully." });
        router.refresh();
      } else {
        router.push("/admin/articles");
        router.refresh();
      }
    } catch (saveError) {
      setMessage({
        type: "error",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Unable to save article.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 text-center text-sm text-slate-400 sm:px-6">
        Loading article...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/articles"
              className="text-sm text-slate-500 transition hover:text-white"
            >
              ← Articles
            </Link>
            <p className="mt-5 text-sm uppercase tracking-[0.2em] text-sky-400">
              Editorial
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {articleId ? "Edit article" : "Create article"}
            </h1>
          </div>
          {articleId && (
            <Link
              href={`/admin/articles/${articleId}/preview`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm text-slate-300 hover:border-sky-300/40 hover:text-white"
            >
              Preview
            </Link>
          )}
        </div>

        {message && (
          <div
            role={message.type === "error" ? "alert" : "status"}
            className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === "error"
                ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-200"
                : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={(event) => event.preventDefault()}
          className="mt-7 space-y-5"
        >
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <h2 className="text-sm font-semibold text-white">Article content</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-medium text-slate-400">
                Title *
                <input
                  required
                  maxLength={250}
                  value={form.title}
                  onChange={(event) => changeTitle(event.target.value)}
                  placeholder="A practical guide to..."
                  className={inputClassName()}
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Slug *
                <input
                  required
                  maxLength={160}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    update("slug", event.target.value.toLowerCase());
                  }}
                  placeholder="a-practical-guide"
                  className={inputClassName()}
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Category *
                <input
                  required
                  maxLength={100}
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                  placeholder="Travel advice"
                  className={inputClassName()}
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Cover image URL
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(event) => update("cover_image_url", event.target.value)}
                  placeholder="https://..."
                  className={inputClassName()}
                />
              </label>
            </div>
            <label className="mt-5 block text-xs font-medium text-slate-400">
              Excerpt
              <textarea
                rows={3}
                maxLength={500}
                value={form.excerpt}
                onChange={(event) => update("excerpt", event.target.value)}
                placeholder="A short summary for readers..."
                className={textareaClassName()}
              />
            </label>
            <label className="mt-5 block text-xs font-medium text-slate-400">
              Content *
              <textarea
                required
                rows={14}
                value={form.content}
                onChange={(event) => update("content", event.target.value)}
                placeholder={"## Start with a clear heading\n\nWrite your article in Markdown. Use **bold**, *emphasis*, lists, and [links](https://example.com)."}
                className={textareaClassName()}
              />
              <span className="mt-1 block text-[11px] text-slate-600">
                Markdown is supported for headings, paragraphs, lists, links, and emphasis. Raw HTML is disabled.
              </span>
            </label>
            <label className="mt-5 block text-xs font-medium text-slate-400">
              Tags <span className="font-normal text-slate-600">(separate with commas)</span>
              <input
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
                placeholder="visas, planning, Europe"
                className={inputClassName()}
              />
            </label>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-7">
            <h2 className="text-sm font-semibold text-white">Search and sources</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-medium text-slate-400">
                SEO title
                <input
                  maxLength={250}
                  value={form.seo_title}
                  onChange={(event) => update("seo_title", event.target.value)}
                  className={inputClassName()}
                />
              </label>
              <label className="text-xs font-medium text-slate-400">
                Last verified date
                <input
                  type="date"
                  max={getUtcDateToday()}
                  value={form.last_verified_at}
                  onChange={(event) => update("last_verified_at", event.target.value)}
                  className={inputClassName()}
                />
                <span className="mt-1 block text-[11px] text-slate-600">
                  Future verification dates are not allowed.
                </span>
              </label>
            </div>
            <label className="mt-5 block text-xs font-medium text-slate-400">
              SEO description
              <textarea
                rows={3}
                maxLength={500}
                value={form.seo_description}
                onChange={(event) => update("seo_description", event.target.value)}
                className={textareaClassName()}
              />
            </label>
            <label className="mt-5 block text-xs font-medium text-slate-400">
              Source links <span className="font-normal text-slate-600">(JSON)</span>
              <textarea
                rows={5}
                value={form.source_links}
                onChange={(event) => update("source_links", event.target.value)}
                placeholder={'[\n  {"label": "Official source", "url": "https://..."}\n]'}
                className={`${textareaClassName()} font-mono text-xs`}
              />
            </label>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600">
              Current status: <span className="capitalize text-slate-400">{status}</span>
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Link
                href="/admin/articles"
                className="inline-flex h-11 items-center rounded-full border border-white/10 px-5 text-sm text-slate-300 hover:border-white/20 hover:text-white"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("draft")}
                className="inline-flex h-11 items-center rounded-full border border-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("published")}
                className="inline-flex h-11 items-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
