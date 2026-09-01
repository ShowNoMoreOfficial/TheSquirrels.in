import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

/**
 * NewsArticle structured data (schema.org JSON-LD) for an article page. Lets
 * Google show rich results / eligibility for Google News. Rendered server-side
 * into the page; safe because every value is JSON-serialized.
 */
export function ArticleJsonLd({
	slug,
	title,
	description,
	image,
	authorName,
	section,
	datePublished,
	dateModified,
}: {
	slug: string;
	title: string;
	description: string;
	image: string | null;
	authorName: string | null;
	section?: string;
	datePublished: string;
	dateModified: string;
}) {
	const json = {
		"@context": "https://schema.org",
		"@type": "NewsArticle",
		headline: title.slice(0, 110),
		description,
		...(image ? { image: [image] } : {}),
		datePublished,
		dateModified,
		...(section ? { articleSection: section } : {}),
		...(authorName ? { author: [{ "@type": "Person", name: authorName }] } : {}),
		publisher: {
			"@type": "Organization",
			name: SITE_NAME,
			logo: { "@type": "ImageObject", url: SITE_LOGO },
		},
		mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/article/${slug}` },
	};
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
		/>
	);
}
