import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArticleHeader } from "@/components/news/ArticleHeader";
import { ArticleBody } from "@/components/news/ArticleBody";
import { getArticle } from "@/lib/gather/queries";
import { excerpt } from "@/lib/content/excerpt";
import { byline } from "@/lib/content/byline";
import { gatherImageUrl } from "@/lib/content/images";
import { SECTIONS } from "@/lib/gather/sections";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
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

  // Per-document SEO overrides from the CMS take precedence; blank → auto.
  const seo = post.seo;
  const metaTitle = seo?.title?.trim() || post.title;
  const description = seo?.description?.trim() || excerpt(post.content ?? "", 160);
  const cover =
    (seo?.ogImage?.trim()
      ? gatherImageUrl(seo.ogImage, post.updatedAt)
      : gatherImageUrl(post.coverImage, post.updatedAt)) || null;
  const keywords = seo?.keywords?.trim()
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : (post.tags ?? []).map((t) => t.name);
  const canonical = seo?.canonicalUrl?.trim() || `/article/${post.slug}`;

  return {
    title: metaTitle,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical },
    ...(seo?.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: metaTitle,
      description,
      type: "article",
      url: `/article/${post.slug}`,
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: metaTitle,
      description,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getArticle(slug);
  if (!post) notFound();

  // If the URL used an old slug, Gather resolved it to the current doc — send
  // the reader (and search engines) on to the canonical URL with a 301.
  if (post.slug !== slug) {
    permanentRedirect(`/article/${post.slug}`);
  }

  const section = primarySection(post);

  return (
    <Container variant="measure" className="py-8 sm:py-10">
      <ArticleJsonLd
        slug={post.slug}
        title={post.seo?.title?.trim() || post.title}
        description={post.seo?.description?.trim() || excerpt(post.content ?? "", 160)}
        image={gatherImageUrl(post.seo?.ogImage?.trim() || post.coverImage, post.updatedAt)}
        authorName={post.author?.name ?? null}
        section={section?.label}
        datePublished={post.createdAt}
        dateModified={post.updatedAt}
      />
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
