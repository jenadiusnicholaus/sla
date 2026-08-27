<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { eventsApi } from "@/api/client";
import type { Event, EventStats } from "@/api/client";

const items = ref<Event[]>([]);
const folder = ref("all");
const query = ref("");
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const statusMsg = ref("");
const detailOpen = ref(false);
const deleteConfirmOpen = ref(false);
const selected = ref<Event | null>(null);
const stats = ref<EventStats | null>(null);

const statusFilters = [
  { id: "all", label: "All", icon: "event" },
  { id: "published", label: "Published", icon: "check_circle" },
  { id: "draft", label: "Draft", icon: "schedule" },
  { id: "cancelled", label: "Cancelled", icon: "cancel" },
];

const isNew = computed(() => selected.value === null);

const editForm = ref({
  title: "",
  description: "",
  location: "",
  start_date: "",
  end_date: "",
  status: "draft" as Event["status"],
  is_featured: false,
  cover_image_url: "",
  max_attendees: "" as string | number,
});

const visible = computed(() => {
  let list = items.value;
  if (folder.value !== "all") {
    list = list.filter((i) => i.status === folder.value);
  }
  const q = query.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    );
  }
  return list;
});

const totalEvents = computed(() => stats.value?.total ?? items.value.length);
const publishedCount = computed(
  () =>
    stats.value?.published ??
    items.value.filter((i) => i.status === "published").length,
);
const upcomingCount = computed(
  () =>
    stats.value?.upcoming ??
    items.value.filter((i) => i.status === "published").length,
);

const tableColumns = [
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "start_date", label: "Start", sortable: true },
  { key: "location", label: "Location", sortable: true },
  { key: "actions", label: "", width: "40px" },
];

const tableRows = computed(() =>
  visible.value.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    start_date: formatListDate(item.start_date),
    location: item.location || "—",
    _raw: item,
  })),
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const [data, statsData] = await Promise.all([
      eventsApi.list("ordering=-start_date"),
      eventsApi.stats(),
    ]);
    items.value = (data as Event[]) || [];
    stats.value = statsData as EventStats;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load events";
  } finally {
    loading.value = false;
  }
}

function openNew() {
  selected.value = null;
  editForm.value = {
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    status: "draft",
    is_featured: false,
    cover_image_url: "",
    max_attendees: "",
  };
  detailOpen.value = true;
  statusMsg.value = "";
}

function openEdit(item: Event) {
  selected.value = item;
  editForm.value = {
    title: item.title,
    description: item.description,
    location: item.location,
    start_date: toDatetimeLocal(item.start_date),
    end_date: item.end_date ? toDatetimeLocal(item.end_date) : "",
    status: item.status,
    is_featured: item.is_featured,
    cover_image_url: item.cover_image_url || "",
    max_attendees: item.max_attendees ?? "",
  };
  detailOpen.value = true;
  statusMsg.value = "";
}

function onRowClick(e: { item: { _raw: Event } }) {
  openEdit(e.item._raw);
}

function closeDetail() {
  detailOpen.value = false;
}

function openDelete(item: Event) {
  selected.value = item;
  deleteConfirmOpen.value = true;
}

async function save() {
  const body: Record<string, unknown> = {
    title: editForm.value.title,
    description: editForm.value.description,
    location: editForm.value.location,
    start_date: new Date(editForm.value.start_date).toISOString(),
    end_date: editForm.value.end_date
      ? new Date(editForm.value.end_date).toISOString()
      : null,
    status: editForm.value.status,
    is_featured: editForm.value.is_featured,
    cover_image_url: editForm.value.cover_image_url,
    max_attendees: editForm.value.max_attendees
      ? Number(editForm.value.max_attendees)
      : null,
  };

  saving.value = true;
  error.value = "";
  try {
    if (selected.value) {
      await eventsApi.update(selected.value.id, body);
      statusMsg.value = "Event updated";
    } else {
      await eventsApi.create(body);
      statusMsg.value = "Event created";
    }
    detailOpen.value = false;
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to save event";
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!selected.value) return;
  saving.value = true;
  try {
    await eventsApi.remove(selected.value.id);
    statusMsg.value = "Event deleted";
    deleteConfirmOpen.value = false;
    detailOpen.value = false;
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to delete event";
  } finally {
    saving.value = false;
  }
}

function selectFolder(id: string) {
  folder.value = id;
}

function toDatetimeLocal(value: string): string {
  const d = new Date(value);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function formatListDate(value: string): string {
  try {
    const d = new Date(value);
    const now = new Date();
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleDateString(
      undefined,
      sameYear
        ? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" },
    );
  } catch {
    return value;
  }
}

watch(folder, () => {
  statusMsg.value = "";
});

onMounted(load);
</script>

<template>
  <main class="events-page">
    <div class="page-header">
      <div>
        <h1>Events</h1>
        <p class="subtitle">Manage upcoming and past events</p>
      </div>
      <div class="header-actions">
        <button type="button" class="refresh-btn" @click="load">
          <VaIcon name="refresh" size="18px" />
          Refresh
        </button>
        <button type="button" class="new-btn" @click="openNew">
          <VaIcon name="add" size="18px" />
          New Event
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">{{ totalEvents }}</span>
        <span class="stat-label">Total Events</span>
      </div>
      <div class="stat-card success">
        <span class="stat-value">{{ publishedCount }}</span>
        <span class="stat-label">Published</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-value">{{ upcomingCount }}</span>
        <span class="stat-label">Upcoming</span>
      </div>
    </div>

    <div class="toolbar-row">
      <div class="filter-tabs">
        <button
          v-for="f in statusFilters"
          :key="f.id"
          type="button"
          class="filter-tab"
          :class="{ active: folder === f.id }"
          @click="selectFolder(f.id)"
        >
          <VaIcon :name="f.icon" size="18px" />
          <span>{{ f.label }}</span>
          <span v-if="f.id !== 'all'" class="tab-count">
            {{ items.filter((i) => i.status === f.id).length }}
          </span>
        </button>
      </div>
      <div class="search-wrap">
        <VaIcon name="search" size="18px" color="#8b98a9" />
        <input v-model="query" type="search" placeholder="Search events…" />
      </div>
    </div>

    <p v-if="error" class="banner err">{{ error }}</p>
    <p v-if="statusMsg" class="banner ok">{{ statusMsg }}</p>

    <div class="table-card">
      <div v-if="loading" class="table-loading">
        <VaProgressCircle indeterminate size="small" />
        Loading…
      </div>
      <div v-else-if="!visible.length" class="table-empty">
        <VaIcon name="event" size="48px" color="#c5cedc" />
        <p>No events found.</p>
      </div>
      <VaDataTable
        v-else
        class="events-table"
        :items="tableRows"
        :columns="tableColumns"
        striped
        hoverable
        @row:click="onRowClick"
      >
        <template #cell(title)="{ rowData }">
          <div class="cell-title">
            <span class="event-title">{{ rowData.title }}</span>
            <span v-if="rowData._raw.is_featured" class="featured-badge"
              >Featured</span
            >
          </div>
        </template>
        <template #cell(status)="{ rowData }">
          <span class="status-tag" :data-status="rowData.status">
            {{ rowData.status }}
          </span>
        </template>
        <template #cell(actions)="{ rowData }">
          <button
            type="button"
            class="row-action"
            aria-label="Delete event"
            @click.stop="openDelete(rowData._raw)"
          >
            <VaIcon name="delete" size="18px" />
          </button>
        </template>
      </VaDataTable>
    </div>

    <Transition name="fade">
      <div v-if="detailOpen" class="modal-overlay" @click.self="closeDetail">
        <div class="modal-card">
          <div class="modal-head">
            <h2>{{ isNew ? "New Event" : "Edit Event" }}</h2>
            <button
              type="button"
              class="modal-close"
              aria-label="Close"
              @click="closeDetail"
            >
              ✕
            </button>
          </div>
          <div class="form-grid">
            <div v-if="editForm.cover_image_url" class="cover-preview span-2">
              <img :src="editForm.cover_image_url" alt="Cover image preview" />
              <span>Cover preview</span>
            </div>
            <div class="form-field">
              <label>Title</label>
              <input
                v-model="editForm.title"
                type="text"
                placeholder="Event title"
              />
            </div>
            <div class="form-field">
              <label>Location</label>
              <input
                v-model="editForm.location"
                type="text"
                placeholder="Event location"
              />
            </div>
            <div class="form-field span-2">
              <label>Description</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                placeholder="Description"
              />
            </div>
            <div class="form-field">
              <label>Start</label>
              <input v-model="editForm.start_date" type="datetime-local" />
            </div>
            <div class="form-field">
              <label>End</label>
              <input v-model="editForm.end_date" type="datetime-local" />
            </div>
            <div class="form-field">
              <label>Status</label>
              <select v-model="editForm.status">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="form-field">
              <label>Max Attendees</label>
              <input
                v-model="editForm.max_attendees"
                type="number"
                min="0"
                placeholder="Unlimited"
              />
            </div>
            <div class="form-field span-2">
              <label>Cover Image URL</label>
              <input
                v-model="editForm.cover_image_url"
                type="text"
                placeholder="https://…"
              />
            </div>
            <div class="form-field">
              <label class="check-label">
                <input v-model="editForm.is_featured" type="checkbox" />
                Featured event
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="btn-ghost"
              :disabled="saving"
              @click="closeDetail"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving"
              @click="save"
            >
              {{ saving ? "Saving…" : isNew ? "Create Event" : "Save Changes" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="deleteConfirmOpen"
        class="modal-overlay"
        @click.self="deleteConfirmOpen = false"
      >
        <div class="modal-card small">
          <div class="modal-head">
            <h2>Delete Event</h2>
          </div>
          <p class="delete-warning">
            Are you sure you want to delete
            <strong>{{ selected?.title }}</strong
            >?
          </p>
          <div class="modal-actions">
            <button
              type="button"
              class="btn-ghost"
              @click="deleteConfirmOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-danger"
              :disabled="saving"
              @click="confirmDelete"
            >
              {{ saving ? "Deleting…" : "Delete" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.events-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
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
  transition: background 0.2s;
}
.refresh-btn {
  background: #f2f5f9;
  color: #0a1f44;
}
.new-btn {
  background: #ff6a00;
  color: #fff;
}
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.stat-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  padding: 1rem;
}
.stat-card.success {
  border-top: 3px solid #10b981;
}
.stat-card.pending {
  border-top: 3px solid #f59e0b;
}
.stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0a1f44;
}
.stat-label {
  font-size: 0.8rem;
  color: #5b6b82;
}
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.8rem;
  border: 1px solid #e6ebf2;
  background: #fff;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #5b6b82;
  cursor: pointer;
}
.filter-tab.active {
  background: #0a1f44;
  color: #fff;
  border-color: #0a1f44;
}
.tab-count {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0 0.4rem;
  font-size: 0.72rem;
}
.search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}
.search-wrap input {
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  min-width: 180px;
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
  flex-wrap: wrap;
}
.event-title {
  font-weight: 600;
  color: #0a1f44;
}
.featured-badge {
  background: #fff7ed;
  color: #9a3412;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
}
.status-tag {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.status-tag[data-status="published"] {
  background: #ecfdf3;
  color: #0a7a3d;
}
.status-tag[data-status="draft"] {
  background: #fff7ed;
  color: #9a3412;
}
.status-tag[data-status="cancelled"] {
  background: #fef3f2;
  color: #b42318;
}
.cover-preview {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cover-preview img {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e6ebf2;
  background: #f7f9fb;
}
.cover-preview span {
  font-size: 0.75rem;
  color: #8b98a9;
}
.row-action {
  background: transparent;
  border: 0;
  color: #8b98a9;
  cursor: pointer;
}
.row-action:hover {
  color: #b42318;
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
.modal-card.small {
  width: min(400px, 100%);
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
  gap: 0.9rem;
  padding: 1.25rem;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.form-field.span-2 {
  grid-column: span 2;
}
.form-field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #5b6b82;
}
.form-field input,
.form-field select,
.form-field textarea {
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  padding: 0.55rem 0.7rem;
  font: inherit;
  outline: none;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #ff6a00;
}
.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #eef1f6;
}
.btn-primary,
.btn-ghost,
.btn-danger {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}
.btn-primary {
  background: #ff6a00;
  color: #fff;
}
.btn-ghost {
  background: #f2f5f9;
  color: #0a1f44;
}
.btn-danger {
  background: #b42318;
  color: #fff;
}
.delete-warning {
  padding: 1.25rem;
  margin: 0;
  color: #5b6b82;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-field.span-2 {
    grid-column: span 1;
  }
  .page-header {
    flex-direction: column;
  }
  .toolbar-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
