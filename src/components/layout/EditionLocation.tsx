"use client";

import { useEffect, useState } from "react";

/**
 * Shows the visitor's approximate location (city, country) in the masthead
 * folio — derived from their IP, so it needs NO browser geolocation permission.
 *
 * Runs client-side (the page itself is ISR-cached, so it can't read the request
 * IP per-visitor). Falls back to "International Edition" while loading or if the
 * lookup fails. Result is cached in sessionStorage to avoid repeat calls.
 *
 * Note: this sends the visitor's IP to the third-party geo service (geojs.io).
 */

const FALLBACK = "International Edition";
const CACHE_KEY = "ts_edition_location";

export function EditionLocation() {
  const [label, setLabel] = useState(FALLBACK);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        setLabel(cached);
        return;
      }
    } catch {
      // sessionStorage unavailable — just do the lookup
    }

    const controller = new AbortController();
    fetch("https://get.geojs.io/v1/ip/geo.json", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const city = (data.city ?? "").trim();
        const country = (data.country ?? "").trim();
        const text = city && country ? `${city}, ${country}` : country || null;
        if (!text) return;
        setLabel(text);
        try {
          sessionStorage.setItem(CACHE_KEY, text);
        } catch {
          // ignore write failures
        }
      })
      .catch(() => {
        // network/abort — keep the fallback
      });

    return () => controller.abort();
  }, []);

  return <span suppressHydrationWarning>{label}</span>;
}
