/**
 * StoryItem — the view model consumed by all news components.
 * Phase 2 maps a Gather document into this shape (see lib/gather/queries.ts);
 * Phase 0 uses hard-coded placeholder items with the same shape.
 */
export interface StoryItem {
  /** Gather slug (UUID) — used for /article/<slug> */
  slug: string;
  title: string;
  /** Derived excerpt / summary line */
  dek?: string;
  /** Section display label, e.g. "Governance" */
  section?: string;
  /** Section key for /section/<key> linking */
  sectionKey?: string;
  /** "By NAME" */
  byline?: string;
  /** ISO date string (createdAt) */
  date?: string;
  coverImage?: string | null;
}
