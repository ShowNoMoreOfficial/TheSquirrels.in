import Link from "next/link";
import type { StoryItem } from "./types";
import { StoryBlock } from "./StoryBlock";

export interface SectionGroup {
  label: string;
  key: string;
  stories: StoryItem[];
}

/** A titled column of stories, dividers between them — the newspaper "river". */
function SectionColumn({ group }: { group: SectionGroup }) {
  if (group.stories.length === 0) {
    return (
      <div>
        <SectionColumnHeading label={group.label} sectionKey={group.key} />
        <p className="mt-3 font-serif text-sm italic text-ink-faint">
          No stories yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <SectionColumnHeading label={group.label} sectionKey={group.key} />
      <div className="mt-4 space-y-5">
        {group.stories.map((story, i) => (
          <div key={story.slug}>
            {i > 0 && <hr className="mb-5 border-0 border-t border-hairline" />}
            <StoryBlock story={story} showImage={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionColumnHeading({
  label,
  sectionKey,
}: {
  label: string;
  sectionKey: string;
}) {
  return (
    <Link
      href={`/section/${sectionKey}`}
      className="group flex items-center gap-2 border-b-2 border-ink pb-1"
    >
      <h2 className="label text-[13px] text-ink group-hover:text-link">
        {label}
      </h2>
      <span className="label text-[13px] text-ink-faint group-hover:text-link">
        ›
      </span>
    </Link>
  );
}

/**
 * Multi-section grid. Columns are separated by vertical hairlines using a
 * "column-rule" style trick: each cell draws a left hairline, and the grid is
 * wrapped so the leftmost rule is clipped. Robust across 1/2/3-column layouts
 * because dividers are drawn on the grid container via background, not per-cell.
 */
export function SectionGrid({ groups }: { groups: SectionGroup[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <div
          key={group.key}
          className="md:border-hairline md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8"
        >
          <SectionColumn group={group} />
        </div>
      ))}
    </div>
  );
}
