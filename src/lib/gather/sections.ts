/*
 * Section configuration for TheSquirrels.
 *
 * Each nav section rolls up one or more Gather tags. Editors are free to create
 * any tags in the CMS; this file is where those tags are *mapped* to the site's
 * sections. Many tags can map to one section (e.g. "Global Economy Trade" and
 * "Economy" both feed Economy) — the v1 API's comma-separated tag filter treats
 * the list as OR. To add a section, append an entry here; to route a new tag to
 * an existing section, add it to that section's `tags`.
 *
 * This list is the single source of truth for the site's navigation and order.
 */
export interface Section {
  /** URL segment: /section/<key> */
  key: string;
  /** Display label (nav + headings) */
  label: string;
  /**
   * Gather tags that belong to this section (case-insensitive). The first entry
   * is the canonical/primary tag; the rest are aliases that also roll up here.
   */
  tags: string[];
  /**
   * Fallback keyword search, used only if the section's tags return nothing
   * (e.g. a brand-new section not yet applied to any article).
   */
  keywords: string[];
}

export const SECTIONS: readonly Section[] = [
  {
    key: "governance",
    label: "Governance",
    tags: ["Governance", "Policy Governance"],
    keywords: ["governance", "parliament", "policy", "bureaucracy", "reform"],
  },
  {
    key: "policy",
    label: "Policy",
    tags: ["Policy", "Policy Governance", "US Immigration Visas"],
    keywords: ["policy", "regulation", "scheme", "ministry", "draft rules"],
  },
  {
    key: "corporate",
    label: "Corporate",
    tags: ["Corporate"],
    keywords: ["corporate", "company", "startup", "business", "merger"],
  },
  {
    key: "politics",
    label: "Politics",
    tags: ["Politics"],
    keywords: ["politics", "election", "party", "poll", "alliance"],
  },
  {
    key: "economy",
    label: "Economy",
    tags: ["Economy", "Global Economy Trade"],
    keywords: ["economy", "inflation", "rupee", "GDP", "RBI", "trade"],
  },
  {
    key: "news",
    label: "News",
    tags: ["News", "World News", "Health Public Safety"],
    keywords: ["India", "report", "court", "government"],
  },
] as const;

export function getSectionByKey(key: string): Section | undefined {
  return SECTIONS.find((s) => s.key === key.toLowerCase());
}
