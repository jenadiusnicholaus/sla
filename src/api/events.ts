import { api } from "./client";

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ExpoEvent {
  id: string;
  year: number;
  title: string;
  tagline: string;
  description: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  venue_address: string;
  venue_lat: number | null;
  venue_lng: number | null;
  hero_images: string[];
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  stats?: EventStat[];
  focus_areas?: FocusArea[];
  partners?: Partner[];
  villages?: Village[];
  speakers?: Speaker[];
  sessions?: Session[];
  booth_applications?: BoothApplication[];
  registrations?: Registration[];
}

export interface EventStat {
  id: string;
  event: string;
  label: string;
  value: string;
  order: number;
}

export interface FocusArea {
  id: string;
  event: string;
  num: string;
  title: string;
  description: string;
  accent_color: string;
  badge_color: string;
  image_url: string;
  order: number;
}

export interface Partner {
  id: string;
  event: string;
  name: string;
  logo_url: string;
  tier: "HOST" | "LEAD_PARTNER" | "PARTNER" | "MEDIA";
  website_url: string;
  order: number;
}

export interface Village {
  id: string;
  event: string;
  name: string;
  slug: string;
  hall: string;
  emoji: string;
  theme_color: string;
  tagline: string;
  description: string;
  hero_image: string;
  stats: { label: string; value: string }[];
  booths_count?: number;
  demos_count?: number;
  order: number;
  booths?: VillageBooth[];
  schedule?: VillageSchedule[];
  gallery?: VillageGallery[];
}

export interface VillageBooth {
  id: string;
  village: string;
  name: string;
  org: string;
  booth_number: string;
  tag: string;
  description: string;
  live_demo: string;
  website_url: string;
  logo_url: string;
  is_featured: boolean;
  order: number;
}

export interface VillageSchedule {
  id: string;
  village: string;
  time: string;
  title: string;
  presenter: string;
  booth_or_stage: string;
  day_number: number;
  order: number;
}

export interface VillageGallery {
  id: string;
  village: string;
  url: string;
  title: string;
  caption: string;
  edition_year: number;
  order: number;
}

export interface BoothApplication {
  id: string;
  reference_no: string;
  event: string;
  village: string;
  company_name: string;
  company_website: string;
  company_sector: string;
  booth_package: string;
  showcase_title: string;
  showcase_desc: string;
  tech_requirements: string[];
  co_exhibitors: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  country: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ALLOCATED";
  assigned_booth_no: string;
  admin_notes: string;
  agree_terms: boolean;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event: string;
  type: "GUEST" | "SPEAKER" | "VOLUNTEER";
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  country: string;
  reference_no: string;
  badge_code?: string;
  agree_terms: boolean;
  extra_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  event: string;
  name: string;
  title: string;
  org: string;
  initials: string;
  color: string;
  accent_light: string;
  photo_url: string;
  bio: string;
  order: number;
  is_confirmed: boolean;
}

export interface Session {
  id: string;
  event: string;
  day_number: number;
  start_time: string;
  end_time: string;
  title: string;
  type: "KEYNOTE" | "PANEL" | "WORKSHOP" | "BREAK" | "NETWORKING";
  speaker_id: string | null;
  speaker_text: string;
  location: string;
  order: number;
  speaker: Speaker | null;
}

export interface MediaAsset {
  id: string;
  event: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
  url: string;
  thumbnail_url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface MediaFile {
  id: string;
  event: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  folder: string;
  url: string;
  thumbnail_url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface BoothStatusBody {
  status: string;
  assigned_booth_no?: string;
  admin_notes?: string;
}

export interface DashboardMetrics {
  totalRegistrations: number;
  breakdown: {
    guests: number;
    booths: number;
    speakers: number;
    volunteers: number;
  };
  villageOccupancy: {
    slug: string;
    name: string;
    allocatedBooths: number;
    capacity: number;
    occupancyRate: string;
  }[];
  pendingBoothApplications: number;
}

function buildListQuery(
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  return q.toString() ? `?${q.toString()}` : "";
}

export const expoEventsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api<Paginated<ExpoEvent>>(`/admin/expo-events/${buildListQuery(params)}`),
  get: (year: number) => api<ExpoEvent>(`/admin/expo-events/${year}/`),
  create: (body: Record<string, unknown>) =>
    api<ExpoEvent>("/admin/expo-events/", { method: "POST", body }),
  update: (year: number, body: Record<string, unknown>) =>
    api<ExpoEvent>(`/admin/expo-events/${year}/`, { method: "PATCH", body }),
  remove: (year: number) =>
    api(`/admin/expo-events/${year}/`, { method: "DELETE" }),
  activate: (year: number) =>
    api<{ success: boolean; message: string; data: ExpoEvent }>(
      `/admin/expo-events/${year}/activate/`,
      { method: "PATCH", body: {} },
    ),
  publish: (year: number) =>
    api<{ success: boolean; message: string; data: ExpoEvent }>(
      `/admin/expo-events/${year}/publish/`,
      { method: "PATCH", body: {} },
    ),
  unpublish: (year: number) =>
    api<{ success: boolean; message: string; data: ExpoEvent }>(
      `/admin/expo-events/${year}/unpublish/`,
      { method: "PATCH", body: {} },
    ),
  metrics: (year: number) =>
    api<{ success: boolean; metrics: DashboardMetrics }>(
      `/admin/events/${year}/metrics/`,
    ),
  exportBadges: (year: number, type = "all") =>
    api<string>(`/admin/events/${year}/export/badges/?type=${type}`),
};

export const eventStatsApi = {
  list: (params?: { event?: string }) =>
    api<Paginated<EventStat>>(`/admin/event-stats/${buildListQuery(params)}`),
  get: (id: string) => api<EventStat>(`/admin/event-stats/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<EventStat>("/admin/event-stats/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<EventStat>(`/admin/event-stats/${id}/`, { method: "PATCH", body }),
  remove: (id: string) =>
    api(`/admin/event-stats/${id}/`, { method: "DELETE" }),
};

export const focusAreasApi = {
  list: (params?: { event?: string }) =>
    api<Paginated<FocusArea>>(`/admin/focus-areas/${buildListQuery(params)}`),
  get: (id: string) => api<FocusArea>(`/admin/focus-areas/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<FocusArea>("/admin/focus-areas/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<FocusArea>(`/admin/focus-areas/${id}/`, { method: "PATCH", body }),
  remove: (id: string) =>
    api(`/admin/focus-areas/${id}/`, { method: "DELETE" }),
};

export const partnersApi = {
  list: (params?: { event?: string; tier?: string }) =>
    api<Paginated<Partner>>(`/admin/partners/${buildListQuery(params)}`),
  get: (id: string) => api<Partner>(`/admin/partners/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<Partner>("/admin/partners/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<Partner>(`/admin/partners/${id}/`, { method: "PATCH", body }),
  remove: (id: string) => api(`/admin/partners/${id}/`, { method: "DELETE" }),
};

export const villagesApi = {
  list: (params?: { event?: string }) =>
    api<Paginated<Village>>(`/admin/villages/${buildListQuery(params)}`),
  get: (slug: string) => api<Village>(`/admin/villages/${slug}/`),
  create: (body: Record<string, unknown>) =>
    api<Village>("/admin/villages/", { method: "POST", body }),
  update: (slug: string, body: Record<string, unknown>) =>
    api<Village>(`/admin/villages/${slug}/`, { method: "PATCH", body }),
  remove: (slug: string) =>
    api(`/admin/villages/${slug}/`, { method: "DELETE" }),
};

export const villageBoothsApi = {
  list: (params?: { village?: string }) =>
    api<Paginated<VillageBooth>>(
      `/admin/village-booths/${buildListQuery(params)}`,
    ),
  get: (id: string) => api<VillageBooth>(`/admin/village-booths/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<VillageBooth>("/admin/village-booths/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<VillageBooth>(`/admin/village-booths/${id}/`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) =>
    api(`/admin/village-booths/${id}/`, { method: "DELETE" }),
};

export const villageSchedulesApi = {
  list: (params?: { village?: string; day_number?: number }) =>
    api<Paginated<VillageSchedule>>(
      `/admin/village-schedules/${buildListQuery(params)}`,
    ),
  get: (id: string) => api<VillageSchedule>(`/admin/village-schedules/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<VillageSchedule>("/admin/village-schedules/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<VillageSchedule>(`/admin/village-schedules/${id}/`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) =>
    api(`/admin/village-schedules/${id}/`, { method: "DELETE" }),
};

export const villageGalleriesApi = {
  list: (params?: { village?: string; edition_year?: number }) =>
    api<Paginated<VillageGallery>>(
      `/admin/village-galleries/${buildListQuery(params)}`,
    ),
  get: (id: string) => api<VillageGallery>(`/admin/village-galleries/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<VillageGallery>("/admin/village-galleries/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<VillageGallery>(`/admin/village-galleries/${id}/`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) =>
    api(`/admin/village-galleries/${id}/`, { method: "DELETE" }),
};

export const boothApplicationsApi = {
  list: (params?: {
    event?: string;
    village?: string;
    status?: string;
    search?: string;
  }) =>
    api<Paginated<BoothApplication>>(
      `/admin/booth-applications/${buildListQuery(params)}`,
    ),
  get: (id: string) =>
    api<BoothApplication>(`/admin/booth-applications/${id}/`),
  update: (id: string, body: Record<string, unknown>) =>
    api<BoothApplication>(`/admin/booth-applications/${id}/`, {
      method: "PATCH",
      body,
    }),
  remove: (id: string) =>
    api(`/admin/booth-applications/${id}/`, { method: "DELETE" }),
  status: (id: string, body: BoothStatusBody) =>
    api<BoothApplication>(`/admin/booth-applications/${id}/status/`, {
      method: "PATCH",
      body,
    }),
};

export const registrationsApi = {
  list: (params?: {
    event?: string;
    type?: string;
    status?: string;
    search?: string;
  }) =>
    api<Paginated<Registration>>(
      `/admin/registrations/${buildListQuery(params)}`,
    ),
  get: (id: string) => api<Registration>(`/admin/registrations/${id}/`),
  update: (id: string, body: Record<string, unknown>) =>
    api<Registration>(`/admin/registrations/${id}/`, { method: "PATCH", body }),
  remove: (id: string) =>
    api(`/admin/registrations/${id}/`, { method: "DELETE" }),
};

export const speakersApi = {
  list: (params?: { event?: string; is_confirmed?: boolean }) =>
    api<Paginated<Speaker>>(`/admin/speakers/${buildListQuery(params)}`),
  get: (id: string) => api<Speaker>(`/admin/speakers/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<Speaker>("/admin/speakers/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<Speaker>(`/admin/speakers/${id}/`, { method: "PATCH", body }),
  remove: (id: string) => api(`/admin/speakers/${id}/`, { method: "DELETE" }),
};

export const sessionsApi = {
  list: (params?: { event?: string; day_number?: number; type?: string }) =>
    api<Paginated<Session>>(`/admin/sessions/${buildListQuery(params)}`),
  get: (id: string) => api<Session>(`/admin/sessions/${id}/`),
  create: (body: Record<string, unknown>) =>
    api<Session>("/admin/sessions/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<Session>(`/admin/sessions/${id}/`, { method: "PATCH", body }),
  remove: (id: string) => api(`/admin/sessions/${id}/`, { method: "DELETE" }),
};

export const mediaAssetsApi = {
  list: (params?: { event?: string; folder?: string }) =>
    api<Paginated<MediaAsset>>(`/admin/media-assets/${buildListQuery(params)}`),
  get: (id: string) => api<MediaAsset>(`/admin/media-assets/${id}/`),
  upload: (body: FormData) =>
    api<MediaAsset>("/admin/media-assets/", { method: "POST", body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<MediaAsset>(`/admin/media-assets/${id}/`, { method: "PATCH", body }),
  remove: (id: string) =>
    api(`/admin/media-assets/${id}/`, { method: "DELETE" }),
};

export const mediaLibraryApi = {
  list: (params?: {
    folder?: string;
    search?: string;
    eventId?: string;
    page?: number;
    limit?: number;
  }) => api<Paginated<MediaFile>>(`/admin/files/${buildListQuery(params)}`),
};
