import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";

/**
 * On-demand revalidation webhook. Two ways to call it:
 *
 * 1. Gather's native webhook (automatic, real-time). Gather signs each delivery
 *    with `HMAC-SHA256(secret, "{timestamp}.{body}")` sent as
 *    `X-Gather-Signature: sha256=<hex>`. We verify it with `GATHER_WEBHOOK_SECRET`
 *    (the same secret the webhook is registered with in Gather) and revalidate
 *    the document from `body.document.slug`.
 *
 * 2. Manual trigger via shared secret `REVALIDATE_SECRET` — either the
 *    `x-revalidate-secret` header or a `?secret=` query param, with an optional
 *    body `{ slug, tag, section }`. Handy for a "refresh now" ping.
 *
 * Any content change also refreshes the document lists ("documents") and the
 * homepage ("/").
 */

const SECRET = process.env.REVALIDATE_SECRET;
const GATHER_WEBHOOK_SECRET = process.env.GATHER_WEBHOOK_SECRET;

type Payload = {
  slug?: string;
  tag?: string;
  section?: string;
};

function authorized(req: NextRequest): boolean {
  if (!SECRET) return false;
  const header = req.headers.get("x-revalidate-secret");
  const query = req.nextUrl.searchParams.get("secret");
  return header === SECRET || query === SECRET;
}

async function handle(req: NextRequest, body: Payload) {
  const revalidated: string[] = [];
  // `{ expire: 0 }` = immediate expiry, the correct mode for an external webhook
  // (Next 16 requires the second arg; single-arg form is deprecated).
  const tag = (t: string) => {
    revalidateTag(t, { expire: 0 });
    revalidated.push(`tag:${t}`);
  };
  const path = (p: string) => {
    revalidatePath(p);
    revalidated.push(`path:${p}`);
  };

  // Targeted: the specific article + its section/tag lists.
  if (body.slug) {
    tag(`article:${body.slug}`);
    path(`/article/${body.slug}`);
  }
  if (body.tag) tag(`tag:${body.tag.toLowerCase()}`);
  if (body.section) tag(`section:${body.section}`);

  // Any change affects the homepage + every list view.
  tag("documents");
  tag("search");
  path("/");

  return NextResponse.json({ ok: true, revalidated });
}

/** Verify a Gather webhook: HMAC-SHA256(secret, "{timestamp}.{rawBody}"). */
function verifyGatherSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null
): boolean {
  if (!GATHER_WEBHOOK_SECRET || !timestamp || !signature) return false;
  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", GATHER_WEBHOOK_SECRET)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const gatherSig = req.headers.get("x-gather-signature");

  // --- Gather native webhook (HMAC-signed, automatic) ---
  if (gatherSig) {
    const ts = req.headers.get("x-gather-timestamp");
    if (!verifyGatherSignature(raw, ts, gatherSig)) {
      return NextResponse.json(
        { ok: false, error: "Bad signature" },
        { status: 401 }
      );
    }
    let evt: { event?: string; document?: { slug?: string } } = {};
    try {
      evt = JSON.parse(raw);
    } catch {
      // ignore
    }
    if (evt.event === "ping") {
      return NextResponse.json({ ok: true, ping: true });
    }
    return handle(req, { slug: evt.document?.slug });
  }

  // --- Manual trigger (shared secret) ---
  if (!authorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  let body: Payload = {};
  try {
    body = raw ? (JSON.parse(raw) as Payload) : {};
  } catch {
    // empty / non-JSON body is fine — falls through to a full refresh
  }
  return handle(req, body);
}

/** Convenience: GET with the secret triggers a full refresh (manual "refresh now"). */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return handle(req, {});
}
