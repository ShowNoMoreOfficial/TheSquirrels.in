/**
 * Ocean Ad Network configuration.
 *
 * Ads only load when `NEXT_PUBLIC_OCEAN_LOADER_URL` is set (the slot's CDN
 * `init.js` URL from the Ocean dashboard). Until then, everything below is
 * inert — no script, no ad placeholders render — so the site is unaffected.
 *
 * `NEXT_PUBLIC_` vars are inlined at build time, so enabling ads means setting
 * the env var and redeploying.
 */

/** The slot's loader script URL (Ocean dashboard → slot → CDN link). */
export const OCEAN_LOADER_URL = process.env.NEXT_PUBLIC_OCEAN_LOADER_URL ?? "";

/** Whether Ocean ads are enabled (a loader URL is configured). */
export const OCEAN_ENABLED = OCEAN_LOADER_URL.length > 0;
