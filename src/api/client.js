const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.streetlabsafrica.org/api";

function getToken() {
  return localStorage.getItem("sla_access_token");
}

export function setTokens(access, refresh) {
  if (access) localStorage.setItem("sla_access_token", access);
  if (refresh) localStorage.setItem("sla_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("sla_access_token");
  localStorage.removeItem("sla_refresh_token");
  localStorage.removeItem("sla_user");
}

export async function api(path, options = {}) {
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
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
        : options.body,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    let message = data?.detail || data?.message || res.statusText;
    if (res.status === 413) {
      message =
        "Upload is too large for the server (413). Hero videos up to ~500 MB need client_max_body_size 600M on the API reverse proxy (see sla-backend/nginx.conf).";
    }
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const authApi = {
  login: (username, password) =>
    api("/auth/login/", { method: "POST", body: { username, password } }),
  me: () => api("/auth/me/"),
};

export const cmsApi = {
  homepage: () => api("/cms/homepage/"),
  settings: () => api("/cms/settings/"),
  updateSettings: (body) => api("/cms/settings/", { method: "PATCH", body }),
  hero: () => api("/hero/"),
  saveHero: (id, body) =>
    id
      ? api(`/hero/${id}/`, { method: "PATCH", body })
      : api("/hero/", { method: "POST", body }),
  gallery: () => api("/gallery/"),
  saveGallery: (id, body) =>
    id
      ? api(`/gallery/${id}/`, { method: "PATCH", body })
      : api("/gallery/", { method: "POST", body }),
  galleryImages: () => api("/gallery-images/"),
  saveGalleryImage: (id, body) =>
    id
      ? api(`/gallery-images/${id}/`, { method: "PATCH", body })
      : api("/gallery-images/", { method: "POST", body }),
  deleteGalleryImage: (id) =>
    api(`/gallery-images/${id}/`, { method: "DELETE" }),
  programs: () => api("/programs/"),
  saveProgram: (id, body) =>
    id
      ? api(`/programs/${id}/`, { method: "PATCH", body })
      : api("/programs/", { method: "POST", body }),
  deleteProgram: (id) => api(`/programs/${id}/`, { method: "DELETE" }),
  team: () => api("/team/"),
  saveTeam: (id, body) =>
    id
      ? api(`/team/${id}/`, { method: "PATCH", body })
      : api("/team/", { method: "POST", body }),
  deleteTeam: (id) => api(`/team/${id}/`, { method: "DELETE" }),
  values: () => api("/values/"),
  saveValue: (id, body) =>
    id
      ? api(`/values/${id}/`, { method: "PATCH", body })
      : api("/values/", { method: "POST", body }),
  deleteValue: (id) => api(`/values/${id}/`, { method: "DELETE" }),
  projects: () => api("/projects/"),
  events: () => api("/events/"),
  contactMessages: () => api("/contact-messages/"),
  postContact: (body) => api("/contact-messages/", { method: "POST", body }),
  updateContactMessage: (id, body) =>
    api(`/contact-messages/${id}/`, { method: "PATCH", body }),
  replyContactMessage: (id, body) =>
    api(`/contact-messages/${id}/reply/`, { method: "POST", body }),
  meetingRequests: (params = "") =>
    api(`/meeting-requests/${params ? `?${params}` : ""}`),
  postMeetingRequest: (body) =>
    api("/meeting-requests/", { method: "POST", body }),
  updateMeetingRequest: (id, body) =>
    api(`/meeting-requests/${id}/`, { method: "PATCH", body }),
  postNewsletter: (email) =>
    api("/newsletter/", { method: "POST", body: { email, source: "footer" } }),
  postDonation: (body) => api("/donations/", { method: "POST", body }),
};

export const qrApi = {
  list: () => api("/qr/"),
  get: (code) => api(`/qr/${code}/`),
  create: (body) => api("/qr/", { method: "POST", body }),
  update: (code, body) => api(`/qr/${code}/`, { method: "PATCH", body }),
  remove: (code) => api(`/qr/${code}/`, { method: "DELETE" }),
  resolve: (code, password = "") => {
    const q = password ? `?password=${encodeURIComponent(password)}` : "";
    return api(`/qr/resolve/${code}/${q}`);
  },
  hub: (code) => api(`/qr/hub/${code}/`),
  trackLink: (code, linkId) =>
    api(`/qr/track-link/${code}/${linkId}/`, { method: "POST", body: {} }),
  analytics: (code) => api(`/qr/${code}/analytics/`),
  imageUrl: (code, format = "png") =>
    `${API_BASE}/qr/${code}/image/?export=${format}`,
  bulk: (items) => api("/qr/bulk/", { method: "POST", body: { items } }),
};

export const profileApi = {
  list: () => api("/profiles/"),
  get: (username) => api(`/profiles/${username}/`),
  save: (username, body) =>
    username
      ? api(`/profiles/${username}/`, { method: "PATCH", body })
      : api("/profiles/", { method: "POST", body }),
  ensureQr: (username) =>
    api(`/profiles/${username}/ensure-qr/`, { method: "POST", body: {} }),
  vcardUrl: (username) => `${API_BASE}/profiles/${username}/vcard/`,
};

export const dashboardApi = {
  stats: () => api("/dashboard/stats/"),
  platformAnalytics: () => api("/analytics/platform/"),
};

export { API_BASE };
