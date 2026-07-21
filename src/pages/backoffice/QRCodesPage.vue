<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { qrApi, API_BASE } from '@/api/client'
import { FormDialog } from '@/components/ui'

const route = useRoute()
const router = useRouter()
const items = ref([])
const previews = ref({})
const error = ref('')
const loading = ref(true)
const saving = ref(false)
const dialogOpen = ref(false)
const editingCode = ref(null)
const previewUrls = []

const icons = [
  'website', 'profile', 'linkedin', 'email', 'whatsapp', 'location',
  'meeting', 'portfolio', 'contact', 'instagram', 'youtube', 'twitter', 'phone', 'custom',
]
const types = [
  'hub', 'profile', 'project', 'event', 'product',
  'organization', 'website', 'social', 'custom',
]

const form = reactive({
  title: '',
  description: '',
  destination_type: 'hub',
  destination_url: '',
  theme: 'brand',
  primary_color: '#ff6a00',
  secondary_color: '#0a1f44',
  background_color: '#ffffff',
  is_active: true,
  password: '',
  expires_at: '',
  activates_at: '',
  links: [
    { label: 'Website', icon: 'website', url: 'https://streetlabsafrica.org', order: 1, is_active: true },
    { label: 'Employee Profile', icon: 'profile', url: '', order: 2, is_active: true },
  ],
})

function resetForm() {
  editingCode.value = null
  Object.assign(form, {
    title: '',
    description: '',
    destination_type: 'hub',
    destination_url: '',
    theme: 'brand',
    primary_color: '#ff6a00',
    secondary_color: '#0a1f44',
    background_color: '#ffffff',
    is_active: true,
    password: '',
    expires_at: '',
    activates_at: '',
    links: [
      { label: 'Website', icon: 'website', url: 'https://streetlabsafrica.org', order: 1, is_active: true },
      { label: 'Employee Profile', icon: 'profile', url: '', order: 2, is_active: true },
    ],
  })
}

function addLink() {
  form.links.push({
    label: 'New link',
    icon: 'custom',
    url: '',
    order: form.links.length + 1,
    is_active: true,
  })
}

function removeLink(index) {
  form.links.splice(index, 1)
}

async function loadPreview(code) {
  const token = localStorage.getItem('sla_access_token')
  try {
    const res = await fetch(`${API_BASE}/qr/${code}/image/?export=png`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    previewUrls.push(url)
    previews.value = { ...previews.value, [code]: url }
  } catch {
    /* ignore */
  }
}

async function load() {
  loading.value = true
  try {
    const data = await qrApi.list()
    items.value = data.results || data
    await Promise.all(items.value.map((qr) => loadPreview(qr.code)))
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function openCreate() {
  resetForm()
  dialogOpen.value = true
  if (route.query.new !== '1') {
    const q = { ...route.query, new: '1' }
    delete q.edit
    router.replace({ query: q })
  }
}

async function openEdit(code) {
  editingCode.value = code
  error.value = ''
  try {
    const qr = await qrApi.get(code)
    Object.assign(form, {
      title: qr.title,
      description: qr.description || '',
      destination_type: qr.destination_type,
      destination_url: qr.destination_url || '',
      theme: qr.theme,
      primary_color: qr.primary_color,
      secondary_color: qr.secondary_color,
      background_color: qr.background_color,
      is_active: qr.is_active,
      password: '',
      expires_at: qr.expires_at ? qr.expires_at.slice(0, 16) : '',
      activates_at: qr.activates_at ? qr.activates_at.slice(0, 16) : '',
      links: (qr.links || []).map((l, i) => ({
        label: l.label,
        icon: l.icon,
        url: l.url,
        order: l.order ?? i + 1,
        is_active: l.is_active,
      })),
    })
    dialogOpen.value = true
    router.replace({ query: { ...route.query, edit: code } })
  } catch (e) {
    error.value = e.message
  }
}

function onDialogClose() {
  resetForm()
  const q = { ...route.query }
  delete q.new
  delete q.edit
  router.replace({ query: q })
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form,
      expires_at: form.expires_at || null,
      activates_at: form.activates_at || null,
      links: form.links.filter((l) => l.label && l.url),
    }
    if (editingCode.value) {
      await qrApi.update(editingCode.value, payload)
    } else {
      await qrApi.create(payload)
    }
    dialogOpen.value = false
    onDialogClose()
    await load()
  } catch (e) {
    error.value = e.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

async function remove(code) {
  if (!confirm(`Delete QR ${code}?`)) return
  await qrApi.remove(code)
  await load()
}

function download(code, format = 'png') {
  const token = localStorage.getItem('sla_access_token')
  fetch(`${API_BASE}/qr/${code}/image/?export=${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${code}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    })
}

watch(
  () => [route.query.new, route.query.edit],
  ([isNew, editCode]) => {
    if (isNew === '1' && !dialogOpen.value) openCreate()
    else if (editCode && !dialogOpen.value) openEdit(String(editCode))
  },
)

onMounted(async () => {
  await load()
  if (route.query.new === '1') openCreate()
  else if (route.query.edit) await openEdit(String(route.query.edit))
})

onBeforeUnmount(() => {
  previewUrls.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>QR Codes</h1>
        <p>Branded Smart QR codes — create and edit in a dialog</p>
      </div>
      <button type="button" class="cta" @click="openCreate">New QR Code</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading">Loading…</p>
    <div class="table" v-else>
      <div class="row head-row">
        <span>Preview</span>
        <span>Code</span>
        <span>Title</span>
        <span>Type</span>
        <span>Scans</span>
        <span>Status</span>
        <span></span>
      </div>
      <div v-for="qr in items" :key="qr.id" class="row">
        <span class="preview-cell">
          <img
            v-if="previews[qr.code]"
            :src="previews[qr.code]"
            :alt="`QR ${qr.code}`"
            class="thumb"
          />
          <span v-else class="thumb placeholder">…</span>
        </span>
        <span class="code">{{ qr.code }}</span>
        <span>{{ qr.title }}</span>
        <span>{{ qr.destination_type }}</span>
        <span>{{ qr.scan_count }}</span>
        <span>{{ qr.is_currently_active ? 'Active' : 'Inactive' }}</span>
        <span class="actions">
          <router-link :to="`/qr/${qr.code}`" target="_blank">Hub</router-link>
          <button type="button" @click="openEdit(qr.code)">Edit</button>
          <button type="button" @click="download(qr.code, 'png')">PNG</button>
          <button type="button" @click="download(qr.code, 'svg')">SVG</button>
          <button type="button" class="danger" @click="remove(qr.code)">Delete</button>
        </span>
      </div>
    </div>

    <FormDialog
      v-model:open="dialogOpen"
      :title="editingCode ? 'Edit Smart QR' : 'Create Smart QR'"
      description="Configure destination, branding, schedule, and hub actions."
      :submit-label="editingCode ? 'Update QR' : 'Create QR'"
      :loading="saving"
      size="xl"
      @submit="save"
      @cancel="onDialogClose"
    >
      <div class="dialog-form">
        <section>
          <h3>Basics</h3>
          <label>Title<input v-model="form.title" required /></label>
          <label>Description<textarea v-model="form.description" rows="2" /></label>
          <label>
            Destination type
            <select v-model="form.destination_type">
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </label>
          <label>Destination URL<input v-model="form.destination_url" placeholder="Optional direct URL" /></label>
        </section>

        <section>
          <h3>Branding</h3>
          <div class="row3">
            <label>Primary<input v-model="form.primary_color" type="color" /></label>
            <label>Secondary<input v-model="form.secondary_color" type="color" /></label>
            <label>Background<input v-model="form.background_color" type="color" /></label>
          </div>
          <label class="check"><input v-model="form.is_active" type="checkbox" /> Active</label>
        </section>

        <section>
          <h3>Access & schedule</h3>
          <label>Password<input v-model="form.password" type="password" placeholder="Optional" /></label>
          <div class="row2">
            <label>Activates at<input v-model="form.activates_at" type="datetime-local" /></label>
            <label>Expires at<input v-model="form.expires_at" type="datetime-local" /></label>
          </div>
        </section>

        <section>
          <div class="section-head">
            <h3>Smart Hub actions</h3>
            <button type="button" class="ghost" @click="addLink">Add action</button>
          </div>
          <div v-for="(link, index) in form.links" :key="index" class="link-row">
            <input v-model="link.label" placeholder="Label" />
            <select v-model="link.icon">
              <option v-for="icon in icons" :key="icon" :value="icon">{{ icon }}</option>
            </select>
            <input v-model="link.url" placeholder="URL" />
            <button type="button" class="danger" @click="removeLink(index)">Remove</button>
          </div>
        </section>
      </div>
    </FormDialog>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: end; margin-bottom: 1.2rem; }
h1 { margin-bottom: 0.2rem; }
p { color: #5b6b82; margin: 0; }
.cta {
  background: #ff6a00; color: #fff; border: 0; padding: 0.7rem 1rem;
  border-radius: 999px; font-weight: 600; white-space: nowrap; font: inherit; cursor: pointer;
}
.table { background: #fff; border-radius: 16px; overflow: hidden; }
.row {
  display: grid;
  grid-template-columns: 72px 100px 1.4fr 0.8fr 70px 90px 1.6fr;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #eef1f5;
  align-items: center;
}
.head-row { font-size: 0.8rem; color: #5b6b82; background: #f8fafc; }
.code { font-weight: 700; color: #ff6a00; }
.thumb {
  width: 56px; height: 56px; object-fit: contain; border-radius: 10px;
  background: #fff; border: 1px solid #e8eef6; display: block;
}
.thumb.placeholder {
  display: grid; place-items: center; color: #9aa8bc; font-size: 0.85rem;
}
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.actions a, .actions button {
  border: 0; background: #eef2f7; color: #0a1f44; text-decoration: none;
  padding: 0.35rem 0.55rem; border-radius: 8px; font: inherit; cursor: pointer; font-size: 0.8rem;
}
.actions .danger { background: #ffe8e4; color: #b42318; }
.error { color: #b42318; margin-bottom: 0.75rem; }

.dialog-form { display: grid; gap: 2rem; }
.dialog-form section { display: grid; gap: 1.25rem; }
.dialog-form h3 { margin: 0; font-size: 0.95rem; color: #0a1f44; }
.dialog-form label { display: grid; gap: 0.5rem; color: #5b6b82; font-size: 0.88rem; }
.dialog-form input,
.dialog-form textarea,
.dialog-form select {
  border: 1px solid #d8dee8; border-radius: 0.625rem; padding: 0.75rem 1rem; font: inherit; color: #0a1f44;
}
.row2, .row3 { display: grid; gap: 1.25rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.check { display: flex !important; align-items: center; gap: 0.5rem; }
.section-head { display: flex; justify-content: space-between; align-items: center; }
.link-row { display: grid; grid-template-columns: 1fr 120px 1.3fr auto; gap: 0.45rem; }
.ghost, .danger {
  border: 0; border-radius: 999px; padding: 0.45rem 0.8rem; font: inherit; cursor: pointer; font-weight: 600;
}
.ghost { background: #eef2f7; color: #0a1f44; }
.danger { background: #ffe8e4; color: #b42318; }

@media (max-width: 900px) {
  .row { grid-template-columns: 1fr; }
  .link-row { grid-template-columns: 1fr; }
}
</style>
