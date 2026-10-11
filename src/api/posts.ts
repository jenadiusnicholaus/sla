import { api } from "./client";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Post {
  id: number;
  post_type: "blog" | "podcast";
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  episode_number: number | null;
  scheduled_at: string | null;
  live_join_url: string;
  recording_url: string;
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

function buildListQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `?${qs}` : "";
}

export const postsApi = {
  publicList: (params?: { post_type?: string; search?: string }) =>
    api<Paginated<Post>>(
      `/posts/${buildListQuery(params as Record<string, unknown>)}`,
    ),
  publicGet: (slug: string) => api<Post>(`/posts/${slug}/`),
  list: (params?: { post_type?: string; search?: string }) =>
    api<Paginated<Post>>(
      `/admin/posts/${buildListQuery(params as Record<string, unknown>)}`,
    ),
  get: (slug: string) => api<Post>(`/admin/posts/${slug}/`),
  create: (body: Record<string, unknown> | FormData) =>
    api<Post>("/admin/posts/", { method: "POST", body }),
  update: (slug: string, body: Record<string, unknown> | FormData) =>
    api<Post>(`/admin/posts/${slug}/`, { method: "PATCH", body }),
  remove: (slug: string) => api(`/admin/posts/${slug}/`, { method: "DELETE" }),
};
