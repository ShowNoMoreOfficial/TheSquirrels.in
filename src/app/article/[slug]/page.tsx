import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArticleHeader } from "@/components/news/ArticleHeader";
import { ArticleBody } from "@/components/news/ArticleBody";
import { getArticle } from "@/lib/gather/queries";
import { excerpt } from "@/lib/content/excerpt";
import { byline } from "@/lib/content/byline";
import { gatherImageUrl } from "@/lib/content/images";
import { SECTIONS } from "@/lib/gather/sections";
import type { GatherPost } from "@/lib/gather/types";

/** The first article tag that matches one of our sections becomes its kicker. */
function primarySection(post: GatherPost) {
  const names = new Set((post.tags ?? []).map((t) => t.name.toLowerCase()));
  return SECTIONS.find((s) => s.tags.some((t) => names.has(t.toLowerCase())));
}

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) return { title: "Not Found" };

  const description = excerpt(post.content ?? "", 160);
  const cover = gatherImageUrl(post.coverImage, post.updatedAt);
  const tagNames = (post.tags ?? []).map((t) => t.name);

  return {
    title: post.title,
    description,
    keywords: tagNames.length ? tagNames : undefined,
    alternates: { canonical: `/article/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: `/article/${slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: post.title,
      description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();

  const section = primarySection(post);

  return (
    <Container variant="measure" className="py-8 sm:py-10">
      <Link
        href="/"
        className="label mb-6 inline-block text-[11px] text-ink-soft hover:text-link"
      >
        ‹ The Squirrels
      </Link>

      <article>
        <ArticleHeader
          title={post.title}
          section={section?.label}
          sectionKey={section?.key}
          byline={byline(post)}
          date={post.createdAt}
          coverImage={gatherImageUrl(post.coverImage, post.updatedAt)}
        />
        <ArticleBody html={post.content ?? ""} />
      </article>
    </Container>
  );
}
