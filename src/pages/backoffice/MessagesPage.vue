<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { cmsApi } from '@/api/client'

const items = ref([])
const folder = ref('inbox')
const query = ref('')
const error = ref('')
const statusMsg = ref('')
const statusEmail = ref('')
const statusVisible = ref(false)
let statusTimer = nullconst loading = ref(true)
const sending = ref(false)
const selected = ref(null)
const replyOpen = ref(false)
const replyBody = ref('')
const replySubject = ref('')
const replyFocus = ref(null)
const mobileShowReading = ref(false)

const folders = computed(() => [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: 'inbox',
    count: items.value.filter((i) => i.status !== 'replied').length,
  },
  {
    id: 'unread',
    label: 'Unread',
    icon: 'mark_email_unread',
    count: items.value.filter((i) => i.status === 'new').length,
  },
  {
    id: 'replied',
    label: 'Sent',
    icon: 'send',
    count: items.value.filter((i) => i.status === 'replied').length,
  },
  {
    id: 'all',
    label: 'All mail',
    icon: 'mail',
    count: items.value.length,
  },
])

const visible = computed(() => {
  let list = items.value
  if (folder.value === 'inbox') list = list.filter((i) => i.status !== 'replied')
  else if (folder.value === 'unread') list = list.filter((i) => i.status === 'new')
  else if (folder.value === 'replied') list = list.filter((i) => i.status === 'replied')

  const q = query.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.subject?.toLowerCase().includes(q) ||
        i.message?.toLowerCase().includes(q),
    )
  }
  return list
})

const unreadCount = computed(() => items.value.filter((i) => i.status === 'new').length)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await cmsApi.contactMessages()
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
    const sameDay = d.toDateString() === now.toDateString()
    if (sameDay) {
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

function formatFullDate(value) {
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

function selectFolder(id) {
  folder.value = id
  selected.value = null
  replyOpen.value = false
  mobileShowReading.value = false
}

async function openDetail(item) {
  selected.value = item
  replyOpen.value = false
  replyBody.value = ''
  replySubject.value = item.subject ? `Re: ${item.subject}` : 'Re: your message to Street Labs'
  mobileShowReading.value = true
  statusMsg.value = ''
  statusEmail.value = ''
  statusVisible.value = false
  if (statusTimer) {
    clearTimeout(statusTimer)
    statusTimer = null
  }

  if (item.status === 'new') {
    try {
      const updated = await cmsApi.updateContactMessage(item.id, { status: 'read' })
      const idx = items.value.findIndex((i) => i.id === updated.id)
      if (idx >= 0) items.value[idx] = updated
      selected.value = updated
    } catch {
      /* ignore */
    }
  }
}

function backToList() {
  mobileShowReading.value = false
}

async function openReply() {
  replyOpen.value = true
  await nextTick()
  replyFocus.value?.focus()
}

function closeReply() {
  replyOpen.value = false
  replyBody.value = ''
}

async function sendReply() {
  if (!selected.value || !replyBody.value.trim()) return
  sending.value = true
  error.value = ''
  statusMsg.value = ''
  try {
    const updated = await cmsApi.replyContactMessage(selected.value.id, {
      body: replyBody.value.trim(),
      subject: replySubject.value.trim(),
    })
    const idx = items.value.findIndex((i) => i.id === updated.id)
    if (idx >= 0) items.value[idx] = updated
    selected.value = updated
    replyOpen.value = false
    replyBody.value = ''
    statusMsg.value = 'Reply delivered'
    statusEmail.value = updated.email
    statusVisible.value = true
    if (statusTimer) clearTimeout(statusTimer)
    statusTimer = setTimeout(() => {
      statusVisible.value = false
    }, 5200)
  } catch (e) {
    error.value = e.message
  } finally {
    sending.value = false
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
            placeholder="Search mail"
            aria-label="Search mail"
          />
        </div>
        <div class="toolbar-meta">
          <span v-if="unreadCount" class="unread-pill">{{ unreadCount }} unread</span>
          <button type="button" class="icon-btn" aria-label="Refresh" @click="load">
            <VaIcon name="refresh" size="18px" />
          </button>
        </div>
      </div>

      <p v-if="error" class="banner error">{{ error }}</p>

      <Transition name="toast">
        <div v-if="statusVisible" class="send-toast" role="status" aria-live="polite">
          <span class="toast-check" aria-hidden="true">
            <VaIcon name="check_circle" size="22px" />
          </span>
          <div class="toast-copy">
            <strong>{{ statusMsg }}</strong>
            <span v-if="statusEmail">Sent to {{ statusEmail }}</span>
          </div>
          <button type="button" class="toast-close" aria-label="Dismiss" @click="statusVisible = false">
            <VaIcon name="close" size="16px" />
          </button>
        </div>
      </Transition>

      <div v-if="loading" class="empty-state">
        <VaProgressCircle indeterminate size="small" />
        Loading…
      </div>

      <div v-else-if="!visible.length" class="empty-state">
        <VaIcon name="inbox" size="48px" color="#c5cedc" />
        <p>No conversations in {{ folders.find((f) => f.id === folder)?.label || 'this folder' }}.</p>
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
            unread: item.status === 'new',
          }"
          @click="openDetail(item)"
        >
          <span class="avatar" aria-hidden="true">{{ initials(item.name) }}</span>
          <span class="row-main">
            <span class="row-top">
              <span class="sender">{{ item.name }}</span>
              <span class="when">{{ formatListDate(item.created_at) }}</span>
            </span>
            <span class="subject">{{ item.subject || '(no subject)' }}</span>
            <span class="snippet">{{ item.message }}</span>
          </span>
        </button>
      </div>
    </section>

    <section class="reading-pane">
      <div v-if="!selected" class="empty-reading">
        <VaIcon name="mark_email_unread" size="56px" color="#d0d7e2" />
        <p>Select a message to read</p>
      </div>

      <template v-else>
        <header class="reading-top">
          <button type="button" class="back-btn" @click="backToList">
            <VaIcon name="arrow_back" size="20px" />
          </button>
          <h2>{{ selected.subject || '(no subject)' }}</h2>
          <div class="reading-actions">
            <button type="button" class="ghost-btn" @click="openReply">
              <VaIcon name="reply" size="18px" />
              Reply
            </button>
          </div>
        </header>

        <div class="thread">
          <article class="bubble inbound">
            <div class="bubble-head">
              <span class="avatar lg">{{ initials(selected.name) }}</span>
              <div class="who">
                <strong>{{ selected.name }}</strong>
                <span>&lt;{{ selected.email }}&gt;</span>
              </div>
              <time>{{ formatFullDate(selected.created_at) }}</time>
            </div>
            <div class="bubble-body">{{ selected.message }}</div>
          </article>

          <article v-if="selected.admin_reply" class="bubble outbound">
            <div class="bubble-head">
              <span class="avatar lg org">SLA</span>
              <div class="who">
                <strong>Street Labs</strong>
                <span v-if="selected.replied_by_name">via {{ selected.replied_by_name }}</span>
              </div>
              <time>{{ formatFullDate(selected.replied_at) }}</time>
            </div>
            <div class="bubble-body">{{ selected.admin_reply }}</div>
          </article>
        </div>

        <div v-if="!replyOpen" class="reply-prompt">
          <button type="button" class="reply-chip" @click="openReply">
            <VaIcon name="reply" size="18px" />
            Reply
          </button>
        </div>

        <div v-else class="composer">
          <div class="composer-head">
            <span>Reply to <strong>{{ selected.email }}</strong></span>
            <button type="button" class="icon-btn" aria-label="Discard" @click="closeReply">
              <VaIcon name="close" size="18px" />
            </button>
          </div>
          <input v-model="replySubject" class="composer-subject" type="text" placeholder="Subject" />
          <textarea
            ref="replyFocus"
            v-model="replyBody"
            rows="8"
            placeholder="Write your reply…"
          />
          <div class="composer-foot">
            <button
              type="button"
              class="send-btn"
              :disabled="sending || !replyBody.trim()"
              @click="sendReply"
            >
              {{ sending ? 'Sending…' : 'Send' }}
            </button>
            <span class="composer-hint">From organisation email (CMS → Settings)</span>
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
  --mail-surface: #fff;
  --mail-hover: #f6f8fb;
  --mail-active: #eef3fa;
  --mail-unread: #0a1f44;

  display: grid;
  grid-template-columns: 200px minmax(280px, 380px) 1fr;
  min-height: calc(100vh - 7.5rem);
  background: var(--mail-surface);
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
  box-shadow: 0 2px 8px rgba(255, 106, 0, 0.2);
  color: var(--mail-orange);
}
.mail-nav nav {
  display: grid;
  gap: 0.15rem;
}
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
.nav-item:hover {
  background: rgba(10, 31, 68, 0.06);
}
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
.nav-item.active .nav-count {
  color: var(--mail-orange);
}

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
.banner.error {
  background: #fef3f2;
  color: #b42318;
}

.send-toast {
  margin: 0.65rem 0.75rem 0;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #ecfdf3 0%, #f0fdf4 100%);
  border: 1px solid rgba(10, 122, 61, 0.22);
  box-shadow: 0 8px 20px rgba(10, 122, 61, 0.1);
}
.toast-check {
  color: var(--mail-green);
  display: grid;
  place-items: center;
}
.toast-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}
.toast-copy strong {
  color: var(--mail-navy);
  font-size: 0.9rem;
}
.toast-copy span {
  color: var(--mail-muted);
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toast-close {
  border: 0;
  background: transparent;
  color: var(--mail-muted);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.toast-close:hover {
  background: rgba(10, 31, 68, 0.06);
  color: var(--mail-navy);
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

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
.empty-state p {
  margin: 0;
}

.mail-rows {
  overflow-y: auto;
  flex: 1;
}
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
.mail-row.unread {
  background: #fafbfd;
}
.mail-row.unread .sender,
.mail-row.unread .subject {
  color: var(--mail-unread);
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
  flex-shrink: 0;
}
.avatar.lg {
  width: 42px;
  height: 42px;
  font-size: 0.85rem;
}
.avatar.org {
  background: linear-gradient(135deg, var(--mail-orange), #e04500);
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
.mail-row.unread .when {
  color: var(--mail-orange);
}
.subject {
  font-size: 0.86rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.empty-reading p {
  margin: 0;
}
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
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--mail-navy);
  line-height: 1.3;
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
.back-btn:hover {
  background: var(--mail-hover);
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--mail-border);
  background: #fff;
  color: var(--mail-navy);
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.ghost-btn:hover {
  border-color: var(--mail-orange);
  color: var(--mail-orange);
}

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: grid;
  gap: 1.25rem;
  align-content: start;
}
.bubble-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
  margin-bottom: 0.85rem;
}
.who {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}
.who strong {
  color: var(--mail-navy);
  font-size: 0.95rem;
}
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
.bubble-body {
  color: var(--mail-navy);
  line-height: 1.65;
  white-space: pre-wrap;
  font-size: 0.95rem;
  padding-left: calc(42px + 0.75rem);
}
.bubble.outbound .bubble-body {
  color: #243447;
}

.reply-prompt {
  padding: 0 1.25rem 1.25rem;
}
.reply-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--mail-border);
  background: #fff;
  color: var(--mail-navy);
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(10, 31, 68, 0.06);
}
.reply-chip:hover {
  border-color: var(--mail-orange);
  color: var(--mail-orange);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--mail-border);
  font-size: 0.88rem;
  color: var(--mail-muted);
}
.composer-head strong {
  color: var(--mail-navy);
}
.composer-subject {
  border: 0;
  border-bottom: 1px solid var(--mail-border);
  padding: 0.65rem 0.85rem;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.composer textarea {
  border: 0;
  resize: vertical;
  min-height: 140px;
  padding: 0.85rem;
  font: inherit;
  color: var(--mail-navy);
  outline: none;
}
.composer-foot {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  background: #fafbfd;
  border-top: 1px solid var(--mail-border);
}
.send-btn {
  border: 0;
  background: var(--mail-orange);
  color: #fff;
  font: inherit;
  font-weight: 700;
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
}
.send-btn:hover:not(:disabled) {
  background: #e04500;
}
.send-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.composer-hint {
  font-size: 0.75rem;
  color: var(--mail-muted);
}

@media (max-width: 1100px) {
  .gmail {
    grid-template-columns: 72px minmax(240px, 320px) 1fr;
  }
  .nav-label,
  .nav-count {
    display: none;
  }
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
  .mail-nav nav {
    display: flex;
    gap: 0.25rem;
  }
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
  .nav-label {
    font-size: 0.85rem;
    display: inline;
  }
  .nav-count {
    display: none;
  }
  .mail-list-pane {
    border-right: 0;
  }
  .reading-pane {
    display: none;
  }
  .gmail.reading .mail-nav,
  .gmail.reading .mail-list-pane {
    display: none;
  }
  .gmail.reading .reading-pane {
    display: flex;
  }
  .back-btn {
    display: grid;
  }
  .bubble-body {
    padding-left: 0;
  }
}
</style>
