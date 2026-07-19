<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardApi } from '@/api/client'

const router = useRouter()
const stats = ref(null)
const platform = ref(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const [s, p] = await Promise.all([
      dashboardApi.stats(),
      dashboardApi.platformAnalytics().catch(() => null),
    ])
    stats.value = s
    platform.value = p
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const topQr = computed(() => platform.value?.top_qr_codes?.slice(0, 6) || [])
const daily = computed(() => platform.value?.daily || [])

const maxDaily = computed(() =>
  Math.max(1, ...daily.value.map((d) => d.count || 0)),
)

const mixItems = computed(() => {
  if (!stats.value) return []
  const total =
    (stats.value.qr_codes || 0) +
    (stats.value.profiles || 0) +
    (stats.value.programs || 0) +
    (stats.value.projects || 0) || 1
  return [
    { label: 'QR Codes', value: stats.value.qr_codes || 0, color: '#ff6a00', pct: ((stats.value.qr_codes || 0) / total) * 100 },
    { label: 'Profiles', value: stats.value.profiles || 0, color: '#0a7a3d', pct: ((stats.value.profiles || 0) / total) * 100 },
    { label: 'Programs', value: stats.value.programs || 0, color: '#163566', pct: ((stats.value.programs || 0) / total) * 100 },
    { label: 'Projects', value: stats.value.projects || 0, color: '#2dd47a', pct: ((stats.value.projects || 0) / total) * 100 },
  ]
})

const performance = computed(() => {
  if (!stats.value) return []
  const parts = [
    { label: 'Scans', value: stats.value.total_scans || 0, color: '#ff6a00' },
    { label: 'QR live', value: stats.value.active_qr_codes || 0, color: '#0a7a3d' },
    { label: 'Messages', value: stats.value.contact_messages_new || 0, color: '#163566' },
    { label: 'Subscribers', value: stats.value.newsletter_subscribers || 0, color: '#2dd47a' },
  ]
  const sum = parts.reduce((a, b) => a + b.value, 0) || 1
  let cursor = 0
  return parts.map((p) => {
    const start = cursor
    const slice = (p.value / sum) * 100
    cursor += slice
    return { ...p, start, end: cursor, pct: Math.round((p.value / sum) * 100) }
  })
})

const donutStyle = computed(() => {
  if (!performance.value.length) return { background: '#e6ebf2' }
  const stops = performance.value
    .map((p) => `${p.color} ${p.start}% ${p.end}%`)
    .join(', ')
  return { background: `conic-gradient(${stops})` }
})

function formatDay(day) {
  try {
    return new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return day
  }
}
</script>

<template>
  <div class="dash">
    <div class="page-head">
      <div>
        <h1>Dashboard</h1>
        <p>An overview of Smart QR activity, CMS reach, and community signals.</p>
      </div>
      <VaButton preset="secondary" color="#0a1f44" icon="calendar_today">
        This month
      </VaButton>
    </div>

    <VaAlert v-if="error" color="danger" class="mb">{{ error }}</VaAlert>
    <div v-if="loading" class="loading">
      <VaProgressCircle indeterminate size="small" />
      <span>Loading overview…</span>
    </div>

    <template v-else-if="stats">
      <!-- Top KPI row -->
      <div class="kpi-row">
        <VaCard class="kpi highlight">
          <VaCardContent>
            <p class="eyebrow">Platform pulse</p>
            <h2>Smart identity is live across Africa</h2>
            <p class="kpi-copy">
              Track QR hubs, team profiles, and website CMS from one control room.
            </p>
            <VaButton color="primary" @click="router.push('/backoffice/qr/new')">
              Launch new QR
            </VaButton>
          </VaCardContent>
        </VaCard>

        <VaCard class="kpi">
          <VaCardContent>
            <div class="kpi-top">
              <span>Total scans</span>
              <VaBadge color="success" text="+ live" />
            </div>
            <strong class="kpi-value">{{ stats.total_scans }}</strong>
            <p class="kpi-sub">Across {{ stats.qr_codes }} Smart QR codes</p>
            <div class="spark">
              <span
                v-for="(d, i) in (daily.length ? daily : [{ count: 1 }, { count: 2 }, { count: 1 }, { count: 3 }])"
                :key="i"
                :style="{ height: `${12 + (d.count / maxDaily) * 28}px` }"
              />
            </div>
          </VaCardContent>
        </VaCard>

        <VaCard class="kpi">
          <VaCardContent>
            <div class="kpi-top">
              <span>Active QR</span>
              <VaBadge color="primary" :text="`${stats.active_qr_codes}`" />
            </div>
            <strong class="kpi-value">{{ stats.active_qr_codes }}</strong>
            <p class="kpi-sub">{{ stats.profiles }} profiles · {{ stats.programs }} programs</p>
            <div class="spark green">
              <span style="height: 18px" />
              <span style="height: 26px" />
              <span style="height: 22px" />
              <span style="height: 34px" />
              <span style="height: 28px" />
            </div>
          </VaCardContent>
        </VaCard>
      </div>

      <!-- Main body grid -->
      <div class="body-grid">
        <!-- Transactions-style list -->
        <VaCard class="panel list-panel">
          <VaCardTitle>
            <span>Top QR activity</span>
            <VaButton preset="plain" color="primary" @click="router.push('/backoffice/qr')">
              View all
            </VaButton>
          </VaCardTitle>
          <VaCardContent>
            <div v-if="!topQr.length" class="empty">No scan activity yet.</div>
            <div v-for="item in topQr" :key="item.code" class="list-row">
              <div class="list-icon">
                <VaIcon name="qr_code_2" color="#ff6a00" />
              </div>
              <div class="list-meta">
                <strong>{{ item.title || item.code }}</strong>
                <span>{{ item.code }}</span>
              </div>
              <div class="list-status">
                <VaBadge
                  :color="item.scan_count ? 'success' : 'info'"
                  :text="item.scan_count ? 'Active' : 'Pending'"
                />
                <span class="scan-count">{{ item.scan_count || 0 }} scans</span>
              </div>
            </div>
          </VaCardContent>
        </VaCard>

        <!-- Middle charts -->
        <div class="mid-col">
          <VaCard class="panel">
            <VaCardTitle>Scan revenue of attention</VaCardTitle>
            <VaCardContent>
              <div class="chart-head">
                <strong>{{ stats.total_scans }}</strong>
                <span>total scans</span>
              </div>
              <div class="bar-chart" v-if="daily.length">
                <div v-for="d in daily" :key="d.day" class="bar-col">
                  <div class="bar-stack">
                    <div
                      class="bar income"
                      :style="{ height: `${(d.count / maxDaily) * 100}%` }"
                    />
                  </div>
                  <span>{{ formatDay(d.day) }}</span>
                </div>
              </div>
              <div v-else class="bar-chart placeholder">
                <div v-for="n in 6" :key="n" class="bar-col">
                  <div class="bar-stack">
                    <div class="bar income" :style="{ height: `${30 + n * 8}%` }" />
                  </div>
                  <span>Day {{ n }}</span>
                </div>
              </div>
              <div class="legend">
                <span><i class="dot orange" /> Scans</span>
                <span><i class="dot green" /> Reach</span>
              </div>
            </VaCardContent>
          </VaCard>

          <VaCard class="panel">
            <VaCardTitle>Content mix</VaCardTitle>
            <VaCardContent>
              <div v-for="item in mixItems" :key="item.label" class="mix-row">
                <div class="mix-label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <div class="mix-track">
                  <div class="mix-fill" :style="{ width: `${Math.max(item.pct, 4)}%`, background: item.color }" />
                </div>
              </div>
            </VaCardContent>
          </VaCard>
        </div>

        <!-- Right column -->
        <div class="right-col">
          <VaCard class="panel">
            <VaCardTitle>Total view performance</VaCardTitle>
            <VaCardContent class="donut-wrap">
              <div class="donut" :style="donutStyle">
                <div class="donut-hole">
                  <strong>{{ stats.total_scans }}</strong>
                  <span>scans</span>
                </div>
              </div>
              <ul class="donut-legend">
                <li v-for="p in performance" :key="p.label">
                  <i :style="{ background: p.color }" />
                  <span>{{ p.label }}</span>
                  <strong>{{ p.pct }}%</strong>
                </li>
              </ul>
              <VaButton
                preset="secondary"
                color="#0a1f44"
                class="full"
                @click="router.push('/backoffice/analytics')"
              >
                Open analytics
              </VaButton>
            </VaCardContent>
          </VaCard>

          <VaCard class="panel cta-card">
            <VaCardContent>
              <p class="eyebrow light">Website CMS</p>
              <h3>Keep the landing page fresh</h3>
              <p>Update programs, team photos, and brand colors without a redeploy.</p>
              <VaButton color="primary" @click="router.push('/backoffice/cms')">
                Manage CMS
              </VaButton>
            </VaCardContent>
          </VaCard>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dash { display: grid; gap: 1rem; }

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.page-head h1 {
  margin: 0 0 0.25rem;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--sla-navy);
}
.page-head p {
  margin: 0;
  color: var(--sla-muted);
  font-size: 0.92rem;
}

.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--sla-muted);
  padding: 2rem 0;
}
.mb { margin-bottom: 0.5rem; }

.kpi-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 1rem;
}

.kpi :deep(.va-card__content),
.panel :deep(.va-card__content) {
  padding: 1.15rem 1.2rem;
}
.panel :deep(.va-card-title) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1rem 1.2rem 0;
  font-weight: 650;
  color: var(--sla-navy);
}

.kpi.highlight {
  background: linear-gradient(145deg, #0a1f44 0%, #163566 100%);
  color: #fff;
  border: 0;
}
.kpi.highlight .eyebrow { color: rgba(255,255,255,0.55); }
.kpi.highlight h2 {
  margin: 0.35rem 0 0.65rem;
  font-size: 1.35rem;
  line-height: 1.25;
  max-width: 16ch;
}
.kpi-copy {
  color: rgba(255,255,255,0.7);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0 0 1rem;
  max-width: 36ch;
}

.eyebrow {
  margin: 0;
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--sla-muted);
}
.eyebrow.light { color: rgba(255,255,255,0.55); }

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--sla-muted);
  font-size: 0.88rem;
}
.kpi-value {
  display: block;
  margin-top: 0.55rem;
  font-size: 2rem;
  line-height: 1;
  color: var(--sla-navy);
}
.kpi-sub {
  margin: 0.45rem 0 0.9rem;
  color: var(--sla-muted);
  font-size: 0.82rem;
}

.spark {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  height: 40px;
}
.spark span {
  width: 8px;
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, #ff6a00, #ffad70);
  display: block;
}
.spark.green span {
  background: linear-gradient(180deg, #0a7a3d, #2dd47a);
}

.body-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr 0.9fr;
  gap: 1rem;
  align-items: start;
}
.mid-col,
.right-col {
  display: grid;
  gap: 1rem;
}

.list-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--sla-border);
}
.list-row:last-child { border-bottom: 0; }
.list-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 106, 0, 0.1);
  display: grid;
  place-items: center;
}
.list-meta { display: grid; gap: 0.1rem; min-width: 0; }
.list-meta strong {
  font-size: 0.92rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list-meta span,
.scan-count {
  color: var(--sla-muted);
  font-size: 0.78rem;
}
.list-status {
  display: grid;
  justify-items: end;
  gap: 0.25rem;
}
.empty {
  color: var(--sla-muted);
  padding: 1rem 0;
}

.chart-head {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  margin-bottom: 0.85rem;
}
.chart-head strong { font-size: 1.4rem; color: var(--sla-navy); }
.chart-head span { color: var(--sla-muted); font-size: 0.82rem; }

.bar-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(36px, 1fr));
  gap: 0.55rem;
  align-items: end;
  min-height: 140px;
}
.bar-col {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
}
.bar-stack {
  width: 100%;
  max-width: 28px;
  height: 120px;
  background: #eef2f7;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.bar {
  width: 100%;
  border-radius: 10px 10px 4px 4px;
  min-height: 8%;
}
.bar.income { background: linear-gradient(180deg, #ff6a00, #ffad70); }
.bar-col span {
  font-size: 0.65rem;
  color: var(--sla-muted);
  text-align: center;
}
.legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.85rem;
  color: var(--sla-muted);
  font-size: 0.78rem;
}
.legend .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.35rem;
}
.dot.orange { background: #ff6a00; }
.dot.green { background: #0a7a3d; }

.mix-row { margin-bottom: 0.85rem; }
.mix-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.86rem;
}
.mix-track {
  height: 8px;
  background: #eef2f7;
  border-radius: 999px;
  overflow: hidden;
}
.mix-fill {
  height: 100%;
  border-radius: 999px;
}

.donut-wrap { display: grid; gap: 1rem; justify-items: center; }
.donut {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.donut-hole {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-content: center;
  text-align: center;
}
.donut-hole strong { font-size: 1.35rem; color: var(--sla-navy); line-height: 1; }
.donut-hole span { font-size: 0.72rem; color: var(--sla-muted); }
.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  gap: 0.45rem;
}
.donut-legend li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.55rem;
  align-items: center;
  font-size: 0.84rem;
}
.donut-legend i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.full { width: 100%; }

.cta-card {
  background: linear-gradient(145deg, #0a1f44 0%, #0a7a3d 140%);
  color: #fff;
  border: 0;
}
.cta-card h3 {
  margin: 0.35rem 0 0.5rem;
  font-size: 1.15rem;
}
.cta-card p:not(.eyebrow) {
  margin: 0 0 1rem;
  color: rgba(255,255,255,0.72);
  font-size: 0.88rem;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .kpi-row,
  .body-grid {
    grid-template-columns: 1fr 1fr;
  }
  .kpi.highlight,
  .list-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .kpi-row,
  .body-grid {
    grid-template-columns: 1fr;
  }
  .page-head { flex-direction: column; }
}
</style>
