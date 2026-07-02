import { sanitizeArticle } from "@/lib/content/sanitize";

/**
 * Renders Gather's Tiptap HTML through a sanitizer, styled by `.prose-news`.
 * The duplicated leading byline is stripped in sanitizeArticle().
 */
export function ArticleBody({ html }: { html: string }) {
  const clean = sanitizeArticle(html);
  return (
    <div
      className="prose-news"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
