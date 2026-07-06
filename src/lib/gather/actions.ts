"use server";

import { getSectionByKey } from "./sections";
import { getSection } from "./queries";
import type { StoryItem } from "@/components/news/types";

/** Grid page size for section "Load More" (keep in sync with the section page). */
const PAGE_SIZE = 12;

/**
 * Fetch one more page of a section's stories for the client-side "Load More".
 * Returns kicker-stripped items (we're already on the section page) plus a flag
 * for whether further pages likely exist.
 */
export async function loadSectionStories(
  key: string,
  page: number
): Promise<{ stories: StoryItem[]; hasMore: boolean }> {
  const section = getSectionByKey(key);
  if (!section) return { stories: [], hasMore: false };

  const { stories, hasMore } = await getSection(section, page, PAGE_SIZE);
  const clean = stories.map((s) => ({
    ...s,
    section: undefined,
    sectionKey: undefined,
  }));
  return { stories: clean, hasMore };
}
