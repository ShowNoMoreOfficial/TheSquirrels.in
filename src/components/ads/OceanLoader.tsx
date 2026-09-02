"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { OCEAN_ENABLED, OCEAN_LOADER_URL } from "@/lib/ads/ocean";

/**
 * Loads Ocean's SDK once, and attempts a re-scan on client-side route changes.
 *
 * Ocean's SDK scans for `.ocean-ad` elements on initial load. Our site uses
 * client-side navigation, so newly-mounted ad slots on a new article won't be
 * picked up automatically — this effect best-effort calls a re-scan when the
 * pathname changes. The exact SDK API is TBD (per the Ocean handoff doc), so we
 * probe a few likely globals; if none exist, ads still render on hard loads.
 */
export function OceanLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (!OCEAN_ENABLED) return;
    // Probe for a re-scan/refresh hook the SDK may expose. Harmless if absent.
    type OceanApi = {
      scan?: () => void;
      refresh?: () => void;
      init?: () => void;
    };
    const w = window as unknown as Record<string, OceanApi | undefined>;
    const candidates: Array<OceanApi | undefined> = [w.ocean, w.OceanAds];
    for (const api of candidates) {
      if (!api) continue;
      const fn = api.scan ?? api.refresh ?? api.init;
      if (typeof fn === "function") {
        try {
          fn.call(api);
        } catch {
          // ignore — non-fatal
        }
        break;
      }
    }
  }, [pathname]);

  if (!OCEAN_ENABLED) return null;

  return <Script src={OCEAN_LOADER_URL} strategy="afterInteractive" />;
}
