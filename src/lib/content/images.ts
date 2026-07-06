const API_URL = process.env.GATHER_API_URL || "https://vritti.shownomore.com";

/**
 * Resolve a Gather image reference to an absolute URL.
 * Cover images already come back absolute; inline content images may be
 * relative (`/api/files/<id>`). Returns null for empty/invalid input.
 *
 * When `version` is supplied (typically a document's `updatedAt`), a cache-
 * busting `?v=` param is appended so a replaced image refreshes even though its
 * file URL is unchanged — otherwise Next's image optimizer and the browser
 * would keep serving the old bytes.
 */
export function gatherImageUrl(
  src: string | null | undefined,
  version?: string | null
): string | null {
  if (!src) return null;
  let url: string;
  if (src.startsWith("http://") || src.startsWith("https://")) url = src;
  else if (src.startsWith("/")) url = `${API_URL}${src}`;
  else url = `${API_URL}/${src}`;

  if (version) {
    const ms = Date.parse(version);
    const token = Number.isNaN(ms) ? encodeURIComponent(version) : String(ms);
    url += `${url.includes("?") ? "&" : "?"}v=${token}`;
  }
  return url;
}
