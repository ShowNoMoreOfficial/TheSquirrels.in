/** A document returned by the Gather v1 API. */
export interface GatherPost {
  id: string;
  /** Human-readable slug (used in /article/<slug>) */
  slug: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  /** HTML when fetched with ?format=html; plain text with ?format=text */
  content: string;
  parentSlug: string | null;
  author?: { name: string | null; image: string | null };
  tags?: { name: string; color: string }[];
  /** Per-document SEO overrides set in the CMS; null fields fall back to auto. */
  seo?: {
    title: string | null;
    description: string | null;
    keywords: string | null;
    canonicalUrl: string | null;
    ogImage: string | null;
    noIndex: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GatherPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GatherListResponse {
  data: GatherPost[];
  pagination: GatherPagination;
}

export interface GatherSearchResponse {
  data: (GatherPost & { snippet?: string })[];
}
