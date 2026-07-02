import Link from "next/link";
import Image from "next/image";
import type { StoryItem } from "./types";
import { Kicker } from "./Kicker";
import { Byline } from "./Byline";

/** The front-page lead — oversized headline, hero image, prominent dek. */
export function LeadStory({ story }: { story: StoryItem }) {
  const href = `/article/${story.slug}`;

  return (
    <article className="group">
      {story.coverImage && (
        <Link href={href} className="mb-4 block overflow-hidden">
          <Image
            src={story.coverImage}
            alt=""
            width={1200}
            height={675}
            priority
            className="h-auto w-full object-cover"
          />
        </Link>
      )}

      {story.section && (
        <Kicker
          label={story.section}
          sectionKey={story.sectionKey}
          className="mb-2 block"
        />
      )}

      <h2 className="font-display font-black leading-[1.05] text-ink text-3xl sm:text-4xl md:text-lead">
        <Link href={href} className="transition-colors group-hover:text-link">
          {story.title}
        </Link>
      </h2>

      {story.dek && (
        <p className="mt-3 font-serif text-lg leading-relaxed text-ink-soft">
          {story.dek}
        </p>
      )}

      <Byline byline={story.byline} date={story.date} className="mt-3" />
    </article>
  );
}
