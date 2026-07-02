import "server-only";
import type { StoryItem } from "@/components/news/types";
import type { SectionGroup } from "@/components/news/SectionGrid";
import { listDocuments, getDocument, searchDocuments } from "./client";
import { SECTIONS, type Section } from "./sections";
import type { GatherPost } from "./types";
import { excerpt } from "@/lib/content/excerpt";
import { byline } from "@/lib/content/byline";
import { gatherImageUrl } from "@/lib/content/images";

/** Some Gather docs were published with a slug-like placeholder title. */
function cleanTitle(title: string, slug: string): string {
  const looksLikeSlug =
    title === slug || (/^[a-z0-9-]+$/.test(title) && title.includes("-"));
  if (!looksLikeSlug) return title;
  return title
    .replace(/-\d+$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function toStoryItem(post: GatherPost, section?: Section): StoryItem {
  return {
    slug: post.slug,
    title: cleanTitle(post.title, post.slug),
    dek: excerpt(post.content ?? ""),
    section: section?.label,
    sectionKey: section?.key,
    byline: byline(post),
    date: post.createdAt,
    coverImage: gatherImageUrl(post.coverImage),
  };
}

function dedupeBySlug(items: StoryItem[]): StoryItem[] {
  const seen = new Set<string>();
  return items.filter((s) => (seen.has(s.slug) ? false : seen.add(s.slug)));
}

/**
 * Homepage top region — pure recency (owner's choice), the newest articles.
 * `lead` is the most recent; `latest` fills the right rail.
 */
export async function getLeadAndLatest(): Promise<{
  lead: StoryItem | null;
  latest: StoryItem[];
}> {
  const { data } = await listDocuments({
    limit: 6,
    sort: "createdAt",
    order: "desc",
    format: "text",
  });
  const items = data.map((p) => toStoryItem(p));
  return { lead: items[0] ?? null, latest: items.slice(1, 5) };
}

/**
 * Section fetch via Gather's exact tag filter. Each section's label matches a
 * real Gather tag (Governance, Policy, Corporate, Politics, Economy, News).
 * Falls back to keyword search only if the tag returns nothing (e.g. a newly
 * added section not yet used on any article).
 */
async function getSectionStories(
  section: Section,
  limit: number,
  page = 1
): Promise<StoryItem[]> {
  const { data } = await listDocuments({
    tag: section.label,
    limit,
    page,
    sort: "createdAt",
    order: "desc",
    format: "text",
  });
  if (data.length > 0) {
    return dedupeBySlug(data.map((p) => toStoryItem(p, section)));
  }

  const res = await searchDocuments(section.keywords[0], {
    limit,
    page,
    format: "text",
  });
  return dedupeBySlug(res.data.map((p) => toStoryItem(p, section)));
}

/** Homepage section river — a few stories per section. */
export async function getHomepageSections(
  perSection = 3
): Promise<SectionGroup[]> {
  const groups = await Promise.all(
    SECTIONS.map(async (section) => {
      let stories: StoryItem[] = [];
      try {
        stories = await getSectionStories(section, perSection);
      } catch {
        stories = [];
      }
      return { label: section.label, key: section.key, stories };
    })
  );
  return groups;
}

/** Section listing page. */
export async function getSection(
  section: Section,
  page = 1,
  limit = 12
): Promise<{ stories: StoryItem[]; hasMore: boolean }> {
  const stories = await getSectionStories(section, limit, page);
  return { stories, hasMore: stories.length >= limit };
}

/** Full article for /article/[slug]. */
export async function getArticle(slug: string): Promise<GatherPost | null> {
  return getDocument(slug, "html");
}

/** Search results page. */
export async function searchStories(
  query: string,
  page = 1,
  limit = 15
): Promise<StoryItem[]> {
  if (!query.trim()) return [];
  const res = await searchDocuments(query, { page, limit, format: "text" });
  return dedupeBySlug(res.data.map((p) => toStoryItem(p)));
}
