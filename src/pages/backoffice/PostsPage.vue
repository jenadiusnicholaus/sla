<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { postsApi } from "@/api/posts";
import type { Post } from "@/api/posts";
import { MEDIA_BASE } from "@/api/client";
import { marked } from "marked";

function toBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function extractFile(item: any): Promise<string | null> {
  if (!item) return null;
  if (item instanceof File || item instanceof Blob) return toBase64(item);
  if (item.raw instanceof File || item.raw instanceof Blob)
    return toBase64(item.raw);
  if (item.file instanceof File || item.file instanceof Blob)
    return toBase64(item.file);
  if (item.file?.raw instanceof File || item.file?.raw instanceof Blob)
    return toBase64(item.file.raw);
  if (item.image instanceof File || item.image instanceof Blob)
    return toBase64(item.image);
  if (item.image?.raw instanceof File || item.image?.raw instanceof Blob)
    return toBase64(item.image.raw);
  if (item.url && /^data:/.test(item.url)) return item.url;
  if (typeof item.arrayBuffer === "function") return toBase64(item as Blob);
  return null;
}

function renderMarkdown(md: string): string {
  try {
    return marked(md) as string;
  } catch {
    return md;
  }
}

function resolveMediaUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE}${url.replace(/^\//, "")}`;
}

const posts = ref<Post[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const msg = ref("");

const filterType = ref<"" | "blog" | "podcast">("");
const searchQuery = ref("");

const modalOpen = ref(false);
const editingSlug = ref<string | null>(null);
const form = ref<Record<string, any>>({});
const uploadFiles = ref<Record<string, any[]>>({});

watch(
  uploadFiles,
  async (val) => {
    for (const [key, files] of Object.entries(val)) {
      if (!files || !files.length) continue;
      if (key !== "cover_image") continue;
      const last = files[files.length - 1];
      const b64 = await extractFile(last);
      if (b64) form.value.cover_image = b64;
    }
  },
  { deep: true },
);

const filteredPosts = computed(() => posts.value);
const showPodcastFields = computed(
  () => String(form.value.post_type ?? "").trim() === "podcast",
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const params: Record<string, string> = {};
    if (filterType.value) params.post_type = filterType.value;
    if (searchQuery.value) params.search = searchQuery.value;
    const res = await postsApi.list(params);
    posts.value = res?.results || [];
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load posts";
  } finally {
    loading.value = false;
  }
}

function openNew() {
  editingSlug.value = null;
  uploadFiles.value = { cover_image: [] };
  form.value = {
    post_type: "blog",
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image: "",
    episode_number: null,
    scheduled_at: "",
    live_join_url: "",
    recording_url: "",
    is_published: true,
    order: 0,
  };
  modalOpen.value = true;
  msg.value = "";
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function openEdit(p: Post) {
  editingSlug.value = p.slug;
  uploadFiles.value = { cover_image: [] };
  form.value = {
    post_type: p.post_type,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    cover_image: p.cover_image || "",
    episode_number: p.episode_number,
    scheduled_at: toDatetimeLocal(p.scheduled_at || ""),
    live_join_url: p.live_join_url || "",
    recording_url: p.recording_url || "",
    is_published: p.is_published,
    order: p.order,
  };
  modalOpen.value = true;
  msg.value = "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function toDatetimeWithTz(localValue: string): string {
  if (!localValue) return "";
  // datetime-local gives "2026-10-11T19:00" — append timezone offset
  const date = new Date(localValue);
  if (isNaN(date.getTime())) return localValue;
  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  const tz = `${sign}${pad(Math.floor(tzOffset / 60))}:${pad(tzOffset % 60)}`;
  return `${localValue}:00${tz}`;
}

async function save() {
  saving.value = true;
  error.value = "";
  try {
    const f = { ...form.value };

    // Auto-generate slug if blank
    if (!f.slug && f.title) {
      f.slug = slugify(f.title);
    }

    // Clear podcast-only fields for blog posts
    if (f.post_type !== "podcast") {
      f.episode_number = null;
      f.live_join_url = "";
      f.recording_url = "";
    }

    // Fix datetime format: only convert if it looks like datetime-local (no tz yet)
    if (
      f.scheduled_at &&
      !f.scheduled_at.includes("+") &&
      !f.scheduled_at.endsWith("Z")
    ) {
      f.scheduled_at = toDatetimeWithTz(f.scheduled_at);
    }

    // Build FormData for multipart upload (cover_image as file)
    const fd = new FormData();
    const isBase64 =
      typeof f.cover_image === "string" && f.cover_image.startsWith("data:");
    const hasExistingCover =
      typeof f.cover_image === "string" && f.cover_image && !isBase64;

    for (const [key, value] of Object.entries(f)) {
      if (key === "cover_image") {
        if (isBase64) {
          // Convert base64 data URL to File
          const arr = f.cover_image.split(",");
          const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
          const bstr = atob(arr[1]);
          const u8 = new Uint8Array(bstr.length);
          for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
          fd.append("cover_image", new Blob([u8], { type: mime }), "cover.jpg");
        }
        // If existing URL or empty — skip; API keeps the current image unchanged
      } else if (value !== null && value !== undefined && value !== "") {
        fd.append(key, String(value));
      } else if (value === null || value === "") {
        // Send empty strings for fields the API may expect
        if (
          [
            "excerpt",
            "body",
            "live_join_url",
            "recording_url",
            "scheduled_at",
          ].includes(key)
        ) {
          fd.append(key, "");
        }
      }
    }

    if (editingSlug.value) {
      await postsApi.update(editingSlug.value, fd);
      msg.value = "Post updated";
    } else {
      await postsApi.create(fd);
      msg.value = "Post created";
    }
    modalOpen.value = false;
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to save post";
  } finally {
    saving.value = false;
  }
}

async function remove(p: Post) {
  if (!confirm(`Delete "${p.title}"?`)) return;
  try {
    await postsApi.remove(p.slug);
    msg.value = "Post deleted";
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to delete post";
  }
}

function formatDate(v: string): string {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return v;
  }
}

const tableColumns = [
  { key: "title", label: "Title", sortable: true },
  { key: "post_type", label: "Type", sortable: true },
  { key: "excerpt", label: "Excerpt" },
  { key: "status", label: "Status" },
  { key: "date", label: "Created" },
  { key: "actions", label: "" },
];

const tableRows = computed(() =>
  posts.value.map((p) => ({
    title: p.title,
    post_type: p.post_type,
    excerpt: p.excerpt,
    status: p.is_published ? "Published" : "Draft",
    date: formatDate(p.created_at),
    _raw: p,
  })),
);

onMounted(load);
</script>

<template>
  <main class="posts-page">
    <div class="page-header">
      <div>
        <h1>Posts</h1>
        <p class="subtitle">Manage blog articles and podcast episodes</p>
      </div>
      <div class="header-actions">
        <button type="button" class="refresh-btn" @click="load">
          <VaIcon name="refresh" size="18px" /> Refresh
        </button>
        <button type="button" class="new-btn" @click="openNew">
          <VaIcon name="add" size="18px" /> New Post
        </button>
      </div>
    </div>

    <p v-if="error" class="banner err">{{ error }}</p>
    <p v-if="msg" class="banner ok">{{ msg }}</p>

    <div class="filter-bar">
      <select v-model="filterType" @change="load">
        <option value="">All types</option>
        <option value="blog">Blog</option>
        <option value="podcast">Podcast</option>
      </select>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search title, slug, excerpt…"
        @keyup.enter="load"
      />
      <button type="button" class="refresh-btn" @click="load">Search</button>
    </div>

    <div class="table-card">
      <div v-if="loading" class="table-loading">
        <VaProgressCircle indeterminate size="small" /> Loading…
      </div>
      <div v-else-if="!posts.length" class="table-empty">
        <VaIcon name="article" size="48px" color="#c5cedc" />
        <p>No posts found.</p>
      </div>
      <VaDataTable
        v-else
        class="posts-table"
        :items="tableRows"
        :columns="tableColumns"
        striped
        hoverable
      >
        <template #cell(title)="{ rowData }">
          <div class="cell-title">
            <img
              v-if="rowData._raw.cover_image"
              :src="resolveMediaUrl(rowData._raw.cover_image)"
              class="row-img"
              :alt="rowData.title"
            />
            <span class="post-title">{{ rowData.title }}</span>
          </div>
        </template>
        <template #cell(post_type)="{ rowData }">
          <span class="type-pill" :class="rowData.post_type">{{
            rowData.post_type
          }}</span>
        </template>
        <template #cell(status)="{ rowData }">
          <span
            class="status-pill"
            :class="{ published: rowData.status === 'Published' }"
            >{{ rowData.status }}</span
          >
        </template>
        <template #cell(actions)="{ rowData }">
          <div class="row-actions">
            <button
              type="button"
              class="row-action"
              title="Edit"
              @click="openEdit(rowData._raw)"
            >
              <VaIcon name="edit" size="18px" />
            </button>
            <button
              type="button"
              class="row-action"
              title="Delete"
              @click="remove(rowData._raw)"
            >
              <VaIcon name="delete" size="18px" />
            </button>
          </div>
        </template>
      </VaDataTable>
    </div>

    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="modal-overlay"
        @click.self="modalOpen = false"
      >
        <div class="modal-card large">
          <div class="modal-head">
            <h2>{{ editingSlug ? "Edit Post" : "New Post" }}</h2>
            <button
              type="button"
              class="modal-close"
              @click="modalOpen = false"
            >
              ✕
            </button>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Post Type</label>
              <select v-model="form.post_type">
                <option value="blog">Blog</option>
                <option value="podcast">Podcast</option>
              </select>
            </div>
            <div class="form-field">
              <label>Order</label>
              <input v-model.number="form.order" type="number" />
            </div>
            <div class="form-field span-2">
              <label>Title</label>
              <input v-model="form.title" type="text" />
            </div>
            <div class="form-field span-2">
              <label>Excerpt</label>
              <textarea v-model="form.excerpt" rows="2" />
            </div>
            <div class="form-field span-2">
              <label>Body (Markdown)</label>
              <textarea v-model="form.body" rows="5" />
            </div>
            <div class="form-field span-2">
              <label>Cover Image</label>
              <img
                v-if="form.cover_image"
                :src="resolveMediaUrl(form.cover_image)"
                class="form-thumb"
                alt="Cover preview"
              />
              <VaFileUpload
                v-model="uploadFiles['cover_image']"
                dropzone
                file-types="image/*"
                upload-button-text="Upload cover image"
                drop-zone-text="Drop cover image here or click to upload"
              />
            </div>
            <div class="form-field span-2">
              <label>Scheduled At</label>
              <input v-model="form.scheduled_at" type="datetime-local" />
            </div>
            <template v-if="showPodcastFields">
              <div class="form-field">
                <label>Episode Number</label>
                <input v-model.number="form.episode_number" type="number" />
              </div>
              <div class="form-field span-2">
                <label>Live Join URL</label>
                <input
                  v-model="form.live_join_url"
                  type="text"
                  placeholder="https://meet.google.com/…"
                />
              </div>
              <div class="form-field span-2">
                <label>Recording URL</label>
                <input
                  v-model="form.recording_url"
                  type="text"
                  placeholder="https://youtube.com/…"
                />
              </div>
            </template>
            <div class="form-field span-2">
              <label class="check-label">
                <input v-model="form.is_published" type="checkbox" />
                Published
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="modalOpen = false">
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? "Saving…" : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.posts-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.page-header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0a1f44;
}
.subtitle {
  margin: 0.15rem 0 0;
  color: #5b6b82;
  font-size: 0.9rem;
}
.header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.refresh-btn,
.new-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  border: 0;
  cursor: pointer;
}
.refresh-btn {
  background: #f2f5f9;
  color: #0a1f44;
}
.new-btn {
  background: #ff6a00;
  color: #fff;
}
.banner {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.banner.err {
  background: #fef3f2;
  color: #b42318;
}
.banner.ok {
  background: #ecfdf3;
  color: #0a7a3d;
}
.filter-bar {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-bar select,
.filter-bar input {
  padding: 0.5rem 0.7rem;
  border: 1px solid #d6deea;
  border-radius: 8px;
  font-size: 0.85rem;
  background: #fff;
}
.filter-bar input {
  flex: 1;
  min-width: 200px;
}
.table-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  overflow: hidden;
}
.table-loading,
.table-empty {
  display: grid;
  place-content: center;
  min-height: 220px;
  text-align: center;
  color: #5b6b82;
  gap: 0.75rem;
}
.cell-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.row-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  background: #f8fafc;
}
.post-title {
  font-weight: 600;
  color: #0a1f44;
}
.type-pill {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #f2f5f9;
  color: #5b6b82;
}
.type-pill.podcast {
  background: #fff7ed;
  color: #9a3412;
}
.type-pill.blog {
  background: #eff6ff;
  color: #1e40af;
}
.status-pill {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: #f2f5f9;
  color: #5b6b82;
}
.status-pill.published {
  background: #ecfdf3;
  color: #0a7a3d;
}
.row-actions {
  display: flex;
  gap: 0.25rem;
}
.row-action {
  background: transparent;
  border: 0;
  color: #8b98a9;
  cursor: pointer;
}
.row-action:hover {
  color: #0a1f44;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6, 18, 44, 0.5);
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.modal-card {
  background: #fff;
  border-radius: 14px;
  width: min(560px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.24);
}
.modal-card.large {
  width: min(720px, 100%);
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #eef1f6;
}
.modal-head h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0a1f44;
}
.modal-close {
  border: 0;
  background: #f2f5f9;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: #5b6b82;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  padding: 1.25rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.form-field.span-2 {
  grid-column: span 2;
}
.form-field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #5b6b82;
}
.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.5rem 0.7rem;
  border: 1px solid #d6deea;
  border-radius: 8px;
  font-size: 0.85rem;
  font-family: inherit;
}
.form-field textarea {
  resize: vertical;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.form-thumb {
  max-width: 120px;
  max-height: 80px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 0.4rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #eef1f6;
}
.btn-ghost {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #d6deea;
  background: #fff;
  color: #5b6b82;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 0;
  background: #ff6a00;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
