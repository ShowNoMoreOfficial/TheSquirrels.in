const API_URL = process.env.GATHER_API_URL || "https://vritti.shownomore.com";

/**
 * Resolve a Gather image reference to an absolute URL.
 * Cover images already come back absolute; inline content images may be
 * relative (`/api/files/<id>`). Returns null for empty/invalid input.
 */
export function gatherImageUrl(
  src: string | null | undefined
): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${API_URL}${src}`;
  return `${API_URL}/${src}`;
}
