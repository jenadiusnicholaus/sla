<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { cmsApi } from '@/api/client'

const items = ref([])
const folder = ref('pending')
const query = ref('')
const error = ref('')
const statusMsg = ref('')
const loading = ref(true)
const saving = ref(false)
const selected = ref(null)
const notes = ref('')
const mobileShowReading = ref(false)

const folders = computed(() => [
  {
    id: 'pending',
    label: 'Pending',
    icon: 'schedule',
    count: items.value.filter((i) => i.status === 'pending').length,
  },
  {
    id: 'confirmed',
    label: 'Confirmed',
    icon: 'check_circle',
    count: items.value.filter((i) => i.status === 'confirmed').length,
  },
  {
    id: 'declined',
    label: 'Declined',
    icon: 'cancel',
    count: items.value.filter((i) => i.status === 'declined').length,
  },
  {
    id: 'all',
    label: 'All requests',
    icon: 'event',
    count: items.value.length,
  },
])

const visible = computed(() => {
  let list = items.value
  if (folder.value !== 'all') {
    list = list.filter((i) => i.status === folder.value)
  }
  const q = query.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.official_name?.toLowerCase().includes(q) ||
        i.topic?.toLowerCase().includes(q) ||
        i.organization?.toLowerCase().includes(q) ||
        i.message?.toLowerCase().includes(q),
    )
  }
  return list
})

const pendingCount = computed(() => items.value.filter((i) => i.status === 'pending').length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await cmsApi.meetingRequests()
    items.value = data.results || data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function formatListDate(value) {
  try {
    const d = new Date(value)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    }
    const sameYear = d.getFullYear() === now.getFullYear()
    return d.toLocaleDateString(undefined, sameYear
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return value
  }
}

function formatWhen(value) {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'full',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

function initials(name) {
  return String(name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('')
}

function statusLabel(status) {
  return status || 'pending'
}

function selectFolder(id) {
  folder.value = id
  selected.value = null
  mobileShowReading.value = false
  statusMsg.value = ''
}

function openDetail(item) {
  selected.value = item
  notes.value = item.admin_notes || ''
  mobileShowReading.value = true
  statusMsg.value = ''
}

function backToList() {
  mobileShowReading.value = false
}

async function setStatus(status) {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  statusMsg.value = ''
  try {
    const updated = await cmsApi.updateMeetingRequest(selected.value.id, {
      status,
      admin_notes: notes.value,
    })
    const idx = items.value.findIndex((i) => i.id === updated.id)
    if (idx >= 0) items.value[idx] = updated
    selected.value = updated
    statusMsg.value = `Marked as ${status}`
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

watch(folder, () => {
  if (selected.value && !visible.value.find((i) => i.id === selected.value.id)) {
    selected.value = null
    mobileShowReading.value = false
  }
})

onMounted(load)
</script>

<template>
  <div class="gmail" :class="{ reading: mobileShowReading && selected }">
    <aside class="mail-nav">
      <button type="button" class="compose-btn" @click="load">
        <VaIcon name="refresh" size="18px" />
        Refresh
      </button>
      <nav>
        <button
          v-for="f in folders"
          :key="f.id"
          type="button"
          class="nav-item"
          :class="{ active: folder === f.id }"
          @click="selectFolder(f.id)"
        >
          <VaIcon :name="f.icon" size="20px" />
          <span class="nav-label">{{ f.label }}</span>
          <span v-if="f.count" class="nav-count">{{ f.count }}</span>
        </button>
      </nav>
    </aside>

    <section class="mail-list-pane">
      <div class="list-toolbar">
        <div class="search">
          <VaIcon name="search" size="20px" color="#5b6b82" />
          <input
            v-model="query"
            type="search"
            placeholder="Search requests"
            aria-label="Search meeting requests"
          />
        </div>
        <div class="toolbar-meta">
          <span v-if="pendingCount" class="unread-pill">{{ pendingCount }} pending</span>
          <button type="button" class="icon-btn" aria-label="Refresh" @click="load">
            <VaIcon name="refresh" size="18px" />
          </button>
        </div>
      </div>

      <p v-if="error" class="banner error">{{ error }}</p>
      <p v-if="statusMsg" class="banner ok">{{ statusMsg }}</p>

      <div v-if="loading" class="empty-state">
        <VaProgressCircle indeterminate size="small" />
        Loading…
      </div>

      <div v-else-if="!visible.length" class="empty-state">
        <VaIcon name="event_busy" size="48px" color="#c5cedc" />
        <p>No requests in {{ folders.find((f) => f.id === folder)?.label || 'this folder' }}.</p>
      </div>

      <div v-else class="mail-rows" role="listbox">
        <button
          v-for="item in visible"
          :key="item.id"
          type="button"
          class="mail-row"
          role="option"
          :class="{
            active: selected?.id === item.id,
            unread: item.status === 'pending',
          }"
          @click="openDetail(item)"
        >
          <span class="avatar" aria-hidden="true">{{ initials(item.name) }}</span>
          <span class="row-main">
            <span class="row-top">
              <span class="sender">{{ item.name }}</span>
              <span class="when">{{ formatListDate(item.preferred_at || item.created_at) }}</span>
            </span>
            <span class="subject">
              Meeting with {{ item.official_name || 'official' }}
              <span class="status-dot" :data-status="item.status">{{ statusLabel(item.status) }}</span>
            </span>
            <span class="snippet">
              {{ item.topic || item.message || item.email }}
            </span>
          </span>
        </button>
      </div>
    </section>

    <section class="reading-pane">
      <div v-if="!selected" class="empty-reading">
        <VaIcon name="event" size="56px" color="#d0d7e2" />
        <p>Select a request to review</p>
      </div>

      <template v-else>
        <header class="reading-top">
          <button type="button" class="back-btn" @click="backToList">
            <VaIcon name="arrow_back" size="20px" />
          </button>
          <h2>{{ selected.topic || `Meeting with ${selected.official_name}` }}</h2>
          <span class="status-chip" :data-status="selected.status">{{ selected.status }}</span>
        </header>

        <div class="thread">
          <article class="bubble">
            <div class="bubble-head">
              <span class="avatar lg">{{ initials(selected.name) }}</span>
              <div class="who">
                <strong>{{ selected.name }}</strong>
                <span>&lt;{{ selected.email }}&gt;</span>
              </div>
              <time>{{ formatWhen(selected.created_at) }}</time>
            </div>

            <div class="meta-grid">
              <div>
                <span class="meta-label">Official</span>
                <p>{{ selected.official_name }} · {{ selected.official_role }}</p>
              </div>
              <div>
                <span class="meta-label">Preferred time</span>
                <p>{{ formatWhen(selected.preferred_at) }}</p>
              </div>
              <div v-if="selected.phone">
                <span class="meta-label">Phone</span>
                <p>{{ selected.phone }}</p>
              </div>
              <div v-if="selected.organization">
                <span class="meta-label">Organization</span>
                <p>{{ selected.organization }}</p>
              </div>
            </div>

            <div v-if="selected.message" class="bubble-body">{{ selected.message }}</div>
          </article>
        </div>

        <div class="composer">
          <div class="composer-head">
            <span>Admin notes</span>
          </div>
          <textarea
            v-model="notes"
            rows="4"
            placeholder="Internal notes for this request…"
          />
          <div class="composer-foot">
            <button
              type="button"
              class="send-btn confirm"
              :disabled="saving"
              @click="setStatus('confirmed')"
            >
              Confirm
            </button>
            <button
              type="button"
              class="send-btn decline"
              :disabled="saving"
              @click="setStatus('declined')"
            >
              Decline
            </button>
            <button
              type="button"
              class="ghost-btn"
              :disabled="saving"
              @click="setStatus('pending')"
            >
              Mark pending
            </button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.gmail {
  --mail-border: #e6ebf2;
  --mail-muted: #5b6b82;
  --mail-navy: #0a1f44;
  --mail-orange: #ff6a00;
  --mail-green: #0a7a3d;
  --mail-hover: #f6f8fb;
  --mail-active: #eef3fa;

  display: grid;
  grid-template-columns: 200px minmax(280px, 380px) 1fr;
  min-height: calc(100vh - 7.5rem);
  background: #fff;
  border: 1px solid var(--mail-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(10, 31, 68, 0.06);
}

.mail-nav {
  background: #f7f9fc;
  border-right: 1px solid var(--mail-border);
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.compose-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 0;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: #fff;
  color: var(--mail-navy);
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(10, 31, 68, 0.12), 0 4px 12px rgba(10, 31, 68, 0.06);
}
.compose-btn:hover {
  color: var(--mail-orange);
}
.mail-nav nav { display: grid; gap: 0.15rem; }
.nav-item {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
  gap: 0.65rem;
  border: 0;
  background: transparent;
  color: var(--mail-navy);
  font: inherit;
  font-size: 0.92rem;
  padding: 0.55rem 0.85rem;
  border-radius: 0 999px 999px 0;
  margin-right: 0.35rem;
  cursor: pointer;
  text-align: left;
}
.nav-item:hover { background: rgba(10, 31, 68, 0.06); }
.nav-item.active {
  background: rgba(255, 106, 0, 0.14);
  color: var(--mail-orange);
  font-weight: 700;
}
.nav-count {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--mail-muted);
}
.nav-item.active .nav-count { color: var(--mail-orange); }

.mail-list-pane {
  border-right: 1px solid var(--mail-border);
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.list-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--mail-border);
}
.search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f4f8;
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
}
.search input {
  border: 0;
  background: transparent;
  width: 100%;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.toolbar-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.unread-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--mail-orange);
  background: rgba(255, 106, 0, 0.12);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  white-space: nowrap;
}
.icon-btn {
  border: 0;
  background: transparent;
  color: var(--mail-muted);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.icon-btn:hover {
  background: var(--mail-hover);
  color: var(--mail-navy);
}

.banner {
  margin: 0;
  padding: 0.55rem 0.9rem;
  font-size: 0.85rem;
}
.banner.error { background: #fef3f2; color: #b42318; }
.banner.ok { background: #ecfdf3; color: var(--mail-green); }

.empty-state {
  flex: 1;
  display: grid;
  place-content: center;
  gap: 0.5rem;
  justify-items: center;
  color: var(--mail-muted);
  padding: 2rem;
  text-align: center;
}
.empty-state p { margin: 0; }

.mail-rows { overflow-y: auto; flex: 1; }
.mail-row {
  width: 100%;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 0.65rem;
  align-items: start;
  border: 0;
  border-bottom: 1px solid var(--mail-border);
  background: #fff;
  padding: 0.75rem 0.85rem;
  cursor: pointer;
  font: inherit;
  text-align: left;
  color: var(--mail-muted);
}
.mail-row:hover {
  background: var(--mail-hover);
  box-shadow: inset 3px 0 0 var(--mail-orange);
}
.mail-row.active {
  background: var(--mail-active);
  box-shadow: inset 3px 0 0 var(--mail-navy);
}
.mail-row.unread .sender,
.mail-row.unread .subject {
  color: var(--mail-navy);
  font-weight: 700;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #163566, var(--mail-navy));
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  font-weight: 700;
}
.avatar.lg {
  width: 42px;
  height: 42px;
  font-size: 0.85rem;
}
.row-main {
  min-width: 0;
  display: grid;
  gap: 0.12rem;
}
.row-top {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.sender {
  color: var(--mail-navy);
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.when {
  font-size: 0.75rem;
  color: var(--mail-muted);
  flex-shrink: 0;
  font-weight: 600;
}
.mail-row.unread .when { color: var(--mail-orange); }
.subject {
  font-size: 0.86rem;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  overflow: hidden;
}
.status-dot {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 700;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  flex-shrink: 0;
  background: #eef2f7;
  color: var(--mail-muted);
}
.status-dot[data-status='pending'],
.status-chip[data-status='pending'] {
  background: rgba(255, 106, 0, 0.14);
  color: var(--mail-orange);
}
.status-dot[data-status='confirmed'],
.status-chip[data-status='confirmed'] {
  background: rgba(10, 122, 61, 0.12);
  color: var(--mail-green);
}
.status-dot[data-status='declined'],
.status-chip[data-status='declined'] {
  background: rgba(180, 35, 24, 0.1);
  color: #b42318;
}
.snippet {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reading-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #fff;
}
.empty-reading {
  flex: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.65rem;
  color: var(--mail-muted);
}
.empty-reading p { margin: 0; }
.reading-top {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--mail-border);
}
.reading-top h2 {
  margin: 0;
  flex: 1;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--mail-navy);
  line-height: 1.3;
}
.status-chip {
  text-transform: capitalize;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
}
.back-btn {
  display: none;
  border: 0;
  background: transparent;
  color: var(--mail-navy);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  place-items: center;
  cursor: pointer;
}
.back-btn:hover { background: var(--mail-hover); }

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}
.bubble-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  margin-bottom: 1rem;
}
.who { display: grid; gap: 0.1rem; min-width: 0; }
.who strong { color: var(--mail-navy); font-size: 0.95rem; }
.who span {
  color: var(--mail-muted);
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bubble-head time {
  font-size: 0.78rem;
  color: var(--mail-muted);
  white-space: nowrap;
}
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  margin-bottom: 1rem;
  padding-left: calc(42px + 0.75rem);
}
.meta-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mail-muted);
  font-weight: 700;
  margin-bottom: 0.2rem;
}
.meta-grid p {
  margin: 0;
  color: var(--mail-navy);
  font-size: 0.92rem;
}
.bubble-body {
  color: var(--mail-navy);
  line-height: 1.65;
  white-space: pre-wrap;
  font-size: 0.95rem;
  padding-left: calc(42px + 0.75rem);
}

.composer {
  margin: 0 1.25rem 1.25rem;
  border: 1px solid var(--mail-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(10, 31, 68, 0.08);
  overflow: hidden;
  display: grid;
}
.composer-head {
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--mail-border);
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--mail-navy);
}
.composer textarea {
  border: 0;
  resize: vertical;
  min-height: 88px;
  padding: 0.85rem;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.composer-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: #fafbfd;
  border-top: 1px solid var(--mail-border);
}
.send-btn {
  border: 0;
  color: #fff;
  font: inherit;
  font-weight: 700;
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  cursor: pointer;
}
.send-btn.confirm { background: var(--mail-green); }
.send-btn.confirm:hover:not(:disabled) { background: #085e2f; }
.send-btn.decline { background: #b42318; }
.send-btn.decline:hover:not(:disabled) { background: #912018; }
.send-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.ghost-btn {
  border: 1px solid var(--mail-border);
  background: #fff;
  color: var(--mail-navy);
  font: inherit;
  font-weight: 600;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
}
.ghost-btn:hover:not(:disabled) {
  border-color: var(--mail-orange);
  color: var(--mail-orange);
}

@media (max-width: 1100px) {
  .gmail {
    grid-template-columns: 72px minmax(240px, 320px) 1fr;
  }
  .nav-label,
  .nav-count { display: none; }
  .compose-btn {
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    font-size: 0;
    gap: 0;
  }
  .nav-item {
    grid-template-columns: 1fr;
    justify-items: center;
    border-radius: 12px;
    margin-right: 0;
    padding: 0.65rem;
  }
}

@media (max-width: 820px) {
  .gmail {
    grid-template-columns: 1fr;
    min-height: calc(100vh - 6rem);
  }
  .mail-nav {
    flex-direction: row;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--mail-border);
    padding: 0.65rem;
    align-items: center;
  }
  .mail-nav nav { display: flex; gap: 0.25rem; }
  .compose-btn {
    width: auto;
    height: auto;
    font-size: 0.85rem;
    padding: 0.55rem 0.9rem;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .nav-item {
    grid-template-columns: auto auto;
    border-radius: 999px;
    white-space: nowrap;
    padding: 0.45rem 0.75rem;
  }
  .nav-label { display: inline; font-size: 0.85rem; }
  .mail-list-pane { border-right: 0; }
  .reading-pane { display: none; }
  .gmail.reading .mail-nav,
  .gmail.reading .mail-list-pane { display: none; }
  .gmail.reading .reading-pane { display: flex; }
  .back-btn { display: grid; }
  .meta-grid,
  .bubble-body { padding-left: 0; }
  .meta-grid { grid-template-columns: 1fr; }
}
</style>
