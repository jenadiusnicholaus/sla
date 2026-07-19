<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { qrApi } from '@/api/client'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.code))
const saving = ref(false)
const error = ref('')
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

const icons = ['website', 'profile', 'linkedin', 'email', 'whatsapp', 'location', 'meeting', 'portfolio', 'contact', 'instagram', 'youtube', 'twitter', 'phone', 'custom']
const types = ['hub', 'profile', 'project', 'event', 'product', 'organization', 'website', 'social', 'custom']

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

async function load() {
  if (!isEdit.value) return
  const qr = await qrApi.get(route.params.code)
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
    if (isEdit.value) {
      await qrApi.update(route.params.code, payload)
    } else {
      const created = await qrApi.create(payload)
      router.replace(`/backoffice/qr/${created.code}`)
      return
    }
    router.push('/backoffice/qr')
  } catch (e) {
    error.value = e.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <h1>{{ isEdit ? 'Edit Smart QR' : 'Smart QR Builder' }}</h1>
    <p class="sub">Configure dynamic destinations, branded hub actions, and lifecycle controls.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <form class="form" @submit.prevent="save">
      <section>
        <h2>Basics</h2>
        <label>Title<input v-model="form.title" required /></label>
        <label>Description<textarea v-model="form.description" rows="3" /></label>
        <label>Destination type
          <select v-model="form.destination_type">
            <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
          </select>
        </label>
        <label>Destination URL<input v-model="form.destination_url" placeholder="Optional direct URL" /></label>
      </section>

      <section>
        <h2>Branding</h2>
        <div class="row3">
          <label>Primary<input v-model="form.primary_color" type="color" /></label>
          <label>Secondary<input v-model="form.secondary_color" type="color" /></label>
          <label>Background<input v-model="form.background_color" type="color" /></label>
        </div>
        <label class="check"><input v-model="form.is_active" type="checkbox" /> Active</label>
      </section>

      <section>
        <h2>Access & schedule</h2>
        <label>Password<input v-model="form.password" type="password" placeholder="Optional" /></label>
        <div class="row2">
          <label>Activates at<input v-model="form.activates_at" type="datetime-local" /></label>
          <label>Expires at<input v-model="form.expires_at" type="datetime-local" /></label>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2>Smart Hub actions</h2>
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

      <button class="cta" :disabled="saving">{{ saving ? 'Saving…' : 'Save QR Code' }}</button>
    </form>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 0.2rem; }
.sub, label { color: #5b6b82; }
.form { display: grid; gap: 1rem; max-width: 860px; }
section { background: #fff; border-radius: 16px; padding: 1rem; display: grid; gap: 0.75rem; }
h2 { font-size: 1rem; color: #0a1f44; }
label { display: grid; gap: 0.35rem; font-size: 0.9rem; }
input, textarea, select {
  border: 1px solid #d8dee8; border-radius: 10px; padding: 0.7rem 0.8rem; font: inherit; color: #0a1f44;
}
.row2, .row3 { display: grid; gap: 0.75rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
.check { display: flex; align-items: center; gap: 0.5rem; }
.section-head { display: flex; justify-content: space-between; align-items: center; }
.link-row { display: grid; grid-template-columns: 1fr 140px 1.4fr auto; gap: 0.5rem; }
.cta, .ghost, .danger {
  border: 0; border-radius: 999px; padding: 0.75rem 1.1rem; font: inherit; cursor: pointer; font-weight: 600;
}
.cta { background: #ff6a00; color: #fff; justify-self: start; }
.ghost { background: #eef2f7; color: #0a1f44; }
.danger { background: #ffe8e4; color: #b42318; }
.error { color: #b42318; }
@media (max-width: 800px) {
  .link-row { grid-template-columns: 1fr; }
}
</style>
