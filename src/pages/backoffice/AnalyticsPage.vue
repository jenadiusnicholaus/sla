<script setup>
import { onMounted, ref } from 'vue'
import { dashboardApi, qrApi } from '@/api/client'

const platform = ref(null)
const selected = ref('')
const detail = ref(null)
const codes = ref([])
const error = ref('')

async function load() {
  try {
    platform.value = await dashboardApi.platformAnalytics()
    const list = await qrApi.list()
    codes.value = list.results || list
  } catch (e) {
    error.value = e.message
  }
}

async function loadDetail() {
  if (!selected.value) return
  detail.value = await qrApi.analytics(selected.value)
}

onMounted(load)
</script>

<template>
  <div>
    <h1>Analytics</h1>
    <p class="sub">Scan intelligence across the Smart QR platform</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="platform" class="grid">
      <div><strong>{{ platform.total_qr_codes }}</strong><span>QR Codes</span></div>
      <div><strong>{{ platform.total_scans }}</strong><span>Total Scans</span></div>
    </div>

    <section class="panel" v-if="platform">
      <h2>Top QR codes</h2>
      <div v-for="item in platform.top_qr_codes" :key="item.code" class="row">
        <span class="code">{{ item.code }}</span>
        <span>{{ item.title }}</span>
        <strong>{{ item.scan_count }}</strong>
      </div>
    </section>

    <section class="panel">
      <h2>QR detail</h2>
      <select v-model="selected" @change="loadDetail">
        <option value="">Select a QR code</option>
        <option v-for="qr in codes" :key="qr.code" :value="qr.code">{{ qr.code }} — {{ qr.title }}</option>
      </select>
      <div v-if="detail" class="detail">
        <p>Total scans: <strong>{{ detail.total_scans }}</strong> · Returning: <strong>{{ detail.returning_users }}</strong></p>
        <div class="cols">
          <div>
            <h3>Devices</h3>
            <p v-for="d in detail.devices" :key="d.device">{{ d.device || 'unknown' }}: {{ d.count }}</p>
          </div>
          <div>
            <h3>Browsers</h3>
            <p v-for="b in detail.browsers" :key="b.browser">{{ b.browser || 'unknown' }}: {{ b.count }}</p>
          </div>
          <div>
            <h3>Popular links</h3>
            <p v-for="l in detail.popular_links" :key="l.id">{{ l.label }}: {{ l.click_count }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 0.2rem; }
.sub { color: #5b6b82; margin-bottom: 1rem; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; margin-bottom: 1rem; }
.grid div, .panel { background: #fff; border-radius: 16px; padding: 1rem; }
.grid strong { display: block; font-size: 1.6rem; color: #ff6a00; }
.grid span, p { color: #5b6b82; }
.panel { margin-bottom: 1rem; display: grid; gap: 0.6rem; }
.row { display: grid; grid-template-columns: 100px 1fr auto; gap: 0.5rem; padding: 0.4rem 0; border-top: 1px solid #eef1f5; }
.code { color: #ff6a00; font-weight: 700; }
select { border: 1px solid #d8dee8; border-radius: 10px; padding: 0.7rem; font: inherit; }
.cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
h3 { font-size: 0.95rem; color: #0a1f44; }
.error { color: #b42318; }
</style>
