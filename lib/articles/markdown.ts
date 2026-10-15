import GithubSlugger from "github-slugger";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import remarkParse from "remark-parse";

type MarkdownNode = {
  type: string;
  value?: string;
  depth?: number;
  children?: MarkdownNode[];
};

export type ArticleHeading = {
  id: string;
  depth: number;
  title: string;
};

export const articleRemarkPlugins = [remarkGfm];
export const articleRehypePlugins = [rehypeSlug, rehypeSanitize];

function textContent(node: MarkdownNode): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? "";
  }
  return (node.children ?? []).map(textContent).join("");
}

export function getArticleTableOfContents(markdown: string): ArticleHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: ArticleHeading[] = [];

  function visit(node: MarkdownNode) {
    if (
      node.type === "heading" &&
      node.depth !== undefined &&
      node.depth >= 2 &&
      node.children
    ) {
      const title = textContent(node).trim();
      if (title) headings.push({ id: slugger.slug(title), depth: node.depth, title });
    }
    node.children?.forEach(visit);
  }

  visit(tree);
  return headings;
}
