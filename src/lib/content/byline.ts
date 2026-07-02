import type { GatherPost } from "@/lib/gather/types";

const DEFAULT_BYLINE = "The Squirrels";

/** "By Jane Doe" — falls back to the publication name. */
export function byline(post: Pick<GatherPost, "author">): string {
  const name = post.author?.name?.trim();
  return `By ${name && name.length > 0 ? name : DEFAULT_BYLINE}`;
}
