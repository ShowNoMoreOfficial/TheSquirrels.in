/*
 * Derive a dek/excerpt from a Gather document. Gather has no excerpt field, and
 * its content often repeats the byline as the first line
 * (e.g. "By The Squirrels Bureau · June 30, 2026 The real story begins…").
 * We strip HTML, drop that leading byline line, then take the first ~N chars.
 */

const LEADING_BYLINE =
  /^\s*By\s+.+?[·|]\s*[A-Za-z]+\s+\d{1,2},?\s+\d{4}\s*/;

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove a leading "By NAME · Month DD, YYYY" prefix if present. */
export function stripLeadingByline(text: string): string {
  return text.replace(LEADING_BYLINE, "").trim();
}

export function excerpt(content: string, maxLength = 180): string {
  const text = stripLeadingByline(stripHtml(content));
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}
