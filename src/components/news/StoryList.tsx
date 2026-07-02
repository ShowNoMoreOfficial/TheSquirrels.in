import type { StoryItem } from "./types";
import { StoryBlock } from "./StoryBlock";

/** A vertical list of stories separated by hairlines — used by section & search pages. */
export function StoryList({
  stories,
  emptyMessage = "No stories found.",
}: {
  stories: StoryItem[];
  emptyMessage?: string;
}) {
  if (stories.length === 0) {
    return (
      <p className="py-10 font-serif italic text-ink-faint">{emptyMessage}</p>
    );
  }

  return (
    <div className="divide-y divide-hairline">
      {stories.map((story) => (
        <div key={story.slug} className="py-6 first:pt-0">
          <StoryBlock story={story} />
        </div>
      ))}
    </div>
  );
}
