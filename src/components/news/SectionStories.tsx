"use client";

import { useState } from "react";
import type { StoryItem } from "./types";
import { StoryBlock } from "./StoryBlock";
import { loadSectionStories } from "@/lib/gather/actions";

/**
 * The section's story grid with a "Load More" control. Initial items are
 * server-rendered; subsequent pages are fetched via a server action and
 * appended (de-duped by slug).
 */
export function SectionStories({
  sectionKey,
  initial,
  initialHasMore,
}: {
  sectionKey: string;
  initial: StoryItem[];
  initialHasMore: boolean;
}) {
  const [stories, setStories] = useState<StoryItem[]>(initial);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    try {
      const next = page + 1;
      const { stories: more, hasMore: nextHasMore } = await loadSectionStories(
        sectionKey,
        next
      );
      setStories((prev) => {
        const seen = new Set(prev.map((s) => s.slug));
        return [...prev, ...more.filter((s) => !seen.has(s.slug))];
      });
      setPage(next);
      setHasMore(nextHasMore);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <div key={story.slug} className="border-t border-hairline pt-5">
            <StoryBlock story={story} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="label text-[12px] tracking-[0.12em] text-ink-soft transition-colors hover:text-link disabled:opacity-40"
          >
            {loading ? "Loading…" : "Load More ›››"}
          </button>
        </div>
      )}
    </>
  );
}
