import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import {
  formatArticleDate,
  isVerificationDateAllowed,
} from "../lib/articles/format";
import {
  articleRehypePlugins,
  articleRemarkPlugins,
  getArticleTableOfContents,
} from "../lib/articles/markdown";

test("verification dates reject invalid and future dates", () => {
  assert.equal(isVerificationDateAllowed("2024-02-29", "2024-03-01"), true);
  assert.equal(isVerificationDateAllowed("2025-02-29", "2025-03-01"), false);
  assert.equal(isVerificationDateAllowed("2026-10-14", "2026-10-13"), false);
  assert.equal(isVerificationDateAllowed("2026-10-13", "2026-10-13"), true);
});

test("article dates format consistently in UTC", () => {
  assert.equal(formatArticleDate("2026-10-13"), "13 October 2026");
  assert.equal(
    formatArticleDate("2026-10-13T23:30:00-05:00"),
    "14 October 2026",
  );
});

test("article Markdown supports common formatting and strips unsafe markup", () => {
  const markdown = [
    "## Travel *planning*",
    "",
    "- visas",
    "- flights",
    "",
    "**trusted** [guidance](https://example.com)",
    "",
    "<script>alert(1)</script>",
    "",
    "[unsafe](javascript:alert%281%29)",
  ].join("\n");
  const html = renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      {
        skipHtml: true,
        remarkPlugins: articleRemarkPlugins,
        rehypePlugins: articleRehypePlugins,
      },
      markdown,
    ),
  );

  assert.match(html, /<h2 id="user-content-travel-planning">/);
  assert.match(html, /<ul>/);
  assert.match(html, /<em>planning<\/em>/);
  assert.match(html, /<strong>trusted<\/strong>/);
  assert.match(html, /href="https:\/\/example\.com"/);
  assert.doesNotMatch(html, /<script|javascript:/i);
});

test("article table of contents creates stable IDs for repeated headings", () => {
  const headings = getArticleTableOfContents(
    "## Getting there\n\n### Visas\n\n## Getting there",
  );

  assert.deepEqual(headings, [
    { id: "getting-there", depth: 2, title: "Getting there" },
    { id: "visas", depth: 3, title: "Visas" },
    { id: "getting-there-1", depth: 2, title: "Getting there" },
  ]);
});
