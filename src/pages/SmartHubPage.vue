<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { qrApi } from '@/api/client'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref('')
const requiresPassword = ref(false)
const password = ref('')
const hub = ref(null)
const mode = ref('hub')

const iconMap = {
  website: '🌐',
  profile: '👤',
  linkedin: '💼',
  email: '📧',
  whatsapp: '📱',
  location: '📍',
  meeting: '📅',
  portfolio: '📄',
  contact: '⬇',
  instagram: '📷',
  youtube: '▶',
  twitter: '𝕏',
  github: '⌥',
  phone: '☎',
  custom: '🔗',
}

async function loadHub(pwd = '') {
  loading.value = true
  error.value = ''
  try {
    const data = await qrApi.resolve(route.params.code, pwd)
    mode.value = data.mode
    hub.value = data.hub
    requiresPassword.value = false
    if (data.mode === 'redirect' && data.destination && !data.hub?.links?.length) {
      window.location.href = data.destination
    }
  } catch (e) {
    if (e.status === 403 && e.data?.requires_password) {
      requiresPassword.value = true
    } else {
      error.value = e.message || 'Unable to open this QR code'
    }
  } finally {
    loading.value = false
  }
}

async function openLink(link) {
  try {
    await qrApi.trackLink(route.params.code, link.id)
  } catch {
    // still navigate
  }
  if (link.url.startsWith('mailto:') || link.url.startsWith('tel:') || link.url.startsWith('http')) {
    window.location.href = link.url
  } else {
    router.push(link.url)
  }
}

onMounted(() => loadHub())
</script>

<template>
  <div class="hub" :style="hub ? { '--hub-primary': hub.primary_color, '--hub-navy': hub.secondary_color } : {}">
    <div class="hub-bg" />
    <main class="hub-panel">
      <p class="brand">Street Labs Africa</p>

      <div v-if="loading" class="state">Opening Smart Hub…</div>
      <div v-else-if="requiresPassword" class="state">
        <h1>Protected QR</h1>
        <p>Enter the password to continue.</p>
        <input v-model="password" type="password" placeholder="Password" @keyup.enter="loadHub(password)" />
        <button class="primary" @click="loadHub(password)">Unlock</button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <template v-else-if="hub">
        <h1>{{ hub.title }}</h1>
        <p v-if="hub.description" class="desc">{{ hub.description }}</p>
        <p class="choose">Choose an action</p>

        <div class="actions">
          <button
            v-for="link in hub.links.filter((l) => l.is_active)"
            :key="link.id"
            class="action"
            @click="openLink(link)"
          >
            <span class="icon">{{ iconMap[link.icon] || '🔗' }}</span>
            <span>{{ link.label }}</span>
          </button>
        </div>

        <button class="close" @click="router.push('/')">✕ Close</button>
      </template>
    </main>
  </div>
</template>

<style scoped>
.hub {
  --hub-primary: #ff6a00;
  --hub-navy: #0a1f44;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  position: relative;
  font-family: 'Poppins', system-ui, sans-serif;
  color: #fff;
}
.hub-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--hub-primary) 35%, transparent), transparent 45%),
    radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--hub-navy) 50%, transparent), transparent 40%),
    linear-gradient(160deg, #071526, #0a1f44 50%, #102a4f);
}
.hub-panel {
  position: relative;
  width: min(420px, 100%);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  border-radius: 28px;
  padding: 2rem 1.4rem 1.5rem;
  text-align: center;
}
.brand {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--hub-primary) 80%, white);
  margin-bottom: 1rem;
  font-weight: 600;
}
h1 {
  font-size: 1.55rem;
  line-height: 1.2;
  margin-bottom: 0.4rem;
}
.desc, .choose {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.95rem;
}
.choose {
  margin: 1.4rem 0 0.9rem;
  font-weight: 600;
  color: #fff;
}
.actions {
  display: grid;
  gap: 0.65rem;
}
.action {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
  border: 0;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: transform 0.18s ease, background 0.18s ease;
}
.action:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--hub-primary) 55%, rgba(255, 255, 255, 0.12));
}
.icon {
  width: 1.6rem;
  text-align: center;
}
.close, .primary {
  margin-top: 1.1rem;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font: inherit;
  cursor: pointer;
}
.primary {
  display: inline-block;
  margin-top: 0.8rem;
  background: var(--hub-primary);
  color: #fff;
  padding: 0.7rem 1.2rem;
  border-radius: 999px;
}
input {
  width: 100%;
  margin-top: 0.8rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  padding: 0.8rem 1rem;
  font: inherit;
}
.state { padding: 1rem 0; }
.error { color: #ffb4a8; }
</style>
