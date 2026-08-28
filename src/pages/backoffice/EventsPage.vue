<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  expoEventsApi,
  eventStatsApi,
  focusAreasApi,
  partnersApi,
} from "@/api/events";
import type {
  ExpoEvent,
  EventStat,
  FocusArea,
  Partner,
  DashboardMetrics,
} from "@/api/events";

const loading = ref(false);
const saving = ref(false);
const error = ref("");
const msg = ref("");
const events = ref<ExpoEvent[]>([]);
const view = ref<"list" | "detail">("list");
const eventModalOpen = ref(false);
const subModalOpen = ref(false);
const activeTab = ref<
  | "overview"
  | "stats"
  | "focus"
  | "partners"
  | "villages"
  | "speakers"
  | "sessions"
  | "booths"
  | "registrations"
  | "metrics"
>("overview");
const selected = ref<ExpoEvent | null>(null);
const metrics = ref<DashboardMetrics | null>(null);

const eventForm = ref<Record<string, any>>({
  year: new Date().getFullYear() + 1,
  title: "",
  tagline: "",
  description: "",
  start_date: "",
  end_date: "",
  venue_name: "",
  venue_address: "",
  venue_lat: "",
  venue_lng: "",
  hero_images: "",
  is_active: false,
  is_published: false,
});

const subForm = ref<Record<string, any>>({});
const subKind = ref<"stat" | "focus" | "partner">("stat");
const subEditingId = ref<string | null>(null);

const tableColumns = [
  { key: "year", label: "Year", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "dates", label: "Dates" },
  { key: "venue", label: "Venue" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
];

const tableRows = computed(() =>
  events.value.map((e) => ({
    year: e.year,
    title: e.title,
    dates: formatDate(e.start_date) + " — " + formatDate(e.end_date),
    venue: e.venue_name || "—",
    status: statusPills(e),
    actions: "",
    _raw: e,
  })),
);

function statusPills(e: ExpoEvent) {
  const pills = [];
  if (e.is_published) pills.push("published");
  if (e.is_active) pills.push("active");
  if (!pills.length) pills.push("draft");
  return pills.join(", ");
}

function formatDate(v: string) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toLocal(v: string) {
  if (!v) return "";
  const d = new Date(v);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

function fromLocal(v: string) {
  if (!v) return null;
  return new Date(v).toISOString();
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await expoEventsApi.list();
    events.value = res?.results || [];
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load events";
  } finally {
    loading.value = false;
  }
}

function openNew() {
  selected.value = null;
  eventForm.value = {
    year: new Date().getFullYear() + 1,
    title: "",
    tagline: "",
    description: "",
    start_date: "",
    end_date: "",
    venue_name: "",
    venue_address: "",
    venue_lat: "",
    venue_lng: "",
    hero_images: "",
    is_active: false,
    is_published: false,
  };
  eventModalOpen.value = true;
  msg.value = "";
}

function openEdit(e: ExpoEvent) {
  selected.value = e;
  eventForm.value = {
    year: e.year,
    title: e.title,
    tagline: e.tagline,
    description: e.description,
    start_date: toLocal(e.start_date),
    end_date: toLocal(e.end_date),
    venue_name: e.venue_name,
    venue_address: e.venue_address,
    venue_lat: e.venue_lat ?? "",
    venue_lng: e.venue_lng ?? "",
    hero_images: (e.hero_images || []).join("\n"),
    is_active: e.is_active,
    is_published: e.is_published,
  };
  eventModalOpen.value = true;
  msg.value = "";
}

async function openDetail(e: ExpoEvent) {
  selected.value = e;
  view.value = "detail";
  activeTab.value = "overview";
  await loadDetail(e.year);
}

function backToList() {
  view.value = "list";
  selected.value = null;
  activeTab.value = "overview";
  metrics.value = null;
}

function onRowClick(e: { item: { _raw: ExpoEvent } }) {
  openDetail(e.item._raw);
}

async function loadDetail(year: number) {
  try {
    const e = await expoEventsApi.get(year);
    selected.value = e;
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load event";
  }
}

async function loadMetrics(year: number) {
  try {
    const res = await expoEventsApi.metrics(year);
    metrics.value = res?.metrics || null;
  } catch {
    metrics.value = null;
  }
}

watch(activeTab, (tab) => {
  if (!selected.value) return;
  if (tab === "metrics") loadMetrics(selected.value.year);
});

function buildEventBody(): Record<string, unknown> {
  const b = { ...eventForm.value };
  b.start_date = fromLocal(b.start_date as string);
  b.end_date = fromLocal(b.end_date as string);
  b.venue_lat = b.venue_lat ? parseFloat(b.venue_lat as string) : null;
  b.venue_lng = b.venue_lng ? parseFloat(b.venue_lng as string) : null;
  b.hero_images = (b.hero_images as string)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return b;
}

async function saveEvent() {
  const body = buildEventBody();
  saving.value = true;
  error.value = "";
  try {
    if (selected.value) {
      await expoEventsApi.update(selected.value.year, body);
      msg.value = "Event updated";
    } else {
      await expoEventsApi.create(body);
      msg.value = "Event created";
    }
    eventModalOpen.value = false;
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to save event";
  } finally {
    saving.value = false;
  }
}

async function removeEvent(e: ExpoEvent) {
  if (!confirm(`Delete ${e.title}?`)) return;
  try {
    await expoEventsApi.remove(e.year);
    msg.value = "Event deleted";
    await load();
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to delete event";
  }
}

async function publish(e: ExpoEvent) {
  try {
    await expoEventsApi.publish(e.year);
    msg.value = "Event published";
    await load();
    if (selected.value?.year === e.year) await loadDetail(e.year);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to publish";
  }
}

async function unpublish(e: ExpoEvent) {
  try {
    await expoEventsApi.unpublish(e.year);
    msg.value = "Event unpublished";
    await load();
    if (selected.value?.year === e.year) await loadDetail(e.year);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to unpublish";
  }
}

async function activate(e: ExpoEvent) {
  try {
    await expoEventsApi.activate(e.year);
    msg.value = "Event activated";
    await load();
    if (selected.value?.year === e.year) await loadDetail(e.year);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to activate";
  }
}

const tabItems = {
  overview: "Overview",
  stats: "Stats",
  focus: "Focus Areas",
  partners: "Partners",
  villages: "Villages",
  speakers: "Speakers",
  sessions: "Sessions",
  booths: "Booth Apps",
  registrations: "Registrations",
  metrics: "Metrics",
};

const subLabels: Record<typeof subKind.value, string> = {
  stat: "Stat",
  focus: "Focus Area",
  partner: "Partner",
};

function openSub(kind: "stat" | "focus" | "partner", item?: unknown) {
  subKind.value = kind;
  subEditingId.value = null;
  if (kind === "stat") {
    subForm.value = {
      event: selected.value?.id,
      label: "",
      value: "",
      order: 1,
    };
    if (item) {
      const s = item as EventStat;
      subEditingId.value = s.id;
      subForm.value = { ...s };
    }
  } else if (kind === "focus") {
    subForm.value = {
      event: selected.value?.id,
      num: "01",
      title: "",
      description: "",
      accent_color: "#F97316",
      badge_color: "#EA580C",
      image_url: "",
      order: 1,
    };
    if (item) {
      const f = item as FocusArea;
      subEditingId.value = f.id;
      subForm.value = { ...f };
    }
  } else {
    subForm.value = {
      event: selected.value?.id,
      name: "",
      logo_url: "",
      tier: "HOST",
      website_url: "",
      order: 1,
    };
    if (item) {
      const p = item as Partner;
      subEditingId.value = p.id;
      subForm.value = { ...p };
    }
  }
  subModalOpen.value = true;
  msg.value = "";
}

async function saveSub() {
  if (!selected.value) return;
  saving.value = true;
  error.value = "";
  try {
    const body = { ...subForm.value };
    if (subKind.value === "stat") {
      if (subEditingId.value) {
        await eventStatsApi.update(subEditingId.value, body);
      } else {
        await eventStatsApi.create(body);
      }
    } else if (subKind.value === "focus") {
      if (subEditingId.value) {
        await focusAreasApi.update(subEditingId.value, body);
      } else {
        await focusAreasApi.create(body);
      }
    } else {
      if (subEditingId.value) {
        await partnersApi.update(subEditingId.value, body);
      } else {
        await partnersApi.create(body);
      }
    }
    subModalOpen.value = false;
    msg.value = subEditingId.value ? "Updated" : "Created";
    await loadDetail(selected.value.year);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to save";
  } finally {
    saving.value = false;
  }
}

async function removeSub(kind: "stat" | "focus" | "partner", id: string) {
  if (!selected.value) return;
  if (!confirm("Delete this item?")) return;
  try {
    if (kind === "stat") await eventStatsApi.remove(id);
    else if (kind === "focus") await focusAreasApi.remove(id);
    else await partnersApi.remove(id);
    msg.value = "Deleted";
    await loadDetail(selected.value.year);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to delete";
  }
}

onMounted(load);
</script>

<template>
  <main class="events-page">
    <div v-if="view === 'list'">
      <div class="page-header">
        <div>
          <h1>Expo Events</h1>
          <p class="subtitle">Manage expo events and related data</p>
        </div>
        <div class="header-actions">
          <button type="button" class="refresh-btn" @click="load">
            <VaIcon name="refresh" size="18px" /> Refresh
          </button>
          <button type="button" class="new-btn" @click="openNew">
            <VaIcon name="add" size="18px" /> New Event
          </button>
        </div>
      </div>

      <p v-if="error" class="banner err">{{ error }}</p>
      <p v-if="msg" class="banner ok">{{ msg }}</p>

      <div class="table-card">
        <div v-if="loading" class="table-loading">
          <VaProgressCircle indeterminate size="small" /> Loading…
        </div>
        <div v-else-if="!events.length" class="table-empty">
          <VaIcon name="event" size="48px" color="#c5cedc" />
          <p>No expo events found.</p>
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
            </div>
          </template>
          <template #cell(status)="{ rowData }">
            <span
              class="status-pill"
              :class="{
                active: rowData._raw.is_active,
                published: rowData._raw.is_published,
              }"
            >
              {{ rowData.status }}
            </span>
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="row-actions">
              <button
                type="button"
                class="row-action"
                title="Edit"
                @click.stop="openEdit(rowData._raw)"
              >
                <VaIcon name="edit" size="18px" />
              </button>
              <button
                type="button"
                class="row-action"
                title="Publish"
                @click.stop="publish(rowData._raw)"
              >
                <VaIcon name="publish" size="18px" />
              </button>
              <button
                type="button"
                class="row-action"
                title="Unpublish"
                @click.stop="unpublish(rowData._raw)"
              >
                <VaIcon name="unpublished" size="18px" />
              </button>
              <button
                type="button"
                class="row-action"
                title="Activate"
                @click.stop="activate(rowData._raw)"
              >
                <VaIcon name="bolt" size="18px" />
              </button>
              <button
                type="button"
                class="row-action"
                title="Delete"
                @click.stop="removeEvent(rowData._raw)"
              >
                <VaIcon name="delete" size="18px" />
              </button>
            </div>
          </template>
        </VaDataTable>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="eventModalOpen"
        class="modal-overlay"
        @click.self="eventModalOpen = false"
      >
        <div class="modal-card large">
          <div class="modal-head">
            <h2>{{ selected ? "Edit Event" : "New Event" }}</h2>
            <button
              type="button"
              class="modal-close"
              @click="eventModalOpen = false"
            >
              ✕
            </button>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Year</label
              ><input v-model.number="eventForm.year" type="number" />
            </div>
            <div class="form-field">
              <label>Title</label
              ><input v-model="eventForm.title" type="text" />
            </div>
            <div class="form-field span-2">
              <label>Tagline</label
              ><input v-model="eventForm.tagline" type="text" />
            </div>
            <div class="form-field span-2">
              <label>Description</label
              ><textarea v-model="eventForm.description" rows="3" />
            </div>
            <div class="form-field">
              <label>Start</label
              ><input v-model="eventForm.start_date" type="datetime-local" />
            </div>
            <div class="form-field">
              <label>End</label
              ><input v-model="eventForm.end_date" type="datetime-local" />
            </div>
            <div class="form-field">
              <label>Venue Name</label
              ><input v-model="eventForm.venue_name" type="text" />
            </div>
            <div class="form-field">
              <label>Venue Address</label
              ><input v-model="eventForm.venue_address" type="text" />
            </div>
            <div class="form-field">
              <label>Venue Lat</label
              ><input v-model="eventForm.venue_lat" type="number" step="any" />
            </div>
            <div class="form-field">
              <label>Venue Lng</label
              ><input v-model="eventForm.venue_lng" type="number" step="any" />
            </div>
            <div class="form-field span-2">
              <label>Hero Images (one per line)</label
              ><textarea v-model="eventForm.hero_images" rows="3" />
            </div>
            <div class="form-field span-2">
              <label class="check-label"
                ><input v-model="eventForm.is_active" type="checkbox" />
                Active</label
              >
              <label class="check-label"
                ><input v-model="eventForm.is_published" type="checkbox" />
                Published</label
              >
            </div>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="btn-ghost"
              @click="eventModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving"
              @click="saveEvent"
            >
              {{ saving ? "Saving…" : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="view === 'detail'" class="detail-view">
      <div class="modal-card xlarge detail-card">
        <div class="modal-head">
          <h2>{{ selected?.title }} ({{ selected?.year }})</h2>
          <button type="button" class="modal-close" @click="backToList">
            ✕
          </button>
        </div>
        <div class="tabs">
          <button
            v-for="(label, key) in tabItems"
            :key="key"
            type="button"
            class="tab"
            :class="{ active: activeTab === key }"
            @click="activeTab = key as any"
          >
            {{ label }}
          </button>
        </div>

        <div v-if="activeTab === 'overview'" class="tab-body">
          <dl class="detail-list">
            <dt>Title</dt>
            <dd>{{ selected?.title }}</dd>
            <dt>Tagline</dt>
            <dd>{{ selected?.tagline }}</dd>
            <dt>Description</dt>
            <dd>{{ selected?.description }}</dd>
            <dt>Dates</dt>
            <dd>
              {{ formatDate(selected?.start_date || "") }} —
              {{ formatDate(selected?.end_date || "") }}
            </dd>
            <dt>Venue</dt>
            <dd>{{ selected?.venue_name }}, {{ selected?.venue_address }}</dd>
            <dt>Active</dt>
            <dd>{{ selected?.is_active }}</dd>
            <dt>Published</dt>
            <dd>{{ selected?.is_published }}</dd>
          </dl>
        </div>

        <div v-else-if="activeTab === 'stats'" class="tab-body">
          <div class="tab-toolbar">
            <button type="button" class="new-btn" @click="openSub('stat')">
              Add Stat
            </button>
          </div>
          <VaDataTable
            :items="selected?.stats || []"
            :columns="[
              { key: 'label', label: 'Label' },
              { key: 'value', label: 'Value' },
              { key: 'order', label: 'Order' },
              { key: 'actions', label: '' },
            ]"
            hoverable
          >
            <template #cell(actions)="{ rowData }">
              <button class="row-action" @click="openSub('stat', rowData)">
                <VaIcon name="edit" size="18px" />
              </button>
              <button class="row-action" @click="removeSub('stat', rowData.id)">
                <VaIcon name="delete" size="18px" />
              </button>
            </template>
          </VaDataTable>
        </div>

        <div v-else-if="activeTab === 'focus'" class="tab-body">
          <div class="tab-toolbar">
            <button type="button" class="new-btn" @click="openSub('focus')">
              Add Focus Area
            </button>
          </div>
          <div class="focus-grid">
            <div
              v-for="f in selected?.focus_areas"
              :key="f.id"
              class="focus-card"
            >
              <img v-if="f.image_url" :src="f.image_url" :alt="f.title" />
              <div class="focus-meta">
                <span class="focus-num">{{ f.num }}</span>
                <h4>{{ f.title }}</h4>
                <p>{{ f.description }}</p>
                <div class="focus-actions">
                  <button class="row-action" @click="openSub('focus', f)">
                    <VaIcon name="edit" size="18px" />
                  </button>
                  <button class="row-action" @click="removeSub('focus', f.id)">
                    <VaIcon name="delete" size="18px" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'partners'" class="tab-body">
          <div class="tab-toolbar">
            <button type="button" class="new-btn" @click="openSub('partner')">
              Add Partner
            </button>
          </div>
          <VaDataTable
            :items="selected?.partners || []"
            :columns="[
              { key: 'name', label: 'Name' },
              { key: 'tier', label: 'Tier' },
              { key: 'website_url', label: 'Website' },
              { key: 'order', label: 'Order' },
              { key: 'actions', label: '' },
            ]"
            hoverable
          >
            <template #cell(actions)="{ rowData }">
              <button class="row-action" @click="openSub('partner', rowData)">
                <VaIcon name="edit" size="18px" />
              </button>
              <button
                class="row-action"
                @click="removeSub('partner', rowData.id)"
              >
                <VaIcon name="delete" size="18px" />
              </button>
            </template>
          </VaDataTable>
        </div>

        <div v-else-if="activeTab === 'villages'" class="tab-body">
          <VaDataTable
            :items="selected?.villages || []"
            :columns="[
              { key: 'name', label: 'Name' },
              { key: 'hall', label: 'Hall' },
              { key: 'booths_count', label: 'Booths' },
              { key: 'demos_count', label: 'Demos' },
              { key: 'order', label: 'Order' },
            ]"
            hoverable
          />
        </div>

        <div v-else-if="activeTab === 'speakers'" class="tab-body">
          <VaDataTable
            :items="selected?.speakers || []"
            :columns="[
              { key: 'name', label: 'Name' },
              { key: 'title', label: 'Title' },
              { key: 'org', label: 'Org' },
              { key: 'is_confirmed', label: 'Confirmed' },
              { key: 'order', label: 'Order' },
            ]"
            hoverable
          />
        </div>

        <div v-else-if="activeTab === 'sessions'" class="tab-body">
          <VaDataTable
            :items="selected?.sessions || []"
            :columns="[
              { key: 'title', label: 'Title' },
              { key: 'type', label: 'Type' },
              { key: 'start_time', label: 'Start' },
              { key: 'end_time', label: 'End' },
              { key: 'location', label: 'Location' },
              { key: 'speaker', label: 'Speaker' },
              { key: 'order', label: 'Order' },
            ]"
            hoverable
          >
            <template #cell(speaker)="{ rowData }">
              {{ rowData.speaker ? rowData.speaker.name : "-" }}
            </template>
          </VaDataTable>
        </div>

        <div v-else-if="activeTab === 'booths'" class="tab-body">
          <VaDataTable
            :items="selected?.booth_applications || []"
            :columns="[
              { key: 'reference_no', label: 'Ref' },
              { key: 'company_name', label: 'Company' },
              { key: 'booth_package', label: 'Package' },
              { key: 'status', label: 'Status' },
              { key: 'assigned_booth_no', label: 'Booth No' },
            ]"
            hoverable
          />
        </div>

        <div v-else-if="activeTab === 'registrations'" class="tab-body">
          <VaDataTable
            :items="selected?.registrations || []"
            :columns="[
              { key: 'reference_no', label: 'Ref' },
              { key: 'first_name', label: 'First' },
              { key: 'last_name', label: 'Last' },
              { key: 'type', label: 'Type' },
              { key: 'status', label: 'Status' },
              { key: 'badge_code', label: 'Badge' },
            ]"
            hoverable
          />
        </div>

        <div v-else-if="activeTab === 'metrics'" class="tab-body">
          <div v-if="!metrics" class="table-empty">No metrics loaded.</div>
          <div v-else class="metrics-grid">
            <div class="stat-card">
              <span class="stat-value">{{ metrics.totalRegistrations }}</span
              ><span class="stat-label">Total Registrations</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ metrics.breakdown.guests }}</span
              ><span class="stat-label">Guests</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ metrics.breakdown.booths }}</span
              ><span class="stat-label">Booths</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ metrics.breakdown.speakers }}</span
              ><span class="stat-label">Speakers</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ metrics.breakdown.volunteers }}</span
              ><span class="stat-label">Volunteers</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{
                metrics.pendingBoothApplications
              }}</span
              ><span class="stat-label">Pending Booth Apps</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="subModalOpen"
        class="modal-overlay"
        @click.self="subModalOpen = false"
      >
        <div class="modal-card">
          <div class="modal-head">
            <h2>
              {{ subEditingId ? "Edit" : "Add" }} {{ subLabels[subKind] }}
            </h2>
            <button
              type="button"
              class="modal-close"
              @click="subModalOpen = false"
            >
              ✕
            </button>
          </div>
          <div class="form-grid">
            <template v-if="subKind === 'stat'">
              <div class="form-field span-2">
                <label>Label</label
                ><input v-model="subForm.label" type="text" />
              </div>
              <div class="form-field span-2">
                <label>Value</label
                ><input v-model="subForm.value" type="text" />
              </div>
              <div class="form-field">
                <label>Order</label
                ><input v-model.number="subForm.order" type="number" />
              </div>
            </template>
            <template v-else-if="subKind === 'focus'">
              <div class="form-field">
                <label>Num</label><input v-model="subForm.num" type="text" />
              </div>
              <div class="form-field span-2">
                <label>Title</label
                ><input v-model="subForm.title" type="text" />
              </div>
              <div class="form-field span-2">
                <label>Description</label
                ><textarea v-model="subForm.description" rows="3" />
              </div>
              <div class="form-field">
                <label>Accent Color</label
                ><input v-model="subForm.accent_color" type="color" />
              </div>
              <div class="form-field">
                <label>Badge Color</label
                ><input v-model="subForm.badge_color" type="color" />
              </div>
              <div class="form-field span-2">
                <label>Image URL</label
                ><input v-model="subForm.image_url" type="text" />
              </div>
              <div class="form-field">
                <label>Order</label
                ><input v-model.number="subForm.order" type="number" />
              </div>
            </template>
            <template v-else>
              <div class="form-field span-2">
                <label>Name</label><input v-model="subForm.name" type="text" />
              </div>
              <div class="form-field span-2">
                <label>Logo URL</label
                ><input v-model="subForm.logo_url" type="text" />
              </div>
              <div class="form-field">
                <label>Tier</label>
                <select v-model="subForm.tier">
                  <option value="HOST">HOST</option>
                  <option value="LEAD_PARTNER">LEAD_PARTNER</option>
                  <option value="PARTNER">PARTNER</option>
                  <option value="MEDIA">MEDIA</option>
                </select>
              </div>
              <div class="form-field">
                <label>Website URL</label
                ><input v-model="subForm.website_url" type="text" />
              </div>
              <div class="form-field">
                <label>Order</label
                ><input v-model.number="subForm.order" type="number" />
              </div>
            </template>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="btn-ghost"
              @click="subModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving"
              @click="saveSub"
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
.events-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
.event-title {
  font-weight: 600;
  color: #0a1f44;
}
.status-pill {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  background: #f2f5f9;
  color: #5b6b82;
}
.status-pill.published {
  background: #ecfdf3;
  color: #0a7a3d;
}
.status-pill.active {
  background: #fff7ed;
  color: #9a3412;
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
.modal-card.xlarge {
  width: min(960px, 100%);
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #eef1f6;
}
.btn-primary,
.btn-ghost {
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
.tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem 0;
  border-bottom: 1px solid #eef1f6;
  overflow-x: auto;
}
.tab {
  background: transparent;
  border: 0;
  padding: 0.6rem 1rem;
  font-weight: 600;
  color: #5b6b82;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.tab.active {
  color: #0a1f44;
  border-bottom-color: #ff6a00;
}
.tab-body {
  padding: 1.25rem;
}
.tab-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}
.detail-list {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.5rem 1rem;
}
.detail-list dt {
  color: #5b6b82;
  font-weight: 600;
}
.detail-list dd {
  margin: 0;
  color: #0a1f44;
}
.focus-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
.focus-card {
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  overflow: hidden;
}
.focus-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}
.focus-meta {
  padding: 0.75rem;
}
.focus-num {
  color: #ff6a00;
  font-weight: 700;
  font-size: 0.85rem;
}
.focus-meta h4 {
  margin: 0.25rem 0;
  color: #0a1f44;
}
.focus-meta p {
  margin: 0;
  font-size: 0.8rem;
  color: #5b6b82;
}
.focus-actions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}
.stat-card {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-top: 3px solid #ff6a00;
  border-radius: 12px;
  padding: 1rem;
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
}
.detail-view {
  background: #fff;
  border: 1px solid #e6ebf2;
  border-radius: 12px;
  overflow: hidden;
}
.detail-card {
  width: 100%;
  max-height: none;
  box-shadow: none;
  border-radius: 0;
}
</style>
