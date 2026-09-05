"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { OCEAN_ENABLED, OCEAN_LOADER_URL } from "@/lib/ads/ocean";

type OceanApi = {
  refreshAll?: () => void;
  refresh?: () => void;
  render?: () => void;
};

/**
 * Loads Ocean's SDK once, and re-fills ad slots on client-side route changes.
 *
 * The SDK (`window.OceanAds`) auto-initializes on load and runs a
 * MutationObserver, so it detects most dynamically-added `.ocean-ad` elements.
 * As a belt-and-suspenders for Next's client-side navigation, we call the SDK's
 * own `refreshAll()` on pathname changes — but NOT on the initial mount (the
 * SDK handles that itself, and calling it there would double-request).
 */
export function OceanLoader() {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (!OCEAN_ENABLED) return;
    if (firstRun.current) {
      firstRun.current = false; // initial fill is the SDK's own job
      return;
    }
    const api = (window as unknown as { OceanAds?: OceanApi }).OceanAds;
    const fn = api?.refreshAll ?? api?.refresh ?? api?.render;
    if (typeof fn === "function") {
      try {
        fn.call(api);
      } catch {
        // non-fatal
      }
    }
  }, [pathname]);

  if (!OCEAN_ENABLED) return null;

  return <Script src={OCEAN_LOADER_URL} strategy="afterInteractive" />;
}
