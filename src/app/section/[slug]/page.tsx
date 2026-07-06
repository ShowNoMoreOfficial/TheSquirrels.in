import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LeadStory } from "@/components/news/LeadStory";
import { SectionStories } from "@/components/news/SectionStories";
import { SECTIONS, getSectionByKey } from "@/lib/gather/sections";
import { getSection } from "@/lib/gather/queries";

export const revalidate = 300;

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ slug: s.key }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getSectionByKey(slug);
  if (!section) return { title: "Not Found" };
  return {
    title: section.label,
    description: `The latest ${section.label} coverage from The Squirrels.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = getSectionByKey(slug);
  if (!section) notFound();

  const { stories, hasMore } = await getSection(section, 1, 12);

  // We're already on the section page, so drop the redundant per-card kicker.
  const items = stories.map((s) => ({
    ...s,
    section: undefined,
    sectionKey: undefined,
  }));
  const [lead, ...rest] = items;

  return (
    <Container className="py-8">
      <header className="mb-8 border-b-2 border-ink pb-3">
        <h1 className="font-display text-3xl font-black text-ink sm:text-4xl">
          {section.label}
        </h1>
        <p className="label mt-2 text-[11px] text-ink-soft">
          The latest in {section.label}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="py-10 font-serif italic text-ink-faint">
          No {section.label} stories yet.
        </p>
      ) : (
        <>
          {/* Featured lead — newest article */}
          <div className="mb-10 border-b-2 border-rule pb-10">
            <LeadStory story={lead} />
          </div>

          {/* Remaining stories in an editorial grid, with Load More */}
          <SectionStories
            sectionKey={section.key}
            initial={rest}
            initialHasMore={hasMore}
          />
        </>
      )}
    </Container>
  );
}
