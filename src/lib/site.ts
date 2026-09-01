/**
 * Single source of truth for site identity used by SEO surfaces (metadata,
 * robots, sitemap, JSON-LD). Env-overridable so the same codebase can serve
 * another domain later without code changes; defaults to thesquirrels.in.
 */
export const SITE_URL = (
	process.env.NEXT_PUBLIC_SITE_URL || "https://thesquirrels.in"
).replace(/\/$/, "");

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "The Squirrels";

/** Absolute URL to the publisher logo (used in NewsArticle JSON-LD). */
export const SITE_LOGO = `${SITE_URL}/brand/the-squirrels-copper.png`;
