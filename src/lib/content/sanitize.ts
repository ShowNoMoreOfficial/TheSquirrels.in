import sanitizeHtml from "sanitize-html";
import { gatherImageUrl } from "./images";

/**
 * Remove the leading byline paragraph Gather bakes into content
 * (e.g. "<p>By The Squirrels Bureau · June 30, 2026</p>") so the page's own
 * <Byline> is the single source of truth.
 */
const LEADING_BYLINE_P =
  /^\s*<p[^>]*>\s*By\s+.+?[·|]\s*[A-Za-z]+\s+\d{1,2},?\s+\d{4}\s*<\/p>/i;

const CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "h4",
    "strong", "em", "u", "s", "sub", "sup", "a",
    "ul", "ol", "li", "blockquote", "pre", "code",
    "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    // Tiptap callouts/columns/toggles carry semantic class names
    div: ["class"],
    span: ["class"],
    p: ["class"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    img: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        src: gatherImageUrl(attribs.src) || "",
      },
    }),
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.target === "_blank") out.rel = "noopener noreferrer";
      return { tagName, attribs: out };
    },
  },
};

/** Sanitize Gather HTML for safe rendering, dropping the duplicated byline. */
export function sanitizeArticle(html: string): string {
  const withoutByline = html.replace(LEADING_BYLINE_P, "");
  return sanitizeHtml(withoutByline, CONFIG);
}
