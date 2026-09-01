import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** /robots.txt — allow crawling everything except the API, and point crawlers
 * at the sitemap so they discover all articles. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
