import { Container } from "@/components/ui/Container";
import { LeadStory } from "@/components/news/LeadStory";
import { StoryBlock } from "@/components/news/StoryBlock";
import { SectionGrid } from "@/components/news/SectionGrid";
import { getLeadAndLatest, getHomepageSections } from "@/lib/gather/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [{ lead, latest }, groups] = await Promise.all([
    getLeadAndLatest(),
    getHomepageSections(3),
  ]);

  return (
    <Container className="py-8">
      {/* Top region: lead + right rail, split by a vertical hairline */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 lg:pr-8">
          {lead ? (
            <LeadStory story={lead} />
          ) : (
            <p className="font-serif italic text-ink-faint">
              Stories are loading. Please check back shortly.
            </p>
          )}
        </div>

        <aside className="lg:col-span-4 lg:border-l lg:border-hairline lg:pl-8">
          <h2 className="label mb-4 border-b-2 border-ink pb-1 text-[13px] text-ink">
            The Latest
          </h2>
          <div className="space-y-5">
            {latest.map((story, i) => (
              <div key={story.slug}>
                {i > 0 && (
                  <hr className="mb-5 border-0 border-t border-hairline" />
                )}
                <StoryBlock story={story} size="compact" showImage={false} />
              </div>
            ))}
          </div>
        </aside>
      </section>

      <hr className="my-10 border-0 border-t-2 border-rule" />

      {/* Section river (keyword-backed until Gather categorization ships) */}
      <SectionGrid groups={groups} />
    </Container>
  );
}
