import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand revalidation webhook.
 *
 * Gather calls this whenever a document is published / updated / deleted so the
 * site refreshes within seconds instead of waiting for the ISR window. Auth is a
 * shared secret (`REVALIDATE_SECRET`) sent either as the `x-revalidate-secret`
 * header or a `?secret=` query param.
 *
 * Body (all optional):
 *   { "slug": "some-article-slug", "tag": "Politics", "section": "<parentSlug>" }
 *
 * Any content change also refreshes the document lists ("documents") and the
 * homepage ("/"). Send with no body to just refresh those.
 */

const SECRET = process.env.REVALIDATE_SECRET;

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

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  let body: Payload = {};
  try {
    body = (await req.json()) as Payload;
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
