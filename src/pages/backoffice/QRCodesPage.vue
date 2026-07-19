<script setup>
import { onMounted, ref } from 'vue'
import { qrApi, API_BASE } from '@/api/client'

const items = ref([])
const error = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const data = await qrApi.list()
    items.value = data.results || data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
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

onMounted(load)
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>QR Codes</h1>
        <p>Dynamic Smart QR codes for the whole organization</p>
      </div>
      <router-link class="cta" to="/backoffice/qr/new">New QR Code</router-link>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading">Loading…</p>
    <div class="table" v-else>
      <div class="row head-row">
        <span>Code</span><span>Title</span><span>Type</span><span>Scans</span><span>Status</span><span></span>
      </div>
      <div v-for="qr in items" :key="qr.id" class="row">
        <span class="code">{{ qr.code }}</span>
        <span>{{ qr.title }}</span>
        <span>{{ qr.destination_type }}</span>
        <span>{{ qr.scan_count }}</span>
        <span>{{ qr.is_currently_active ? 'Active' : 'Inactive' }}</span>
        <span class="actions">
          <router-link :to="`/qr/${qr.code}`" target="_blank">Hub</router-link>
          <router-link :to="`/backoffice/qr/${qr.code}`">Edit</router-link>
          <button @click="download(qr.code, 'png')">PNG</button>
          <button @click="download(qr.code, 'svg')">SVG</button>
          <button class="danger" @click="remove(qr.code)">Delete</button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.head { display: flex; justify-content: space-between; gap: 1rem; align-items: end; margin-bottom: 1.2rem; }
h1 { margin-bottom: 0.2rem; }
p { color: #5b6b82; }
.cta {
  background: #ff6a00; color: #fff; text-decoration: none; padding: 0.7rem 1rem;
  border-radius: 999px; font-weight: 600; white-space: nowrap;
}
.table { background: #fff; border-radius: 16px; overflow: hidden; }
.row {
  display: grid;
  grid-template-columns: 100px 1.4fr 0.8fr 70px 90px 1.6fr;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #eef1f5;
  align-items: center;
}
.head-row { font-size: 0.8rem; color: #5b6b82; background: #f8fafc; }
.code { font-weight: 700; color: #ff6a00; }
.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.actions a, .actions button {
  border: 0; background: #eef2f7; color: #0a1f44; text-decoration: none;
  padding: 0.35rem 0.55rem; border-radius: 8px; font: inherit; cursor: pointer; font-size: 0.8rem;
}
.actions .danger { background: #ffe8e4; color: #b42318; }
.error { color: #b42318; }
@media (max-width: 900px) {
  .row { grid-template-columns: 1fr; }
}
</style>
