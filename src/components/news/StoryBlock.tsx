import Link from "next/link";
import Image from "next/image";
import type { StoryItem } from "./types";
import { Kicker } from "./Kicker";
import { Byline } from "./Byline";

type StoryBlockProps = {
  story: StoryItem;
  /** "default" full block, "compact" for dense sidebar/list rows */
  size?: "default" | "compact";
  showImage?: boolean;
};

export function StoryBlock({
  story,
  size = "default",
  showImage = true,
}: StoryBlockProps) {
  const href = `/article/${story.slug}`;
  const compact = size === "compact";

  return (
    <article className="group">
      {showImage && story.coverImage && (
        <Link href={href} className="mb-3 block overflow-hidden">
          <Image
            src={story.coverImage}
            alt=""
            width={640}
            height={360}
            className="h-auto w-full object-cover"
          />
        </Link>
      )}

      {story.section && (
        <Kicker
          label={story.section}
          sectionKey={story.sectionKey}
          className="mb-1.5 block"
        />
      )}

      <h3
        className={`font-display font-bold text-ink leading-tight ${
          compact ? "text-lg" : "text-xl sm:text-2xl"
        }`}
      >
        <Link href={href} className="transition-colors group-hover:text-link">
          {story.title}
        </Link>
      </h3>

      {story.dek && !compact && (
        <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-soft">
          {story.dek}
        </p>
      )}

      {(story.byline || story.date) && (
        <Byline byline={story.byline} date={story.date} className="mt-2" />
      )}
    </article>
  );
}
