# Ocean Ad Network — Integration Handoff

> Handoff notes for integrating Ocean Ad Network into **TheSquirrels** (custom Next.js site).
> Based on the integration completed for BreakingTube (WordPress) on 2026-09-01.

## 1. What this integration is
Ocean Ad Network (dashboard at `https://oceanadnetwork.com`, publisher signup at `/publisher/register`) is a publisher ad network. Integrating it into a site requires **two separate pieces on the page**, plus **account/dashboard setup** that the network side generates:

1. **A loader script** (`init.js`) — one `<script src=".../init.js">` in the page. This is the SDK bootstrap that's supposed to scan the page and render ads.
2. **A placement element** — an empty HTML element with **class `ocean-ad`**. The SDK finds elements matching a CSS selector and fills them with an ad. Without this element, the loader has nowhere to draw an ad.

Both pieces are required. The loader alone shows nothing; the placement div alone shows nothing.

## 2. The dashboard setup (must be redone per-site)
The person who onboards a site follows these steps in the Ocean dashboard (exact process we were given):
1. Sign in/up as publisher → `https://oceanadnetwork.com/publisher/register`
2. Go to **My Websites** in the nav bar
3. Click **Add Website**
4. Fill in details — **especially the exact domain** of the site
5. Open the website (via the arrow under Actions)
6. Add an **ad slot**
7. Set a **floor price**
8. Ad slot name must be **more than 5 characters**
9. Optionally set **targeting rules**
10. Once the slot is created, open its **CDN** link to get the `init.js` URL
11. (They also reference a walkthrough video and a sample `index.html`)
12–13. Take the ad-slot placement code from the sample and swap in your CDN link

**Critical:** every website needs its **own** website entry + ad slot in the dashboard, producing its **own** publisher ID, CDN URL, and SDK config. The SDK config is domain-locked (see §6), so **you cannot reuse BreakingTube's values for TheSquirrels** — generate fresh ones for the Squirrels domain.

## 3. BreakingTube values (reference example only — DO NOT reuse for Squirrels)
- **Publisher ID:** `47d8c4d3-0f9b-4037-bd70-bf8efcb637e8`
- **Website ID:** `b7d9cb0f-857e-4cf6-8f2c-cf61f748c8e8`
- **CDN / loader URL:** `https://devapioceanadtech.teamtarang.co.in/cdn/p/47d8c4d3-0f9b-4037-bd70-bf8efcb637e8/init.js`
- **Tier:** basic

**SDK Config** (from the dashboard's "SDK Config" button) — this is the shape you'll get for Squirrels:
```json
{
  "publisher": { "id": "47d8c4d3-0f9b-4037-bd70-bf8efcb637e8", "tier": "basic" },
  "website": { "id": "b7d9cb0f-857e-4cf6-8f2c-cf61f748c8e8", "domain": "https://breakingtube.com" },
  "inventory": [
    {
      "selector": ".ocean-ad",
      "inventoryId": "5d5b49b0-eb7d-479d-9466-b243f62aca94",
      "size": "728x110",
      "position": "IN_CONTENT",
      "selectorIndex": 1,
      "refresh": { "enabled": true, "interval": 60000 }
    }
  ],
  "settings": {
    "apiUrl": "https://prime-api.oceanadnetwork.com",
    "endpoints": {
      "bid": "https://prime-api.oceanadnetwork.com/rtb/bid-request",
      "track": "https://prime-api.oceanadnetwork.com/rtb/track",
      "sse": "https://prime-api.oceanadnetwork.com/rtb/stream"
    },
    "sseTimeout": 15000, "debug": false, "batchDelay": 50, "maxRetries": 1, "fallbackTimeout": 10000
  }
}
```
**How to read it:** the SDK scans for the CSS selector **`.ocean-ad`**, fills it with a **728×110** banner meant to sit **in-content**, and **refreshes every 60s**. `selectorIndex` says *which* matching `.ocean-ad` element on the page to use.

## 4. What we implemented on BreakingTube (WordPress — reference)
BreakingTube is WordPress (Newspaper/tagDiv theme, Hostinger). Two must-use plugins:
- `wp-content/mu-plugins/breakingtube-ad-cdn.php` → prints the loader `<script async src=".../init.js">` in `wp_head`.
- `wp-content/mu-plugins/breakingtube-ad-slot.php` → hooks `the_content` (priority 20, after `wpautop`) and inserts `<div class="ocean-ad" data-oa-size="728x110" style="max-width:728px;margin:16px auto;text-align:center;clear:both;"></div>` **after the first `</p>`** of single posts.

(There was also a cleanup: an old ad slot's `init.js` was duplicated because a previous slot's tag was stored in the theme's `td_analytics` DB option, compounded by a stubborn LiteSpeed object cache + MySQL query cache that kept restoring it. **This is WordPress/Hostinger-specific and does NOT apply to Next.js** — skip it for Squirrels.)

## 5. How to implement on TheSquirrels (custom Next.js)

### Step 0 — Dashboard (do first)
Register the Squirrels domain in Ocean, create an ad slot (name > 5 chars, set floor price), open its CDN link, and copy **its own** loader URL + SDK config. Note the slot's `selector`, `size`, `position`, and `selectorIndex`.

### Step 1 — Add the loader script
**App Router** (`app/layout.tsx`), using `next/script`:
```tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://devapioceanadtech.teamtarang.co.in/cdn/p/<SQUIRRELS_PUBLISHER_ID>/init.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
```
**Pages Router** (`pages/_app.tsx` or `_document.tsx`): same idea with `next/script` `strategy="afterInteractive"`.

### Step 2 — Add the placement element
Make a component and drop it into article content where the in-content banner should go. **Note: React uses `className`, not `class`, and inline styles are an object.**
```tsx
// components/OceanAd.tsx
export function OceanAd() {
  return (
    <div
      className="ocean-ad"
      data-oa-size="728x110"
      style={{ maxWidth: 728, margin: '16px auto', textAlign: 'center', clear: 'both' }}
    />
  )
}
```
Place `<OceanAd />` after the first paragraph of the article body (mirrors BreakingTube). The element must be in the **server-rendered / initial client DOM** so the SDK can find it on load.

### Step 3 — Verify (see §7).

## 6. Gotchas & lessons learned (read these — they'll save hours)
1. **The loader may be empty.** BreakingTube's `init.js` currently returns only `(function(o){})(document)` — a no-op that does nothing. **No ads render regardless of correct placement until the loader serves real SDK code.** This is a network-side issue. **Before debugging your own site, `curl` the loader URL and confirm it contains actual code, not an empty function.** If empty: click **"Regenerate All"** in the CDN dashboard; if still empty, tell the Ocean contact: *"init.js returns an empty function instead of the SDK; check the build for publisher `<ID>`."*
2. **The "devapi" host IS production.** The URL says `devapioceanadtech.teamtarang.co.in` which looks like a dev endpoint, but the dashboard's CDN Status page labels **Environment: Production**. Don't try to "fix" the host — it's correct as given.
3. **`selectorIndex` (0 vs 1).** Config had `selectorIndex: 1`. Unclear if 0-based or 1-based. If your single `.ocean-ad` div doesn't fill once the SDK works, either add a second `.ocean-ad` element or ask Ocean to set the index to 0. First thing to check when a placed div stays empty.
4. **Domain lock.** The SDK config embeds the site's domain. The SDK likely refuses to serve on a mismatched domain — hence each site needs its own dashboard entry. Register the Squirrels' real domain exactly.
5. **Next.js client-side navigation (important — WordPress didn't have this).** Ocean's SDK almost certainly scans for `.ocean-ad` once on initial load (`DOMContentLoaded`). With Next.js **client-side route transitions**, navigating to a new article won't reload the page, so newly-mounted `.ocean-ad` divs may **not** be picked up and stay empty. Mitigations to investigate once the SDK is live: check whether `init.js` exposes a re-scan/refresh API you can call in a `useEffect` on route change; otherwise the ad only reliably renders on hard loads. Flag to Ocean if there's no re-init hook.
6. **Caching on deploy.** No WordPress DB/object-cache issues apply, but if Squirrels is on Vercel/Cloudflare, a fresh deploy + CDN cache may require a hard-refresh/purge to see loader changes.

## 7. Verification commands
Confirm the loader actually contains code (the #1 check):
```bash
curl -s -e "https://thesquirrels.example/" \
  "https://devapioceanadtech.teamtarang.co.in/cdn/p/<SQUIRRELS_PUBLISHER_ID>/init.js" -w "\n[%{http_code}, %{size_download} bytes]\n"
# A working SDK is many KB. 25 bytes / "(function(o){})(document)" = NOT live yet.
```
Confirm the placement div renders on an article:
```bash
curl -s -A "Mozilla/5.0" "https://thesquirrels.example/some-article" | grep -c 'class="ocean-ad"'
# expect 1 (or however many you placed)
```

## 8. Status of the BreakingTube integration (as of 2026-09-01)
- BreakingTube: **both pieces installed and verified live** (loader in `<head>`, one `.ocean-ad` div after the first paragraph of posts).
- **Blocked on Ocean:** their `init.js` still returns the empty no-op, so no ads display yet. Waiting for them to publish a working SDK build. Everything on the publisher/site side is complete.
