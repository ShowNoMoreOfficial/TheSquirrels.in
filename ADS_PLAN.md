# TheSquirrels — Ad Provisions Plan (CDN-delivered)

## Context
The site (thesquirrels.in, this Next 16 app) currently has **no ad code and no ad CDN**. We want to monetise with ads whose **manifest and creatives are both delivered via a CDN** — i.e. a self-serve / direct-sold model where nothing about a campaign requires a code deploy. The site exposes stable **ad slots**; a CDN-hosted **manifest** decides which creative fills each slot; creatives are CDN assets. The abstraction must also let us drop in programmatic (Google Ad Manager / AdSense / Prebid) later per-slot without touching layouts.

Guardrails that matter for this fast editorial site: **zero CLS** (always reserve space), never block LCP, lazy-load below-the-fold, cookieless-first tracking, and every unit clearly labelled "ADVERTISEMENT".

Related pending items (owner, CMS side — separate track): Google Analytics, SEO provisions. Ads touch these (ads.txt, Core Web Vitals, consent), so we coordinate but don't block on them.

## Architecture (5 layers)
1. **Slot inventory** — named, stable slot IDs baked into the layout, each with allowed responsive sizes.
2. **Ad manifest (`ads.json` on the CDN)** — maps slot → creative(s) with targeting (section, device, geo), weighted rotation, flight dates, click-through URL, and a house-ad fallback. Hard-cached, purged on change.
3. **Creatives on CDN** — image (and later HTML) assets + a house-ad set (subscribe/newsletter) that fills any unsold slot.
4. **`<AdSlot>` component** — reserves space, lazy-loads, picks a creative by targeting/rotation/schedule, renders it, fires impression/click beacons.
5. **First-party tracking** — impression + click endpoints (direct-sold = we count ourselves; no programmatic pixels yet).

```
CDN (ads.thesquirrels.in)          Next app
  ├─ ads.json  (manifest) ───▶  AdManifestProvider (fetch, edge/ISR cached)
  └─ creatives/*.jpg|html ───▶  <AdSlot id="…"> → reserve → lazy → render → beacon
```

## Slot inventory (NYT-International layout)
IAB standard sizes; component picks by breakpoint.

| Slot ID | Where | Desktop | Mobile |
|---|---|---|---|
| `home-billboard` | Home, below section nav (above the fold, but **below** the lead hero) | 970×250 / 728×90 | 320×100 / 300×250 |
| `home-river-1/2` | Home, between section bands | 300×250 | 300×250 |
| `section-leaderboard` | Section page top | 728×90 | 320×50 |
| `section-grid-1` | Section page, after featured lead | 300×250 | 300×250 |
| `article-top` | Article, under header | 728×90 | 320×50 |
| `article-inline-N` | Article, injected between paragraphs (via `enrichHtml()`) | 300×250 (centered) | 300×250 |
| `article-end` | Article, after body / before "read next" | 300×250 | 300×250 |
| `article-rail` | Article, sticky right rail (wide screens only) | 300×600 | — |
| `anchor-mobile` | Global sticky bottom (dismissible, frequency-capped) | — | 320×50 |

Rules: never place a paid slot **above** the LCP lead image; cap total slots/page; sticky anchor is dismissible and capped (e.g. 1/session).

## Manifest shape (contract — front-end never changes)
```json
{
  "version": 12,
  "slots": {
    "home-billboard": {
      "creatives": [{
        "id": "acme-aug", "type": "image", "weight": 3,
        "assets": {
          "desktop": {"src": "https://ads.thesquirrels.in/creatives/acme-970x250.jpg", "w": 970, "h": 250},
          "mobile":  {"src": "https://ads.thesquirrels.in/creatives/acme-320x100.jpg", "w": 320, "h": 100}
        },
        "href": "https://advertiser.example/landing",
        "alt": "Acme — ...",
        "start": "2026-08-01", "end": "2026-08-31",
        "targeting": {"sections": ["*"], "geo": ["IN"], "device": ["desktop","mobile"]}
      }],
      "house": [{"id": "subscribe", "type": "image", "assets": {"...": "..."}, "href": "/subscribe"}]
    }
  }
}
```
- **Rotation:** weighted random client-side. **Schedule:** filter by start/end. **Targeting:** section (from page), device (breakpoint), geo (reuse the IP lookup already in `EditionLocation`). **Fallback:** `house` when no active paid creative → slot is never empty/blank.

## `<AdSlot>` component (Next 16)
- **Server wrapper**: fixed reserved box per breakpoint (aspect-ratio/height) + small "ADVERTISEMENT" label → **CLS 0** even before the creative loads.
- **Client leaf (`"use client"`)**: `IntersectionObserver` (load ~200px before viewport) → read manifest from a top-level `AdManifestProvider` (fetched once) → select creative → render `<a href target="_blank" rel="sponsored nofollow noopener"><img loading="lazy" decoding="async" width height></a>`.
- **HTML/rich creatives** (Phase 1+): render inside a **sandboxed `<iframe sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox">`** sized to the slot — never inject advertiser HTML into our DOM.
- Use a **plain `<img>`, not `next/image`** for creatives (fixed sizes, don't run ad art through our optimizer; avoids cache/remotePattern coupling).

## CDN
- Recommend a dedicated bucket + CDN: **Cloudflare R2 + Cloudflare CDN** (no egress fees, instant cache purge) or **Bunny CDN** (very cheap, simple) — served from `ads.thesquirrels.in`. Manifest at `/ads.json`, creatives under `/creatives/`.
- Alternative to start cheap: reuse Gather's file storage/host, but keep ad assets on a **separate path/subdomain** so ad ops never touch the CMS store. A dedicated CDN is cleaner and matches the "delivered via CDN" goal.
- App changes: `preconnect`/`dns-prefetch` to the ad CDN; add it to CSP `img-src`/`connect-src`/`frame-src` once CSP exists.

## Manifest delivery & cache busting
- Site fetches `ads.json` with `next: { revalidate: 300, tags: ['ads'] }` (or edge fetch). On campaign change: upload new `ads.json` → **purge the CDN object** → optionally hit the existing `/api/revalidate` to drop the `ads` tag. Tiny file, fully CDN-cacheable.

## Tracking (first-party, cookieless-first)
- **Impression**: `navigator.sendBeacon('/api/ad-event', {slot, creative, t:'imp'})` when the slot is ≥50% visible for ≥1s (viewability). Deduped per pageview.
- **Click**: route through a redirect for reliable counts — `/api/ad-click?c=<creative>&to=<encoded-url>` → 302 → advertiser. (Or a beacon on click.) Keep `rel="sponsored nofollow"`.
- Aggregate later for advertiser impression/click/CTR reporting. No cookies needed → minimal consent burden. Can also mirror events into GA once GA is wired.

## Governance / compliance
- **"ADVERTISEMENT"** label on every unit (small-caps, newspaper-standard).
- **`public/ads.txt`** (+ `app-ads.txt`) — placeholder now; required when programmatic is added (declares authorized sellers).
- **Consent (India DPDP Act)**: pure non-personalized first-party image ads + server-side beacons need little; add a lightweight CMP **only** when we introduce programmatic or cookie-based targeting. Design keeps us cookieless until then.
- **Safety**: direct-sold means we vet creatives; HTML creatives are sandboxed.

## Phasing
- **Phase 0 — Foundation (ship house ads):** slot inventory + `<AdSlot>` + `AdManifestProvider` + `ads.json` schema + CDN bucket + preconnect. Every slot shows a **house ad** (subscribe/newsletter). Validates layout, spacing, CLS, and performance with **zero revenue risk**.
- **Phase 1 — Direct-sold:** weighted rotation, scheduling, section/device/geo targeting, impression + click tracking, click-redirect endpoint, `enrichHtml()` inline-slot injection, and an **ad-ops runbook** for updating the manifest + purging cache.
- **Phase 2 — Management & reporting:** small admin UI (or a Gather "Ads" space) that writes `ads.json` to the CDN and purges it; basic advertiser report (impressions/clicks/CTR).
- **Phase 3 — Optional programmatic:** plug GPT/AdSense/Prebid into chosen slots behind the same `<AdSlot>` (lazy GPT, async), add `ads.txt` sellers + a CMP. No layout changes.

## Files this will add/touch (when we build)
- New: `src/components/ads/AdSlot.tsx`, `src/components/ads/AdManifestProvider.tsx`, `src/lib/ads/manifest.ts` (fetch+select+rotate+target), `src/app/api/ad-event/route.ts`, `src/app/api/ad-click/route.ts`, `public/ads.txt`.
- Touch: `layout.tsx` (provider + preconnect + `anchor-mobile`), `page.tsx` (`home-billboard`, `home-river-*`), `section/[slug]/page.tsx` (`section-*`), `article/[slug]/page.tsx` + `enrichHtml()` (`article-*`), `next.config.ts`/CSP (ad CDN host).
- Reuse: the IP lookup pattern in `EditionLocation.tsx` for geo targeting; the `enrichHtml()` server pass (from BRANDING_PLAN) for inline-slot markers; `/api/revalidate` for manifest cache busting.

## Open decisions for the owner
1. **CDN choice** — Cloudflare R2+CDN vs Bunny vs reuse Gather host on a separate subdomain.
2. **Ad domain** — `ads.thesquirrels.in`?
3. **Sales model** — house-only to start, direct-sold, or straight to programmatic (AdSense) for quickest revenue? (Programmatic is faster money but heavier on privacy/consent + can hurt the premium feel; direct-sold keeps control and speed.)
4. **Who manages campaigns** — dev-edited manifest initially, or build the admin UI in Phase 2?
