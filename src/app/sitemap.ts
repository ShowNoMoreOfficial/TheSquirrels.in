import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listDocuments } from "@/lib/gather/client";
import { SECTIONS } from "@/lib/gather/sections";

// Regenerate hourly (news cadence). Google re-crawls the sitemap on its own.
export const revalidate = 3600;

/** /sitemap.xml — home + section pages + every published article. Pages
 * through the Gather list API (capped for safety). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const staticEntries: MetadataRoute.Sitemap = [
		{ url: SITE_URL, changeFrequency: "hourly", priority: 1 },
		...SECTIONS.map((s) => ({
			url: `${SITE_URL}/section/${s.key}`,
			changeFrequency: "hourly" as const,
			priority: 0.8,
		})),
	];

	const articles: MetadataRoute.Sitemap = [];
	const limit = 100;
	for (let page = 1; page <= 40; page++) {
		let res;
		try {
			res = await listDocuments({ page, limit, sort: "updatedAt", order: "desc", format: "text" });
		} catch {
			break; // fail soft — return what we have rather than 500 the sitemap
		}
		for (const p of res.data) {
			articles.push({
				url: `${SITE_URL}/article/${p.slug}`,
				lastModified: p.updatedAt,
				changeFrequency: "weekly",
				priority: 0.7,
			});
		}
		if (res.data.length === 0 || page >= (res.pagination?.totalPages ?? 1)) break;
	}

	return [...staticEntries, ...articles];
}
