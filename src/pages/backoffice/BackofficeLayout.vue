<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useIdleSession } from '@/composables/useIdleSession'
import SessionTimeoutDialog from '@/components/backoffice/SessionTimeoutDialog.vue'

const { user, logout } = useAuth()
const { showWarning, secondsLeft, start, stop, stayLoggedIn, confirmLogout } = useIdleSession()
const router = useRouter()
const route = useRoute()
const search = ref('')
const mobileOpen = ref(false)

const menuLinks = [
  { to: '/backoffice', label: 'Overview', icon: 'dashboard', exact: true },
  { to: '/backoffice/analytics', label: 'Statistics', icon: 'bar_chart' },
  { to: '/backoffice/messages', label: 'Messages', icon: 'mail' },
  { to: '/backoffice/meetings', label: 'Meetings', icon: 'event' },
  { to: '/backoffice/profiles', label: 'Profiles', icon: 'group' },
  { to: '/backoffice/qr', label: 'QR Codes', icon: 'qr_code_2' },
  { to: '/backoffice/cms', label: 'CMS', icon: 'web' },
]

const generalLinks = [
  { to: '/backoffice/cms', label: 'Website settings', icon: 'settings', match: '/backoffice/cms' },
]

function isActive(link) {
  if (link.exact) return route.path === link.to
  const base = link.match || link.to
  return route.path === base || route.path.startsWith(`${base}/`)
}

function go(to) {
  mobileOpen.value = false
  router.push(to)
}

function signOut() {
  stop()
  logout()
  router.push('/backoffice/login')
}

function handleSessionExpired() {
  logout()
  router.push('/backoffice/login')
}

onMounted(() => {
  start({ onExpire: handleSessionExpired })
})

onUnmounted(() => {
  stop()
})

const initials = computed(() => {
  const name = user.value?.first_name || user.value?.username || 'A'
  return String(name).slice(0, 1).toUpperCase()
})

const displayName = computed(
  () => user.value?.first_name || user.value?.username || 'Admin',
)
</script>

<template>
  <div class="bo-shell" :class="{ 'nav-open': mobileOpen }">
    <aside class="bo-sidebar">
      <div class="brand-block">
        <img
          src="/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png"
          alt="Street Labs"
          class="brand-logo"
        />
        <div>
          <p class="brand-name">Street Labs</p>
          <p class="brand-sub">Smart Platform</p>
        </div>
      </div>

      <p class="nav-label">Menu</p>
      <nav class="nav-group">
        <button
          v-for="link in menuLinks"
          :key="link.label + link.to"
          type="button"
          class="nav-item"
          :class="{ active: isActive(link) }"
          @click="go(link.to)"
        >
          <VaIcon :name="link.icon" size="18px" />
          <span>{{ link.label }}</span>
        </button>
      </nav>

      <p class="nav-label">General</p>
      <nav class="nav-group">
        <button
          v-for="link in generalLinks"
          :key="'g-' + link.label"
          type="button"
          class="nav-item"
          :class="{ active: isActive(link) }"
          @click="go(link.to)"
        >
          <VaIcon :name="link.icon" size="18px" />
          <span>{{ link.label }}</span>
        </button>
      </nav>

      <div class="sidebar-user">
        <VaAvatar color="#ff6a00" size="small">{{ initials }}</VaAvatar>
        <div class="user-meta">
          <strong>{{ displayName }}</strong>
          <span>{{ user?.email || user?.role || 'Backoffice' }}</span>
        </div>
        <VaButton
          preset="plain"
          color="#ff6a00"
          icon="logout"
          aria-label="Sign out"
          @click="signOut"
        />
      </div>
    </aside>

    <div class="bo-main">
      <header class="bo-topbar">
        <div class="top-left">
          <VaButton
            class="menu-btn"
            preset="secondary"
            icon="menu"
            aria-label="Toggle menu"
            @click="mobileOpen = !mobileOpen"
          />
          <VaButton preset="secondary" color="#0a1f44" class="workspace-btn">
            Street Labs Admin
            <template #append>
              <VaIcon name="expand_more" />
            </template>
          </VaButton>
        </div>

        <VaInput
          v-model="search"
          class="top-search"
          placeholder="Search QR, profiles, CMS…"
          clearable
        >
          <template #prependInner>
            <VaIcon name="search" color="#5b6b82" />
          </template>
        </VaInput>

        <div class="top-actions">
          <VaButton preset="secondary" icon="notifications" aria-label="Notifications" />
          <VaButton color="primary" icon="add" @click="go('/backoffice/qr/new')">
            Create Smart QR
          </VaButton>
        </div>
      </header>

      <main class="bo-content">
        <router-view />
      </main>
    </div>

    <button
      v-if="mobileOpen"
      type="button"
      class="backdrop"
      aria-label="Close menu"
      @click="mobileOpen = false"
    />

    <SessionTimeoutDialog
      :open="showWarning"
      :seconds-left="secondsLeft"
      @stay="stayLoggedIn"
      @logout="confirmLogout"
    />
  </div>
</template>

<style scoped>
.bo-shell {
  --sidebar-w: 260px;
  min-height: 100vh;
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  background: var(--sla-surface);
  color: var(--sla-navy);
}

.bo-sidebar {
  background: linear-gradient(180deg, var(--sla-navy) 0%, var(--sla-navy-deep) 100%);
  color: #fff;
  padding: 1.25rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 30;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0.5rem 1.25rem;
}
.brand-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: #fff;
  border-radius: 10px;
  padding: 4px;
}
.brand-name {
  margin: 0;
  font-weight: 700;
  font-size: 1rem;
}
.brand-sub {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.55);
}

.nav-label {
  margin: 0.85rem 0.65rem 0.35rem;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.nav-group {
  display: grid;
  gap: 0.2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  width: 100%;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font: inherit;
  font-size: 0.92rem;
  font-weight: 500;
  padding: 0.7rem 0.85rem;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: background 0.2s, color 0.2s;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}
.nav-item.active {
  background: rgba(255, 106, 0, 0.16);
  color: #fff;
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 999px;
  background: var(--sla-orange);
}

.sidebar-user {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 0.55rem 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.user-meta {
  flex: 1;
  min-width: 0;
  display: grid;
}
.user-meta strong {
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-meta span {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bo-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.bo-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(180px, 420px) auto;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: rgba(244, 246, 249, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--sla-border);
}

.top-left,
.top-actions {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.menu-btn { display: none; }
.top-search { width: 100%; }

.bo-content {
  padding: 1.25rem 1.5rem 2rem;
}

.backdrop {
  display: none;
}

@media (max-width: 1100px) {
  .bo-topbar {
    grid-template-columns: auto 1fr auto;
  }
}

@media (max-width: 900px) {
  .bo-shell {
    grid-template-columns: 1fr;
  }
  .bo-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: min(280px, 86vw);
    transform: translateX(-105%);
    transition: transform 0.25s ease;
  }
  .bo-shell.nav-open .bo-sidebar {
    transform: translateX(0);
  }
  .menu-btn { display: inline-flex; }
  .backdrop {
    display: block;
    position: fixed;
    inset: 0;
    border: 0;
    background: rgba(6, 21, 46, 0.45);
    z-index: 25;
    cursor: pointer;
  }
  .top-search { display: none; }
  .workspace-btn { max-width: 160px; }
}
</style>
