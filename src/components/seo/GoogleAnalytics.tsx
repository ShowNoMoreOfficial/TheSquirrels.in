import Script from "next/script";

/**
 * Injects the GA4 gtag.js tracking tag. Loaded `afterInteractive` so it never
 * blocks first paint / LCP. Renders nothing when no Measurement ID is set, so
 * the site is safe to run without analytics configured.
 */
export function GoogleAnalytics({ gaId }: { gaId: string | null | undefined }) {
	if (!gaId) return null;
	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
				strategy="afterInteractive"
			/>
			<Script id="ga-init" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', '${gaId}');
				`}
			</Script>
		</>
	);
}
