import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StoryList } from "@/components/news/StoryList";
import { searchStories } from "@/lib/gather/queries";

export const metadata: Metadata = {
  title: "Search",
  description: "Search The Squirrels archive.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const stories = query ? await searchStories(query, 1, 20) : [];

  return (
    <Container variant="measure" className="py-8">
      <h1 className="font-display text-3xl font-black text-ink">Search</h1>

      <form action="/search" method="get" className="mt-5">
        <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search Stories, People, Topics…"
            autoFocus
            className="w-full bg-transparent font-serif text-lg text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button type="submit" className="label text-[12px] text-ink hover:text-link">
            Go
          </button>
        </div>
      </form>

      <div className="mt-8">
        {query ? (
          <>
            <p className="label mb-6 text-[11px] text-ink-soft">
              {stories.length > 0
                ? `Results for “${query}”`
                : `No results for “${query}”`}
            </p>
            <StoryList stories={stories} emptyMessage="Try a different search." />
          </>
        ) : (
          <p className="font-serif italic text-ink-faint">
            Enter a Term to Search the Archive.
          </p>
        )}
      </div>
    </Container>
  );
}
