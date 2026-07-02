# Gather CMS Fix — Section Tags for thesquirrels.in

## Goal
Make Gather's **existing document tags** usable by the news site for section categorization and SEO, standardized to the six canonical sections: **Governance, Policy, Corporate, Politics, Economy, News**. This unblocks real section pages (replacing the interim keyword hack) and adds proper `articleSection` / keyword SEO.

## What we found in the Gather codebase
- Tags already exist and are attached to documents:
  - `model Tag { id, name, color, workspaceId, @@unique([workspaceId, name]) }` — `prisma/schema.prisma:400`
  - `model DocumentTag { documentId, tagId, @@id([documentId, tagId]) }` — `prisma/schema.prisma:573`
  - Internal (session-auth) tag APIs exist: `src/app/api/workspaces/[workspaceId]/tags/route.ts`, `src/app/api/documents/[slug]/tags/route.ts`.
- **Gap:** the public v1 API (`Authorization: Bearer gk_…`) never selects, returns, or filters by tags:
  - `src/app/api/v1/documents/route.ts` (list), `src/app/api/v1/documents/[slug]/route.ts` (single), `src/app/api/v1/search/route.ts`.
- Real tags are free-form today (screenshot shows a single tag "Policy Governance"), so the taxonomy must be reconciled to the 6 sections.

## Deployment reality
Gather runs on a GCP VM (PM2 + Caddy). API changes require build + `pm2 reload` on the VPS (`ShowNoMore`). All API changes below are **additive / backward-compatible** — `gather-blog` and existing calls keep working.

---

## Phase A — Audit & taxonomy
- **A1. Add `GET /api/v1/tags`** (API-key auth, `content:read`): returns `[{ name, color, usageCount }]` for the key's workspace. Mirrors the internal query (`prisma.tag.findMany` + `_count.documents`, see workspace tags route). Read-only, safe.
- **A2. Audit:** call it to list the real tags + counts, then build a mapping `{ existing tag → canonical section }` (e.g. "Policy Governance" → Policy). Identify untagged / mis-tagged documents.
- **A3. Decide canonical tags** = exactly the 6 section labels. Decide the **primary-section rule** (see Decisions).

## Phase B — Expose tags in v1 responses (SEO + rendering)
Additive `tags: [{ name, color }]` field on each document:
- **B1** `v1/documents/[slug]/route.ts`: add to `select`: `tags: { select: { tag: { select: { name: true, color: true } } } }`; map to `tags: doc.tags.map(dt => dt.tag)` in the response.
- **B2** `v1/documents/route.ts` (list): same include + mapping.
- **B3** `v1/search/route.ts`: same (optional).

## Phase C — Filter by section in v1 list
- **C1** `v1/documents/route.ts`: accept `?tag=<name>` (case-insensitive; comma-separated = OR). Extend `where` with
  `tags: { some: { tag: { name: { equals: <name>, mode: "insensitive" } } } }`.
  Add `tag` to the `queryHash`/`cacheKey` so cached pages don't collide.
- **C2 (optional)** `GET /api/v1/sections`: the 6 canonical sections + counts, so the site nav is data-driven.

## Phase D — Taxonomy cleanup / backfill (in Gather)
- **D1** Ensure the 6 canonical section tags exist in the workspace (idempotent create).
- **D2** One-off backfill script (DB, run on VPS): apply the Phase A mapping so **every published document has exactly one primary section tag**. For untagged docs: keyword-classify → editorial review. Multi-word tags like "Policy Governance" get split/mapped per the rule.
- **D3** Editorial process: make "assign a section" required on publish (enforce in the editor UI going forward), so this never regresses.

## Phase E — Site switch-over (thesquirrels.in)
- **E1** `lib/gather/client.ts`: add `tag` param to `listDocuments`; add `getTags()`.
- **E2** `lib/gather/queries.ts`: `getSectionStories` → `listDocuments({ tag: section.label })`; flip `GATHER_SECTION_FILTER=1`; retire the keyword fallback after backfill.
- **E3** Render tags: article `<meta>` keywords + `articleSection` JSON-LD + visible tag chips; section pages become exact.

## Rollout order
A1 → deploy → audit (A2/A3) → B → C → deploy → D (backfill) → E (config flip on the site). B & C are safe to ship immediately; D is the real effort; E is a one-line env change.

## Risks
- Existing tags are messy → mapping needs human decisions (a doc may carry several section-ish tags).
- Backfilling ~1,367 docs is the long pole (editorial review of auto-classification).
- v1 API is shared → keep every change additive/optional (done above).

## Decisions (locked)
1. **Multiple sections per article.** An article may carry several of the 6 section tags. `?tag=a,b` = OR. Article canonical URL stays `/article/<slug>` regardless of sections; all its sections are emitted as `articleSection`/keywords for SEO. Section pages will overlap by design.
2. **Implement + deploy:** changes made in `/home/stallone/Projects/gather`, built and deployed to the VPS (`ssh ShowNoMore`, build + `pm2 reload`) with the owner's go-ahead (granted).
