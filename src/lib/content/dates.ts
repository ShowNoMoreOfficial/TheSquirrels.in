/*
 * Date helpers. Gather exposes only `createdAt`/`updatedAt` (ISO strings);
 * we treat `createdAt` as the publish date.
 */

const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const BYLINE_DATE: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

/** "Friday, July 3, 2026" — for the masthead. Accepts an optional fixed date. */
export function formatMasthead(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", LONG_DATE).format(date);
}

/** "July 3, 2026" — for bylines/timestamps. */
export function formatByline(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", BYLINE_DATE).format(d);
}
