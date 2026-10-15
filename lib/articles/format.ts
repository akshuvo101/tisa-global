const articleDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatArticleDate(value: string | null | undefined) {
  if (!value) return null;

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T12:00:00.000Z` : value);

  if (Number.isNaN(date.getTime())) return null;
  return articleDateFormatter.format(date);
}

export function getUtcDateToday() {
  return new Date().toISOString().slice(0, 10);
}

export function isVerificationDateAllowed(
  value: string,
  today = getUtcDateToday(),
) {
  return isValidDateOnly(value) && value <= today;
}

export function isValidDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}
