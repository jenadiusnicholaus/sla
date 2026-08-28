const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.streetlabsafrica.org/api";

function getToken(): string | null {
  return localStorage.getItem("sla_access_token");
}

export function setTokens(
  access?: string | null,
  refresh?: string | null,
): void {
  if (access) localStorage.setItem("sla_access_token", access);
  if (refresh) localStorage.setItem("sla_refresh_token", refresh);
}

export function clearTokens(): void {
  localStorage.removeItem("sla_access_token");
  localStorage.removeItem("sla_refresh_token");
  localStorage.removeItem("sla_user");
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T | null> {
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      options.body &&
      !(options.body instanceof FormData) &&
      typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : (options.body as BodyInit | undefined),
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errData = data as Record<string, unknown> | null;
    let message: string =
      (errData?.detail as string) ||
      (errData?.message as string) ||
      res.statusText;
    if (res.status === 413) {
      message =
        "Upload is too large for the server (413). Hero videos up to ~500 MB need client_max_body_size 600M on the API reverse proxy (see sla-backend/nginx.conf).";
    }
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const authApi = {
  login: (username: string, password: string) =>
    api("/auth/login/", { method: "POST", body: { username, password } }),
  me: () => api("/auth/me/"),
};

export const cmsApi = {
  homepage: () => api("/cms/homepage/"),
  settings: () => api("/cms/settings/"),
  updateSettings: (body: Record<string, unknown>) =>
    api("/cms/settings/", { method: "PATCH", body }),
  hero: () => api("/hero/"),
  saveHero: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/hero/${id}/`, { method: "PATCH", body })
      : api("/hero/", { method: "POST", body }),
  gallery: () => api("/gallery/"),
  saveGallery: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/gallery/${id}/`, { method: "PATCH", body })
      : api("/gallery/", { method: "POST", body }),
  galleryImages: () => api("/gallery-images/"),
  saveGalleryImage: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/gallery-images/${id}/`, { method: "PATCH", body })
      : api("/gallery-images/", { method: "POST", body }),
  deleteGalleryImage: (id: number) =>
    api(`/gallery-images/${id}/`, { method: "DELETE" }),
  programs: () => api("/programs/"),
  saveProgram: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/programs/${id}/`, { method: "PATCH", body })
      : api("/programs/", { method: "POST", body }),
  deleteProgram: (id: number) => api(`/programs/${id}/`, { method: "DELETE" }),
  team: () => api("/team/"),
  saveTeam: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/team/${id}/`, { method: "PATCH", body })
      : api("/team/", { method: "POST", body }),
  deleteTeam: (id: number) => api(`/team/${id}/`, { method: "DELETE" }),
  values: () => api("/values/"),
  saveValue: (id: number | null, body: Record<string, unknown>) =>
    id
      ? api(`/values/${id}/`, { method: "PATCH", body })
      : api("/values/", { method: "POST", body }),
  deleteValue: (id: number) => api(`/values/${id}/`, { method: "DELETE" }),
  projects: () => api("/projects/"),
  events: () => api("/events/"),
  contactMessages: () => api("/contact-messages/"),
  postContact: (body: Record<string, unknown>) =>
    api("/contact-messages/", { method: "POST", body }),
  updateContactMessage: (id: number, body: Record<string, unknown>) =>
    api(`/contact-messages/${id}/`, { method: "PATCH", body }),
  replyContactMessage: (id: number, body: Record<string, unknown>) =>
    api(`/contact-messages/${id}/reply/`, { method: "POST", body }),
  meetingRequests: (params = "") =>
    api(`/meeting-requests/${params ? `?${params}` : ""}`),
  postMeetingRequest: (body: Record<string, unknown>) =>
    api("/meeting-requests/", { method: "POST", body }),
  updateMeetingRequest: (id: number, body: Record<string, unknown>) =>
    api(`/meeting-requests/${id}/`, { method: "PATCH", body }),
  postNewsletter: (email: string) =>
    api("/newsletter/", { method: "POST", body: { email, source: "footer" } }),
  postDonation: (body: Record<string, unknown>) =>
    api("/donations/", { method: "POST", body }),
};

export const qrApi = {
  list: () => api("/qr/"),
  get: (code: string) => api(`/qr/${code}/`),
  create: (body: Record<string, unknown>) =>
    api("/qr/", { method: "POST", body }),
  update: (code: string, body: Record<string, unknown>) =>
    api(`/qr/${code}/`, { method: "PATCH", body }),
  remove: (code: string) => api(`/qr/${code}/`, { method: "DELETE" }),
  resolve: (code: string, password = "") => {
    const q = password ? `?password=${encodeURIComponent(password)}` : "";
    return api(`/qr/resolve/${code}/${q}`);
  },
  hub: (code: string) => api(`/qr/hub/${code}/`),
  trackLink: (code: string, linkId: number) =>
    api(`/qr/track-link/${code}/${linkId}/`, { method: "POST", body: {} }),
  analytics: (code: string) => api(`/qr/${code}/analytics/`),
  imageUrl: (code: string, format = "png") =>
    `${API_BASE}/qr/${code}/image/?export=${format}`,
  bulk: (items: unknown[]) =>
    api("/qr/bulk/", { method: "POST", body: { items } }),
};

export const profileApi = {
  list: () => api("/profiles/"),
  get: (username: string) => api(`/profiles/${username}/`),
  save: (username: string | null, body: Record<string, unknown>) =>
    username
      ? api(`/profiles/${username}/`, { method: "PATCH", body })
      : api("/profiles/", { method: "POST", body }),
  ensureQr: (username: string) =>
    api(`/profiles/${username}/ensure-qr/`, { method: "POST", body: {} }),
  vcardUrl: (username: string) => `${API_BASE}/profiles/${username}/vcard/`,
};

export const dashboardApi = {
  stats: () => api("/dashboard/stats/"),
  platformAnalytics: () => api("/analytics/platform/"),
};

export interface DonationStats {
  total_donations: number;
  successful: number;
  pending: number;
  failed: number;
  confirmed_total: string;
  confirmed_count: number;
  confirmed_by_currency: { currency: string; total: string; count: number }[];
}

export const donationApi = {
  list: (params = "") => api(`/donations/${params ? `?${params}` : ""}`),
  stats: () => api<DonationStats>("/donations/stats/"),
  get: (id: number) => api(`/donations/${id}/`),
  update: (id: number, body: Record<string, unknown>) =>
    api(`/donations/${id}/`, { method: "PATCH", body }),
  remove: (id: number) => api(`/donations/${id}/`, { method: "DELETE" }),
};

export const donationConfirmationApi = {
  list: (params = "") =>
    api(`/donation-confirmations/${params ? `?${params}` : ""}`),
  get: (id: number) => api(`/donation-confirmations/${id}/`),
};

export { API_BASE };
