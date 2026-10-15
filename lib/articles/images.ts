export function isOptimizableArticleImage(value: string | null) {
  if (!value || !isSecureArticleImage(value)) return false;

  try {
    const url = new URL(value);
    return (
      url.hostname === "images.unsplash.com" ||
      url.hostname.endsWith(".supabase.co")
    );
  } catch {
    return false;
  }
}

export function isSecureArticleImage(value: string | null) {
  if (!value) return false;

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
