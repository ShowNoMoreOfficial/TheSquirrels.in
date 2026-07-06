import "server-only";
import type {
  GatherListResponse,
  GatherPost,
  GatherSearchResponse,
} from "./types";

const API_URL = process.env.GATHER_API_URL || "https://vritti.shownomore.com";
const API_KEY = process.env.GATHER_API_KEY || "";

/**
 * In development we always fetch live so CMS edits show up on localhost
 * immediately. In production we use ISR + cache tags, refreshed on demand by
 * the Gather webhook (see src/app/api/revalidate/route.ts).
 */
const LIVE_IN_DEV = process.env.NODE_ENV !== "production";

type FetchOpts = {
  /** ISR revalidate window in seconds */
  revalidate?: number;
  /** Cache tags for on-demand revalidation (see api/revalidate) */
  tags?: string[];
};

async function gatherFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { revalidate = 300, tags = [] } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    ...(LIVE_IN_DEV
      ? { cache: "no-store" as const }
      : { next: { revalidate, tags } }),
  });

  if (!res.ok) {
    throw new Error(`Gather API ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json() as Promise<T>;
}

export type ListParams = {
  page?: number;
  limit?: number;
  sort?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  parent?: string;
  /** Section/topic tag filter (comma-separated = OR, case-insensitive). */
  tag?: string;
  format?: "html" | "text" | "json";
};

export function listDocuments(
  params: ListParams = {},
  opts: FetchOpts = {}
): Promise<GatherListResponse> {
  const {
    page = 1,
    limit = 20,
    sort = "createdAt",
    order = "desc",
    parent,
    tag,
    format = "html",
  } = params;
  const qs = new URLSearchParams({
    format,
    page: String(page),
    limit: String(limit),
    sort,
    order,
  });
  if (parent) qs.set("parent", parent);
  if (tag) qs.set("tag", tag);
  return gatherFetch<GatherListResponse>(`/api/v1/documents?${qs}`, {
    revalidate: 300,
    tags: [
      "documents",
      ...(parent ? [`section:${parent}`] : []),
      ...(tag ? [`tag:${tag.toLowerCase()}`] : []),
    ],
    ...opts,
  });
}

export async function getDocument(
  slug: string,
  format: "html" | "text" = "html"
): Promise<GatherPost | null> {
  try {
    return await gatherFetch<GatherPost>(
      `/api/v1/documents/${encodeURIComponent(slug)}?format=${format}`,
      { revalidate: 3600, tags: [`article:${slug}`] }
    );
  } catch {
    return null;
  }
}

export function searchDocuments(
  query: string,
  params: { page?: number; limit?: number; format?: "html" | "text" } = {},
  opts: FetchOpts = {}
): Promise<GatherSearchResponse> {
  const { page = 1, limit = 10, format = "text" } = params;
  const qs = new URLSearchParams({
    query,
    format,
    page: String(page),
    limit: String(limit),
  });
  return gatherFetch<GatherSearchResponse>(`/api/v1/search?${qs}`, {
    revalidate: 300,
    tags: ["search"],
    ...opts,
  });
}
