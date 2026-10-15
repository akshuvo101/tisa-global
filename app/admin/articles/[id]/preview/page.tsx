import ArticlePreview from "@/components/admin/ArticlePreview";

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticlePreview articleId={id} />;
}
