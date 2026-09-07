import Script from "next/script";

/**
 * Google AdSense loader — site-wide.
 *
 * This is the publisher code AdSense asks you to add for site verification /
 * approval (and, once Auto Ads is enabled in the AdSense dashboard, for
 * serving). Publisher: ca-pub-3858793384050024.
 */
export function AdSense() {
  return (
    <Script
      id="google-adsense"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3858793384050024"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
