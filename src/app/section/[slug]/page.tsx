import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { StoryList } from "@/components/news/StoryList";
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

  const { stories } = await getSection(section, 1, 18);

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

      <StoryList
        stories={stories}
        emptyMessage={`No ${section.label} stories yet.`}
      />
    </Container>
  );
}
