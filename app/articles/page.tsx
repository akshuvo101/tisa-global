import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage";
import { formatArticleDate } from "@/lib/articles/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Travel Insights & Guides",
  description:
    "Practical, trusted guidance for international travel, conferences, visas, education, and more from TISA Global.",
  alternates: { canonical: "/articles" },
};

const PAGE_SIZE = 12;

type SearchParams = {
  q?: string;
  category?: string;
  page?: string;
};

function pageHref(page: number, search: string, category: string) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (category !== "all") params.set("category", category);
  params.set("page", String(page));
  return `/articles?${params.toString()}`;
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = (params.q ?? "").trim().slice(0, 100);
  const category = params.category?.trim().slice(0, 100) || "all";
  const requestedPage = Number(params.page) || 1;
  const page = Math.max(1, Math.min(Math.floor(requestedPage), 100_000));
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select(
      "id,title,slug,excerpt,cover_image_url,category,tags,published_at",
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (search) {
    query = query.ilike("title", `%${search.replace(/[%_,]/g, " ")}%`);
  }
  if (category !== "all") query = query.eq("category", category);

  const from = (page - 1) * PAGE_SIZE;
  const [{ data: articles, count, error }, { data: categoryRows, error: categoriesError }] =
    await Promise.all([
      query.range(from, from + PAGE_SIZE - 1),
      supabase
        .from("articles")
        .select("category")
        .eq("status", "published")
        .order("category"),
    ]);

  if (error || categoriesError) {
    console.error("Public articles query failed:", error ?? categoriesError);
    throw new Error("Unable to load articles.");
  }

  const rows = articles ?? [];
  const categories = Array.from(
    new Set(
      (categoryRows ?? [])
        .map((row) => row.category)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400">
            TISA Global Journal
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Clarity for every step of your journey.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            Thoughtful travel guides, practical insights, and trusted updates to
            help you plan with confidence.
          </p>
        </div>

        <form
          action="/articles"
          className="mt-9 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[minmax(0,1fr)_240px_auto]"
        >
          <label className="sr-only" htmlFor="article-search">
            Search articles
          </label>
          <input
            id="article-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search travel insights..."
            className="h-12 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/50"
          />
          <label className="sr-only" htmlFor="article-category">
            Filter by category
          </label>
          <select
            id="article-category"
            name="category"
            defaultValue={category}
            className="h-12 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none focus:border-sky-400/50"
          >
            <option value="all">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-12 rounded-xl bg-sky-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Search
          </button>
        </form>

        {rows.length === 0 ? (
          <div
            role="status"
            className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center"
          >
            <h2 className="text-xl font-semibold text-white">
              {search || category !== "all"
                ? "No articles match those filters"
                : "New perspectives are on the way"}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
              {search || category !== "all"
                ? "Try a different search or category to discover more from TISA Global."
                : "Our team is preparing trusted guides and practical travel advice. Please check back soon."}
            </p>
            {(search || category !== "all") && (
              <Link
                href="/articles"
                className="mt-5 inline-flex min-h-11 items-center rounded-full border border-white/10 px-5 text-sm font-medium text-white transition hover:border-sky-300/40"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((article) => {
                const publishedDate = formatArticleDate(article.published_at);
                return (
                  <article
                    key={article.id}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] transition hover:-translate-y-1 hover:border-sky-400/30"
                  >
                    <Link
                      href={`/articles/${article.slug}`}
                      className="block focus-visible:outline-offset-[-4px]"
                    >
                      <ArticleCoverImage
                        src={article.cover_image_url}
                        title={article.title}
                        category={article.category}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="aspect-[16/10]"
                      />
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-sky-300">
                            {article.category}
                          </span>
                          {publishedDate && (
                            <time
                              dateTime={article.published_at}
                              className="text-xs text-slate-500"
                            >
                              {publishedDate}
                            </time>
                          )}
                        </div>
                        <h2 className="mt-4 text-xl font-semibold leading-snug text-white">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                            {article.excerpt}
                          </p>
                        )}
                        {Array.isArray(article.tags) && article.tags.length > 0 && (
                          <ul
                            aria-label="Article topics"
                            className="mt-5 flex flex-wrap gap-2"
                          >
                            {article.tags.slice(0, 3).map((tag: string) => (
                              <li
                                key={tag}
                                className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-slate-500"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        )}
                        <span className="mt-6 inline-flex text-sm font-medium text-sky-300">
                          Read article <span aria-hidden="true" className="ml-2">→</span>
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>

            <nav
              aria-label="Article pages"
              className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6"
            >
              <p className="text-sm text-slate-500">
                Showing {from + 1}–{Math.min(from + rows.length, total)} of {total} articles
              </p>
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link
                    rel="prev"
                    href={pageHref(page - 1, search, category)}
                    className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-4 text-sm text-white hover:border-sky-300/40"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center rounded-xl border border-white/[0.05] px-4 text-sm text-slate-600">
                    Previous
                  </span>
                )}
                <span aria-current="page" className="px-2 text-sm text-slate-400">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    rel="next"
                    href={pageHref(page + 1, search, category)}
                    className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-4 text-sm text-white hover:border-sky-300/40"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center rounded-xl border border-white/[0.05] px-4 text-sm text-slate-600">
                    Next
                  </span>
                )}
              </div>
            </nav>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
