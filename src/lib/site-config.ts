import "server-only";
import { SITE_URL } from "./site";

/**
 * Per-site config resolved from the Gather CMS by domain (the public,
 * non-secret site-config endpoint). Holds the GA Measurement ID and SEO
 * defaults so they're CMS-managed — change them in the CMS, the site picks
 * them up on the next ISR window (no redeploy). Fetched by the site's own
 * domain today; when one deployment serves many domains this switches to the
 * request host.
 */

const API_URL = process.env.GATHER_API_URL || "https://vritti.shownomore.com";

export type SiteConfig = {
	domain: string;
	basePath: string;
	siteName: string | null;
	gaMeasurementId: string | null;
	seo: {
		title: string | null;
		description: string | null;
		logoUrl: string | null;
		ogImageUrl: string | null;
		twitterHandle: string | null;
	};
};

export async function getSiteConfig(): Promise<SiteConfig | null> {
	let domain: string;
	try {
		domain = new URL(SITE_URL).host;
	} catch {
		return null;
	}
	try {
		const res = await fetch(
			`${API_URL}/api/public/site-config?domain=${encodeURIComponent(domain)}`,
			{ next: { revalidate: 300, tags: ["site-config"] } }
		);
		if (!res.ok) return null;
		return (await res.json()) as SiteConfig;
	} catch {
		return null;
	}
}
