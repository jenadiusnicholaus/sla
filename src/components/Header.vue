<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface NavLink {
  label: string
  href: string
}

interface Announcement {
  message?: string
  cta_label?: string
  cta_action?: string
  cta_url?: string
  dismissible?: boolean
  is_active?: boolean
}

interface Settings {
  org_name?: string
  org_short_name?: string
  tagline?: string
  logo?: string | null
  logo_alt?: string
}

const props = defineProps<{
  announcement?: Announcement | null
  nav?: NavLink[]
  settings?: Settings | null
}>()

const emit = defineEmits<{
  (e: 'open-donate'): void
}>()

const DEFAULT_NAV: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Programs', href: '#services' },
  { label: 'Values', href: '#values' },
  { label: 'Team', href: '#team' },
  { label: 'Contact', href: '#contact' },
]

const isMenuOpen = ref(false)
const isScrolled = ref(false)
const announcementVisible = ref(true)

const navLinks = computed(() => (props.nav?.length ? props.nav : DEFAULT_NAV))
const logoSrc = computed(
  () => props.settings?.logo || '/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png',
)
const logoAlt = computed(
  () => props.settings?.logo_alt || props.settings?.org_name || 'Street Digital Labs Africa Logo',
)
const brandName = computed(() => props.settings?.org_short_name || 'Street Digital Labs')
const brandSub = computed(() => {
  const tag = props.settings?.tagline || 'Inclusion for All'
  return `Africa · ${tag.replace(/!$/, '')}`
})
const showAnnouncement = computed(
  () => announcementVisible.value && props.announcement?.is_active !== false,
)
const annMessage = computed(
  () => props.announcement?.message || 'Help us empower 10,000 more youth this year —',
)
const annCta = computed(() => props.announcement?.cta_label || 'Donate Now →')

const onAnnouncementCta = () => {
  if (props.announcement?.cta_action === 'url' && props.announcement.cta_url) {
    window.location.href = props.announcement.cta_url
    return
  }
  emit('open-donate')
}

const toggleMenu = (): void => { isMenuOpen.value = !isMenuOpen.value }
const handleScroll = (): void => { isScrolled.value = window.scrollY > 50 }

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div class="header-wrap">
    <div class="announcement-bar" v-if="showAnnouncement">
      <span class="ann-pulse"></span>
      <p>🌍 {{ annMessage }}
        <button @click="onAnnouncementCta" class="ann-cta">{{ annCta }}</button>
      </p>
      <button
        v-if="announcement?.dismissible !== false"
        class="ann-close"
        @click="announcementVisible = false"
        aria-label="Close announcement"
      >✕</button>
    </div>

    <header class="header" :class="{ scrolled: isScrolled }">
      <div class="header-container">
        <a href="#home" class="logo" :aria-label="`${brandName} — Home`">
          <div class="logo-img-wrap">
            <img :src="logoSrc" :alt="logoAlt" class="header-logo" />
          </div>
          <div class="logo-text">
            <span class="logo-name">{{ brandName }}</span>
            <span class="logo-sub">{{ brandSub }}</span>
          </div>
        </a>

        <nav class="nav" role="navigation" aria-label="Main navigation">
          <a
            v-for="link in navLinks"
            :key="link.label"
            :href="link.href"
            class="nav-link"
            @click="isMenuOpen = false"
          >{{ link.label }}</a>
        </nav>

        <div class="header-right">
          <div class="donate-border-wrap">
            <button class="donate-btn" @click="emit('open-donate')" id="header-donate-btn">
              <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
              Donate
            </button>
          </div>
          <button
            class="menu-toggle"
            :class="{ open: isMenuOpen }"
            @click="toggleMenu"
            aria-label="Toggle navigation menu"
            :aria-expanded="isMenuOpen"
            id="nav-menu-toggle"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <transition name="drawer">
        <div class="mobile-drawer" v-if="isMenuOpen" role="navigation" aria-label="Mobile navigation">
          <a
            v-for="link in navLinks"
            :key="link.label"
            :href="link.href"
            class="drawer-link"
            @click="isMenuOpen = false"
          >{{ link.label }}</a>
          <div class="donate-border-wrap donate-border-full">
            <button
              class="donate-btn donate-btn-full"
              @click="() => { isMenuOpen = false; emit('open-donate') }"
              id="mobile-donate-btn"
            >
              ❤️ Donate Now
            </button>
          </div>
        </div>
      </transition>
    </header>
  </div>
</template>

<style scoped>
/* ── Announcement Bar ─────────────────────────────────── */
.announcement-bar {
  background: linear-gradient(90deg, #0a1f44 0%, #163566 100%);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.82rem;
  font-family: 'Poppins', sans-serif;
  padding: 0.55rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  position: relative;
}
.ann-pulse {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #ff6a00;
  animation: pulse 1.8s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.5); opacity: 0.6; }
}
.ann-cta {
  background: none; border: none; cursor: pointer;
  color: #ff6a00; font-weight: 700;
  font-family: inherit; font-size: inherit;
  padding: 0; text-decoration: underline;
  transition: color 0.2s;
}
.ann-cta:hover { color: #ffad70; }
.ann-close {
  position: absolute; right: 1rem;
  background: none; border: none; cursor: pointer;
  color: rgba(255, 255, 255, 0.45); font-size: 0.8rem;
  transition: color 0.2s; line-height: 1;
}
.ann-close:hover { color: white; }

/* ── Header Shell ────────────────────────────────────── */
.header-wrap {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
}
.header {
  background: transparent;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1.5px solid rgba(10, 31, 68, 0.08);
  transition: box-shadow 0.35s, background 0.35s;
}
.header.scrolled {
  background: rgba(255, 255, 255, 0.99);
  box-shadow: 0 4px 40px rgba(10, 31, 68, 0.12);
}
.header.scrolled .nav-link {
  color: rgba(10, 31, 68, 0.9);
}
.header.scrolled .nav-link:hover {
  color: #0a1f44;
  background: rgba(10, 31, 68, 0.05);
}

/* ── Container ───────────────────────────────────────── */
.header-container {
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: flex;
  align-items: center;
  height: 82px;
  gap: 2.5rem;
}

/* ── Logo ────────────────────────────────────────────── */
.logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  flex-shrink: 0;
  background: #ffffff;
  padding: 0.4rem 0.9rem 0.4rem 0.4rem;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.9);
  transition: box-shadow 0.25s, transform 0.25s;
}
.logo:hover {
  box-shadow: 0 8px 28px rgba(0,0,0,0.18);
  transform: translateY(-1px);
}
.logo-img-wrap {
  width: 46px; height: 46px;
  background: linear-gradient(135deg, #fff7f0 0%, #fff 100%);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(255, 106, 0, 0.2);
  flex-shrink: 0;
}
.header-logo { width: 34px; height: 34px; object-fit: contain; }

.logo-text {
  display: flex; flex-direction: column;
  line-height: 1.15;
  border-left: 1.5px solid rgba(10,31,68,0.1);
  padding-left: 0.65rem;
}
.logo-name {
  font-size: 0.95rem; font-weight: 800; color: #0a1f44;
  font-family: 'Poppins', sans-serif; letter-spacing: -0.01em;
  white-space: nowrap;
}
.logo-sub {
  font-size: 0.58rem; font-weight: 600; color: #ff6a00;
  font-family: 'Poppins', sans-serif; letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── Desktop Nav ─────────────────────────────────────── */
.nav {
  display: flex; gap: 0.15rem;
  align-items: center; margin-left: auto;
}
.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500; font-size: 0.875rem;
  font-family: 'Poppins', sans-serif;
  padding: 0.5rem 1rem; border-radius: 8px;
  transition: color 0.2s, background 0.2s;
  white-space: nowrap;
}
.nav-link:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }

/* ── Right Actions ───────────────────────────────────── */
.header-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }

/* ── Animated border donate button ───────────────────── */
.donate-border-wrap {
  position: relative;
  border-radius: 50px;
  padding: 2px;
  background: conic-gradient(
    from var(--angle, 0deg),
    #ff6a00, #ffffff, #0a7a3d, #ffffff, #ff6a00
  );
  animation: spin-border 2.5s linear infinite;
}
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes spin-border {
  to { --angle: 360deg; }
}
.donate-btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, #ff6a00 0%, #e84a00 100%);
  color: white; font-size: 0.9rem; font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 0.65rem 1.6rem; border-radius: 50px;
  border: none; cursor: pointer;
  position: relative; z-index: 1;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(255, 106, 0, 0.4);
  white-space: nowrap; letter-spacing: 0.01em;
  width: 100%;
}
.donate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255, 106, 0, 0.5); }
.donate-btn-full {
  width: 100%; justify-content: center;
  border-radius: 12px; margin-top: 1rem;
}
.heart-icon { width: 16px; height: 16px; flex-shrink: 0; }

/* ── Hamburger ───────────────────────────────────────── */
.menu-toggle {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer;
  padding: 0.4rem; border-radius: 8px; transition: background 0.2s;
}
.menu-toggle:hover { background: rgba(10, 31, 68, 0.06); }
.menu-toggle span {
  width: 24px; height: 2.5px; background: #0a1f44;
  border-radius: 4px; transition: transform 0.3s, opacity 0.3s; display: block;
}
.menu-toggle.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5.5px); }
.menu-toggle.open span:nth-child(2) { opacity: 0; }
.menu-toggle.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5.5px); }

/* ── Mobile Drawer ───────────────────────────────────── */
.mobile-drawer {
  background: rgba(255, 255, 255, 0.99);
  border-top: 1px solid rgba(10, 31, 68, 0.07);
  padding: 1.25rem 1.5rem 2rem;
  display: flex; flex-direction: column; gap: 0.2rem;
  box-shadow: 0 16px 40px rgba(10, 31, 68, 0.12);
}
.drawer-link {
  text-decoration: none; color: #0a1f44;
  font-size: 1rem; font-weight: 500;
  font-family: 'Poppins', sans-serif;
  padding: 0.85rem 1rem; border-radius: 10px;
  transition: background 0.2s, color 0.2s;
}
.drawer-link:hover { background: rgba(255, 106, 0, 0.06); color: #ff6a00; }

/* Drawer slide transition */
.drawer-enter-active,
.drawer-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .nav { display: none; }
  .menu-toggle { display: flex; }
  .header-container { padding: 0 1.5rem; }
}
@media (max-width: 480px) {
  .logo-name { font-size: 0.95rem; }
  .logo-sub  { display: none; }
  .logo-img-wrap { width: 54px; height: 54px; }
  .header-logo   { width: 44px; height: 44px; }
  .header-container { height: 72px; }
}
</style>
