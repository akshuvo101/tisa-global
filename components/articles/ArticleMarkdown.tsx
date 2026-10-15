import ReactMarkdown from "react-markdown";
import {
  articleRehypePlugins,
  articleRemarkPlugins,
  getArticleTableOfContents,
} from "@/lib/articles/markdown";

export default function ArticleMarkdown({
  content,
  showTableOfContents = true,
}: {
  content: string;
  showTableOfContents?: boolean;
}) {
  const headings = showTableOfContents
    ? getArticleTableOfContents(content)
    : [];

  return (
    <>
      {headings.length >= 3 && (
        <nav
          aria-label="Table of contents"
          className="mb-9 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
            In this article
          </h2>
          <ol className="mt-4 grid gap-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={heading.depth > 2 ? "pl-4" : undefined}
              >
                <a
                  href={`#user-content-${heading.id}`}
                  className="text-sm leading-6 text-slate-400 transition hover:text-sky-300"
                >
                  {heading.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="article-prose break-words text-[16px] leading-8 text-slate-300 sm:text-[17px] sm:leading-9">
        <ReactMarkdown
          skipHtml
          remarkPlugins={articleRemarkPlugins}
          rehypePlugins={articleRehypePlugins}
          components={{
            h1: ({ children, ...props }) => (
              <h2 className="mb-5 mt-10 text-3xl font-semibold tracking-tight text-white sm:text-4xl" {...props}>
                {children}
              </h2>
            ),
            h2: ({ children, ...props }) => (
              <h2 className="mb-4 mt-10 scroll-mt-28 text-2xl font-semibold tracking-tight text-white sm:text-3xl" {...props}>
                {children}
              </h2>
            ),
            h3: ({ children, ...props }) => (
              <h3 className="mb-3 mt-8 scroll-mt-28 text-xl font-semibold tracking-tight text-white sm:text-2xl" {...props}>
                {children}
              </h3>
            ),
            h4: ({ children, ...props }) => (
              <h4 className="mb-3 mt-7 scroll-mt-28 text-lg font-semibold text-white" {...props}>
                {children}
              </h4>
            ),
            p: ({ children, ...props }) => (
              <p className="my-5 leading-8 sm:leading-9" {...props}>
                {children}
              </p>
            ),
            ul: ({ children, ...props }) => (
              <ul className="my-5 list-disc space-y-2 pl-6 marker:text-sky-400" {...props}>
                {children}
              </ul>
            ),
            ol: ({ children, ...props }) => (
              <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-sky-400" {...props}>
                {children}
              </ol>
            ),
            li: ({ children, ...props }) => (
              <li className="pl-1 leading-8" {...props}>
                {children}
              </li>
            ),
            a: ({ children, href, ...props }) => (
              <a
                href={href}
                className="font-medium text-sky-300 underline decoration-sky-300/30 underline-offset-4 transition hover:text-sky-200"
                {...props}
              >
                {children}
              </a>
            ),
            strong: ({ children, ...props }) => (
              <strong className="font-semibold text-white" {...props}>
                {children}
              </strong>
            ),
            em: ({ children, ...props }) => (
              <em className="text-slate-200" {...props}>
                {children}
              </em>
            ),
            blockquote: ({ children, ...props }) => (
              <blockquote className="my-7 border-l-2 border-sky-400/60 pl-5 text-slate-400 [&>p]:my-2" {...props}>
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-9 border-white/10" />,
            table: ({ children, ...props }) => (
              <div className="my-7 overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children, ...props }) => (
              <th className="border-b border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white" {...props}>
                {children}
              </th>
            ),
            td: ({ children, ...props }) => (
              <td className="border-b border-white/[0.06] px-4 py-3 text-slate-300" {...props}>
                {children}
              </td>
            ),
            code: ({ children, className, ...props }) => (
              <code
                className={`rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.88em] text-sky-200 ${className ?? ""}`}
                {...props}
              >
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}
