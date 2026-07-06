# The Squirrels — Branding & Premium UI Plan

Goal: take the site from "correct NYT-International clone" to a **branded, polished, memorable** newspaper with a genuine wow factor — without breaking the fast, ISR/RSC, monochrome-serif foundation already in place.

Grounded in the current codebase: Next 16.2 + React 19 + Tailwind v4 (CSS-first `@theme` in `globals.css`), Playfair/Lora/Libre Franklin, hairline rules, ISR. Today the site has **zero motion, no brand mark, no accent color, no dark mode, no interaction layer**. That is exactly the opportunity.

Guiding principle from the research: **restraint is the premium signal.** Everything CSS-native and site-wide-automatic first; JS islands only where CSS can't reach. Animate headlines/chrome, never body copy. `prefers-reduced-motion` + CLS discipline are non-negotiable.

---

## 1. Brand identity (the foundation — decide these first)

These are decisions for Bhupendra/you to sign off; everything visual hangs off them.

- **Wordmark:** two-line stacked **THE SQUIRRELS** in Playfair Display, monochrome, no box/banner (the Guardian-2018 model — a small name gains presence stacked, locks into a narrow mobile masthead). Keep "The" — the definite article signals institution.
- **Squirrel motif — YES, but as a discreet engraved colophon/seal, never a cartoon mascot or the primary logo.** One execution style, committed: **fine-line engraving / woodcut** (seated, alert side-profile). Reads "old print house," scales, ages well. Deploy sparingly: favicon, app icon, footer, section fronts, and an **end-of-article dinkus** (engraved squirrel/acorn glyph instead of "•••").
- **Accent color — own exactly ONE, with FT/Economist-level discipline:** a warm **chestnut/russet brown** (squirrel-derived but not literal; differentiates from the sea of Indian-news reds/blues). Used ONLY on: links, kickers/section flags, the colophon, pull-quote marks, LIVE/breaking badges, subscribe CTAs, optional drop cap. Everything else stays black/white. Harder-edged fallback if russet feels soft for political reporting: **deep oxblood**.
  - This replaces the current generic `--color-link: #0066cc` (NYT blue) — swapping to the brand accent is the single highest-signal one-line change.
- **Section identity:** NYT-style typographic **constant** (Libre Franklin small-caps flag above every headline) + one **muted tonal tint per section** used only in the thin kicker rule / section-front nameplate. Six sections stay feeling like one newspaper, not six. Wire off the real Gather tags (News/Politics/Economy/Governance/Corporate/Policy) via a `--section-accent` CSS var on the section wrapper.
- **Tagline candidates:** "We gather. You know." / "The stories worth storing." / "Gathering the news that lasts." (Avoid nuts/acorn/scurry puns — that's where it turns childish.)
- **Illustration house style:** single **engraving/stipple/woodcut** lane for everything — colophon, section icons, and (strong ownable asset for a bylined, personality-led site) **hedcut-style author portraits**.
- **Favicon/OG/app-icon system:** the squirrel silhouette in white on a solid russet tile (the long wordmark can't shrink — the *mark* carries small sizes; keep a simplified ≤32px silhouette variant). OG template: two-line wordmark + colophon + russet section kicker + Playfair headline on warm off-white.

---

## 2. Premium UI / motion layer (mapped to phases)

Effort ratings are for this exact stack. "Auto" = applies site-wide from CMS data, no per-article authoring.

### Phase A — Typographic foundation & guardrails (Low effort, biggest ROI, all CSS)
This is ~80% of the "expensive newspaper" feel and touches only `globals.css`.
- **`prefers-reduced-motion` global reset + CLS discipline** — build this FIRST as the floor for everything after. (Auto)
- **Oldstyle proportional numerals + ligatures + kerning** on body serif (`font-feature-settings:"onum","liga","kern"`); lining/tabular numerals for data. Oldstyle figures in serif body are the single most recognizable NYT/Guardian tell. (Auto)
- **`text-wrap: balance`** on headlines/kickers, **`text-wrap: pretty`** on body — kills the amateur one-word-last-line and orphans. (Auto; Firefox lacks `pretty`, degrades cleanly)
- **Fluid modular type scale with `clamp()`** as `@theme` tokens — confident oversized headlines on wide screens, smooth to mobile. (Auto)
- **Drop cap + first-paragraph treatment** on articles. (Auto)
- **Optimal measure** already ~640–700px; confirm ~66ch.

### Phase B — The server-side `enrichHtml()` pass (Med effort, huge leverage)
One transform in the render pipeline (extend `src/lib/content/sanitize.ts`) that parses sanitized CMS HTML once (RSC, zero client JS) and injects, automatically across all 1,367 articles:
- **Auto-extracted pull quotes** (prefer authored `<blockquote>`; else lift an 8–24 word mid-article sentence as an `aria-hidden` aside).
- **`<figure>`/`<figcaption>` wrapping** + consistent aspect ratios, lazy-load, blur-up (ragged CMS images are the biggest "cheap blog" tell). Extend `src/lib/content/images.ts`.
- **Heading anchors/slugs** + optional in-article TOC for long policy pieces.
- **Insertion points** for inline newsletter/read-next modules at ~50% scroll.

### Phase C — News credibility & engagement (Low–Med, automatable from tags/dates)
- **Estimated read time** ("6 min read") on cards + article header — computed server-side (word count / 220). Documented engagement lift. (Auto)
- **Reading progress bar** — native `animation-timeline: scroll()` (zero JS) with a tiny Motion fallback only on article route. (Auto)
- **`NewsArticle` JSON-LD** + visible **"Updated 2h ago"** stamp when `dateModified > datePublished` — Top Stories eligibility + freshness credibility. Relative time must be hydration-safe (render absolute SSR, adjust on client). (Auto)
- **"Read next / More in {Section}" rail** — content-based match by shared Gather tag, newest-first, in `src/lib/gather/queries.ts`. The primary lever for pages-per-session. (Auto)
- **Homepage "The Latest" live column** (recency feed + relative timestamps) and **LIVE/breaking badge** (pure-CSS pulse, `transform`/`opacity` only, reduced-motion-safe). ("Most read" needs a view counter — the one item needing new infra; defer.)

### Phase D — Interaction & continuity wow (Low–Med, tasteful)
- **Editorial hover micro-interactions**: underline-wipe-from-left (animated `background-size`, not `text-decoration`), image zoom-in-frame (`scale(1.03)` inside `overflow:hidden`), headline→accent shift. Pure CSS, `:focus-visible` parity. (Auto)
- **Reveal-on-scroll**, native `animation-timeline: view()` — content gently arrives on cards/section blocks; `@supports`-gated, defaults to visible, small `translateY(≤12px)`, never body copy, staggered via `--i` delay. (Auto, zero JS)
- **View Transitions (first-party Next 16, `experimental.viewTransition` + React `<ViewTransition>`)** — the marquee wow: shared-element **morph of the grid thumbnail into the article hero** (`name={`photo-${id}`}`). Communicates "same story, going deeper." Gate directional slides behind reduced-motion. (Auto from slug/id)
- **Condensing/sticky masthead on scroll** — `position: sticky` (no CLS), scroll-driven shrink; anchor during view transitions.
- **Monochrome/duotone imagery treatment** (grayscale baseline → color on hover) — unifies mixed-quality CMS photos into one house style, reinforces brand. Make it opt-out per image. (Auto)

### Phase E — Reading comfort & conversion (Med; do the token refactor once)
- **Dark mode + reading themes (light / sepia / night)** via `@theme` CSS custom-property tokens + `data-theme` on `<html>`, cookie-persisted (SSR-safe, no flash), `color-scheme` per theme. Serif night = warm off-white on near-black, never pure #fff/#000. The token refactor is the cost; everything else inherits. (Auto)
- **Font-size controls (A− A A+)** — root `font-size` var stepped, cookie-persisted; `ch`/`rem` measure scales for free. Helps the older policy/politics demographic.
- **Newsletter capture** (one inline mid-article + one footer, understated, no modal) — top conversion channel, feeds Phase 4 accounts.
- **Save/bookmark + share row** (`navigator.share` + copy-link) — design now, wire to accounts in Phase 4.
- **Editorial skeletons + branded empty states** (`loading.tsx` + Suspense; reuse `HairlineRule`/`StoryBlock` shapes).
- **A11y polish**: `:focus-visible` rings, skip-to-content, semantic `<article>/<figure>/<time>`, AA+ contrast across all themes.

---

## 3. Recommended sequencing

1. **Brand decisions** (§1) — sign off wordmark, squirrel colophon, accent color, tagline. Blocks the visual work.
2. **Phase A** — typographic foundation + guardrails (one pass on `globals.css`; transforms the whole site in an afternoon).
3. **Phase B** — `enrichHtml()` server pass (unlocks pull quotes, figures, anchors everywhere at once).
4. **Phase C** — read time, progress, JSON-LD/updated, read-next rail, "The Latest" (the credibility + session-depth movers; aligns with existing Phase 3 revalidation work).
5. **Phase D** — hover, reveal-on-scroll, View Transitions morph, condensing masthead, imagery treatment (the interaction wow).
6. **Phase E** — theme tokens → dark/sepia/night, font-size, newsletter/bookmark/share, skeletons, a11y (on-ramp to Phase 4 accounts).

## 4. Deliberately skip (wrong register for a serious newspaper)
Bespoke per-story scrollytelling, WebGL/3D hero worlds, heavy smooth-scroll (Lenis) + GSAP, custom pointer-chasing cursors, springy/bouncy motion, colored masthead banner, blackletter nameplate, multi-color or cartoon squirrel.

## Files this will touch (for reference, not yet edited)
- `src/app/globals.css` — `@theme` tokens (accent, section tints, fluid scale, numerals, text-wrap), reduced-motion reset, prose additions, reveal/progress utilities.
- `src/lib/content/sanitize.ts` → add `enrichHtml()`; `images.ts`, `excerpt.ts`, `dates.ts`, `byline.ts` — read-time, figures, relative time.
- `src/lib/gather/queries.ts` — related-by-tag rail; `sections.ts` — per-section tint tokens.
- `src/components/layout/Masthead.tsx` — wordmark + colophon + condensing; `Footer.tsx` — colophon/newsletter.
- `src/components/news/*` — Kicker (section flag/tint), StoryBlock/LeadStory (hover, imagery, read-time), ArticleHeader (updated stamp, JSON-LD, share), ArticleBody (enriched HTML, drop cap, progress, read-next).
- `next.config.ts` — `experimental.viewTransition: true`.
- New: brand assets (svg colophon, favicon/app-icon/OG), `not-found.tsx`/`error.tsx`/`loading.tsx`.
