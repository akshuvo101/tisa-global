"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: "draft" | "published" | "archived";
  author_name: string;
  updated_at: string | null;
};

type ListResponse = {
  articles: Article[];
  categories: string[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
};

const statusStyles: Record<Article["status"], string> = {
  published: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  draft: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  archived: "border-slate-400/20 bg-slate-400/[0.06] text-slate-400",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q: search,
      category,
      status,
      page: String(page),
    });

    try {
      const response = await fetch(`/api/admin/articles?${params}`, {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message ?? "Unable to load articles.");
      }

      const data = result.data as ListResponse;
      setArticles(data.articles);
      setCategories(data.categories);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load articles.",
      );
    } finally {
      setLoading(false);
    }
  }, [category, page, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadArticles(), 250);
    return () => window.clearTimeout(timer);
  }, [loadArticles]);

  function updateFilter(update: () => void) {
    update();
    setPage(1);
  }

  async function changeStatus(article: Article, nextStatus: Article["status"]) {
    const action =
      nextStatus === "published"
        ? "publish"
        : nextStatus === "draft"
          ? "unpublish"
          : nextStatus === "archived"
            ? "archive"
            : "restore";
    if (
      nextStatus === "archived" &&
      !window.confirm(`Archive “${article.title}”?`)
    ) {
      return;
    }

    setWorkingId(article.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message ?? `Unable to ${action} article.`);
      }
      await loadArticles();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : `Unable to ${action} article.`,
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteArticle(article: Article) {
    if (
      !window.confirm(
        `Permanently delete “${article.title}”? This cannot be undone.`,
      )
    ) {
      return;
    }

    setWorkingId(article.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error?.message ?? "Unable to delete article.");
      }
      await loadArticles();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete article.",
      );
    } finally {
      setWorkingId(null);
    }
  }

  const firstItem = total === 0 ? 0 : (page - 1) * 20 + 1;
  const lastItem = Math.min(page * 20, total);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-400">
              Editorial
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Article management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Create and maintain trusted travel guidance and editorial content.
            </p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex h-11 items-center justify-center rounded-full bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            + Create article
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px_190px]">
            <label className="sr-only" htmlFor="article-search">Search articles</label>
            <input
              id="article-search"
              value={query}
              onChange={(event) =>
                updateFilter(() => {
                  setQuery(event.target.value);
                  setSearch(event.target.value.trim());
                })
              }
              placeholder="Search by title..."
              className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-sky-400/40"
            />
            <label className="sr-only" htmlFor="article-category">Filter by category</label>
            <select
              id="article-category"
              value={category}
              onChange={(event) =>
                updateFilter(() => setCategory(event.target.value))
              }
              className="h-11 rounded-xl border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none focus:border-sky-400/40"
            >
              <option value="all">All categories</option>
              {categories.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="article-status">Filter by status</label>
            <select
              id="article-status"
              value={status}
              onChange={(event) =>
                updateFilter(() => setStatus(event.target.value))
              }
              className="h-11 rounded-xl border border-white/10 bg-[#101827] px-3 text-sm text-white outline-none focus:border-sky-400/40"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadArticles()}
              className="font-semibold text-white underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          {loading ? (
            <div role="status" className="p-12 text-center text-sm text-slate-400">
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-white">No articles found</h2>
              <p className="mt-2 text-sm text-slate-400">
                {total === 0 && !search && category === "all" && status === "all"
                  ? "Create your first article to get started."
                  : "Try changing your search or filters."}
              </p>
              {total === 0 && !search && category === "all" && status === "all" && (
                <Link
                  href="/admin/articles/new"
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300"
                >
                  Create article
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] border-collapse text-left">
                  <thead className="border-b border-white/[0.08] bg-white/[0.02]">
                    <tr className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      <th className="px-5 py-4">Title</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Author</th>
                      <th className="px-4 py-4">Updated</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {articles.map((article) => (
                      <tr key={article.id} className="align-middle">
                        <td className="max-w-[280px] px-5 py-4">
                          <p className="truncate text-sm font-medium text-white">
                            {article.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-600">
                            /{article.slug}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-300">
                          {article.category || "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${statusStyles[article.status]}`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-400">
                          {article.author_name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
                          {formatDate(article.updated_at)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-3 whitespace-nowrap text-xs">
                            <Link
                              href={`/admin/articles/${article.id}/preview`}
                              className="text-slate-400 transition hover:text-white"
                            >
                              Preview
                            </Link>
                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="text-sky-300 transition hover:text-sky-200"
                            >
                              Edit
                            </Link>
                            {article.status === "published" ? (
                              <button
                                type="button"
                                disabled={workingId === article.id}
                                onClick={() => void changeStatus(article, "draft")}
                                className="text-amber-300 disabled:opacity-50"
                              >
                                Unpublish
                              </button>
                            ) : article.status === "archived" ? (
                              <button
                                type="button"
                                disabled={workingId === article.id}
                                onClick={() => void changeStatus(article, "draft")}
                                className="text-emerald-300 disabled:opacity-50"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={workingId === article.id}
                                onClick={() => void changeStatus(article, "published")}
                                className="text-emerald-300 disabled:opacity-50"
                              >
                                Publish
                              </button>
                            )}
                            {article.status !== "archived" && (
                              <button
                                type="button"
                                disabled={workingId === article.id}
                                onClick={() => void changeStatus(article, "archived")}
                                className="text-slate-400 disabled:opacity-50"
                              >
                                Archive
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={workingId === article.id}
                              onClick={() => void deleteArticle(article)}
                              className="text-rose-300 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-white/[0.08] px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing {firstItem}–{lastItem} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((value) => value - 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="px-2 text-xs">Page {page} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((value) => value + 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
