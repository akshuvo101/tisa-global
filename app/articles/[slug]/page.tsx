import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleMarkdown from "@/components/articles/ArticleMarkdown";
import ArticleCoverImage from "@/components/articles/ArticleCoverImage";
import { formatArticleDate } from "@/lib/articles/format";
import {
  getArticleSources,
  getPublishedArticleBySlug,
} from "@/lib/articles/public";
import { isSecureArticleImage } from "@/lib/articles/images";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function findArticle(slug: string) {
  const { data, error } = await getPublishedArticleBySlug(slug);
  if (error) {
    console.error("Public article detail query failed:", error);
    throw new Error("Unable to load this article.");
  }
  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) return { title: "Article not found" };

  const title = article.seo_title?.trim() || article.title;
  const description =
    article.seo_description?.trim() ||
    article.excerpt ||
    "Travel guidance and insights from TISA Global.";
  const image = isSecureArticleImage(article.cover_image_url)
    ? article.cover_image_url!
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/articles/${article.slug}`,
      publishedTime: article.published_at ?? undefined,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();

  const publishedDate = formatArticleDate(article.published_at);
  const verifiedDate = formatArticleDate(article.last_verified_at);
  const sources = getArticleSources(article.source_links);
  const supabase = await createClient();
  const { data: relatedArticles, error: relatedError } = await supabase
    .from("articles")
    .select("id,title,slug,excerpt,cover_image_url,category,published_at")
    .eq("status", "published")
    .eq("category", article.category)
    .neq("id", article.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(3);
  if (relatedError) {
    console.error("Related articles query failed:", relatedError);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/articles"
          className="inline-flex min-h-11 items-center text-sm font-medium text-sky-300 transition hover:text-sky-200"
        >
          <span aria-hidden="true" className="mr-2">←</span>
          All articles
        </Link>

        <header className="mt-7">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300">
            {article.category}
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-5 text-lg leading-8 text-slate-300 sm:text-xl">
              {article.excerpt}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {publishedDate && (
              <time dateTime={article.published_at ?? undefined}>
                Published {publishedDate}
              </time>
            )}
            {verifiedDate && (
              <span>
                <span aria-hidden="true" className="mr-2 text-slate-700">·</span>
                Last verified {verifiedDate}
              </span>
            )}
          </div>
        </header>

        <ArticleCoverImage
          src={article.cover_image_url}
          title={article.title}
          category={article.category}
          sizes="(max-width: 768px) 100vw, 896px"
          priority
          className="mt-9 aspect-[16/9] rounded-3xl border border-white/10"
        />

        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <ul aria-label="Article topics" className="mt-7 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <li
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-slate-400"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-14">
          <ArticleMarkdown content={article.content} />
          <aside className="h-fit rounded-2xl border border-sky-400/15 bg-sky-400/[0.04] p-5 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold text-white">
              Planning an international journey?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              TISA can help with travel arrangements, event attendance, and
              practical next steps.
            </p>
            <Link
              href="/request"
              className="mt-4 inline-flex min-h-11 items-center rounded-full bg-sky-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Get assistance
            </Link>
          </aside>
        </div>

        {sources.length > 0 && (
          <section
            aria-labelledby="article-sources-heading"
            className="mt-12 border-t border-white/10 pt-8"
          >
            <h2 id="article-sources-heading" className="text-lg font-semibold text-white">
              Sources and further reading
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm text-sky-300 transition hover:border-sky-300/30 hover:text-sky-200"
                  >
                    <span className="break-words">{source.label}</span>
                    <span aria-hidden="true" className="shrink-0">↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedArticles?.length ? (
          <section
            aria-labelledby="related-articles-heading"
            className="mt-14 border-t border-white/10 pt-9"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-300">
                  Continue exploring
                </p>
                <h2
                  id="related-articles-heading"
                  className="mt-2 text-2xl font-semibold tracking-tight text-white"
                >
                  Related articles
                </h2>
              </div>
              <Link
                href="/articles"
                className="inline-flex min-h-11 items-center text-sm text-slate-400 transition hover:text-white"
              >
                Browse all articles <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <article
                  key={related.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition hover:border-sky-400/30"
                >
                  <Link href={`/articles/${related.slug}`} className="block">
                    <ArticleCoverImage
                      src={related.cover_image_url}
                      title={related.title}
                      category={related.category}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="aspect-[16/10]"
                    />
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-sky-300">
                        {related.category}
                      </p>
                      <h3 className="mt-2 line-clamp-2 font-semibold leading-6 text-white">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                          {related.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
      <Footer />
    </main>
  );
}
