/*
 * Section configuration for TheSquirrels.
 *
 * Each section maps to a top-level parent document in Gather CMS. The `label`
 * is matched (case-insensitively) against a top-level document title in the
 * Gather tree to resolve its slug — see resolveSectionParentSlug() in queries.ts.
 *
 * This list is the single source of truth for the site's navigation and order.
 */
export interface Section {
  /** URL segment: /section/<key> */
  key: string;
  /** Display label (also the future Gather section-tag name) */
  label: string;
  /**
   * Interim: keywords used to back the section via Gather search until proper
   * categorization ships (see plan: "Gather Categorization Fix"). The first
   * term is the primary query.
   */
  keywords: string[];
}

export const SECTIONS: readonly Section[] = [
  {
    key: "governance",
    label: "Governance",
    keywords: ["governance", "parliament", "policy", "bureaucracy", "reform"],
  },
  {
    key: "policy",
    label: "Policy",
    keywords: ["policy", "regulation", "scheme", "ministry", "draft rules"],
  },
  {
    key: "corporate",
    label: "Corporate",
    keywords: ["corporate", "company", "startup", "business", "merger"],
  },
  {
    key: "politics",
    label: "Politics",
    keywords: ["politics", "election", "party", "poll", "alliance"],
  },
  {
    key: "economy",
    label: "Economy",
    keywords: ["economy", "inflation", "rupee", "GDP", "RBI", "trade"],
  },
  {
    key: "news",
    label: "News",
    keywords: ["India", "report", "court", "government"],
  },
] as const;

export function getSectionByKey(key: string): Section | undefined {
  return SECTIONS.find((s) => s.key === key.toLowerCase());
}
