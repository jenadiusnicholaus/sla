<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'
import OfficialPreviewModal, { type Official } from '@/components/OfficialPreviewModal.vue'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import SectionKicker from '@/components/landing/SectionKicker.vue'

interface OrgNode {
  title: string
  subtitle?: string
  icon?: string
  level: number
  color?: string
  accent_color?: string
  order?: number
}

interface TeamMember extends Official {
  id?: number
  accepts_meetings?: boolean
}

interface Settings {
  logo?: string | null
  logo_alt?: string
  org_name?: string
}

const props = defineProps<{
  orgChart?: OrgNode[]
  team?: TeamMember[]
  settings?: Settings | null
}>()

useFadeUp('[data-fade-team]')

const AUTO_MS = 5500
const activeIndex = ref(0)
const slideDir = ref<'next' | 'prev'>('next')
const selected = ref<Official | null>(null)
const previewOpen = ref(false)
const bookOnOpen = ref(false)
const hovered = ref(false)
const prefersReducedMotion = ref(false)

let autoTimer: ReturnType<typeof setInterval> | null = null

function clearAuto() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

function startAuto() {
  clearAuto()
  if (prefersReducedMotion.value) return
  if (teamMembers.value.length < 2) return
  if (previewOpen.value || hovered.value) return
  autoTimer = setInterval(() => {
    go(1)
  }, AUTO_MS)
}

function go(delta: number) {
  const len = teamMembers.value.length
  if (!len) return
  slideDir.value = delta >= 0 ? 'next' : 'prev'
  activeIndex.value = (activeIndex.value + delta + len) % len
}

const DEFAULT_DIRECTORS = [
  { title: 'Director of Operations', icon: '⚙️', color: '#0a1f44', accent: '#163566' },
  { title: 'Director of Corporate Events', icon: '📅', color: '#ff6a00', accent: '#e04500' },
  { title: 'Director of Innovation', icon: '💡', color: '#0a7a3d', accent: '#085e2f' },
  { title: 'Chief Financial Officer', icon: '📈', color: '#0a7a3d', accent: '#085e2f' },
  { title: 'Chief Technology Officer', icon: '💻', color: '#0a1f44', accent: '#163566' },
  { title: 'Director of Creative', icon: '🎨', color: '#ff6a00', accent: '#e04500' },
]

const DEFAULT_TEAM: TeamMember[] = [
  {
    name: 'Anna Joseph Msulla',
    role: 'Chief Operating Officer',
    bio: 'Operational leadership focused on scaling digital skills programs across African communities.',
    initials: 'AM',
    color: '#0a1f44',
  },
  {
    name: 'Abud Hamidu Abdu',
    role: 'Director of Operations',
    bio: 'Driving delivery excellence and youth empowerment through hands-on program operations.',
    initials: 'AA',
    color: '#0a7a3d',
  },
  {
    name: 'Vicent Johanes Mirumbe',
    role: 'Director of Corporate Events',
    bio: 'Building partnerships and signature events that elevate Street Labs across the continent.',
    initials: 'VM',
    color: '#ff6a00',
  },
  {
    name: 'Mahmoud Mohamed Mahmoud',
    role: 'Director of Innovation',
    bio: 'Leading product and innovation pathways that turn community challenges into tech solutions.',
    initials: 'MM',
    color: '#0a1f44',
  },
  {
    name: 'Gervass Orgeness Urassa',
    role: 'Director of Creative',
    bio: 'Shaping brand storytelling and creative direction for inclusive digital learning.',
    initials: 'GU',
    color: '#ff6a00',
  },
  {
    name: 'Jenadius Nicholaus Kaimkilwa',
    role: 'Chief Technology Officer',
    bio: 'Architecting the platforms and tools that power Street Labs Africa at scale.',
    initials: 'JK',
    color: '#0a7a3d',
  },
]

const sortedOrg = computed(() =>
  [...(props.orgChart || [])].sort(
    (a, b) => a.level - b.level || (a.order ?? 0) - (b.order ?? 0),
  ),
)
const level1 = computed(() => sortedOrg.value.find((n) => n.level === 1))
const level2 = computed(() => sortedOrg.value.find((n) => n.level === 2))
const level3 = computed(() => sortedOrg.value.find((n) => n.level === 3))
const directorCards = computed(() => {
  const level4 = sortedOrg.value.filter((n) => n.level >= 4)
  if (level4.length) {
    return level4.map((n) => ({
      title: n.title,
      icon: n.icon || '👤',
      color: n.color || '#0a1f44',
      accent: n.accent_color || n.color || '#163566',
    }))
  }
  return DEFAULT_DIRECTORS
})

const teamMembers = computed(() => {
  if (props.team?.length) {
    return props.team.map((m) => ({
      ...m,
      color: m.avatar_color || m.color || '#0a1f44',
      bio:
        m.bio ||
        'Leadership at Street Digital Labs Africa — advancing digital skills, innovation, and inclusion.',
    }))
  }
  return DEFAULT_TEAM
})

const activeMember = computed(
  () => teamMembers.value[activeIndex.value] || teamMembers.value[0] || null,
)

watch(
  teamMembers,
  (list) => {
    if (activeIndex.value >= list.length) activeIndex.value = 0
    startAuto()
  },
  { immediate: true },
)

watch(previewOpen, () => startAuto())

const logoSrc = computed(
  () => props.settings?.logo || '/images/STREET_DIGITAL_LABS_AFRICA_WITH_WORD.png',
)
const logoAlt = computed(
  () => props.settings?.logo_alt || props.settings?.org_name || 'Street Digital Labs Africa Logo',
)

function prev() {
  go(-1)
  startAuto()
}

function next() {
  go(1)
  startAuto()
}

function selectMember(index: number) {
  if (index === activeIndex.value) return
  slideDir.value = index > activeIndex.value ? 'next' : 'prev'
  activeIndex.value = index
  startAuto()
}

function onStageEnter() {
  hovered.value = true
  clearAuto()
}

function onStageLeave() {
  hovered.value = false
  startAuto()
}

function openPreview(member: TeamMember, book = false) {
  selected.value = member
  bookOnOpen.value = book
  previewOpen.value = true
}

function closeOfficial() {
  previewOpen.value = false
  bookOnOpen.value = false
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startAuto()
})

onUnmounted(() => clearAuto())
</script>

<template>
  <section id="team" class="team-section">
    <div class="container">
      <div class="section-header" data-fade-team>
        <img :src="logoSrc" :alt="logoAlt" class="team-logo" />
        <LandingHeader
          index="06"
          kicker="Leadership"
          title="Our Team Structure"
          description="The dedicated leaders driving digital transformation across Africa."
          accent="green"
        />
      </div>

      <div class="org-chart" data-fade-team>
        <div class="level level-1">
          <div class="org-card card-navy">
            <div class="card-icon-wrap icon-navy">
              <span class="card-icon">{{ level1?.icon || '👥' }}</span>
            </div>
            <div class="card-body">
              <span class="card-title">{{ level1?.title || 'AFRICA THINK TANK COMMISSION' }}</span>
            </div>
          </div>
        </div>

        <div class="connector-v"></div>

        <div class="level level-2">
          <div class="org-card card-orange">
            <div class="card-icon-wrap icon-orange">
              <span class="card-icon">{{ level2?.icon || '👤' }}</span>
            </div>
            <div class="card-body">
              <span class="card-title">{{ level2?.title || 'CHIEF EXECUTIVE OFFICER' }}</span>
              <span class="card-sub">{{ level2?.subtitle || '(CEO)' }}</span>
            </div>
          </div>
        </div>

        <div class="connector-v"></div>

        <div class="level level-3">
          <div class="org-card card-green">
            <div class="card-icon-wrap icon-green">
              <span class="card-icon">{{ level3?.icon || '👤' }}</span>
            </div>
            <div class="card-body">
              <span class="card-title">{{ level3?.title || 'CHIEF OPERATING OFFICER' }}</span>
              <span class="card-sub">{{ level3?.subtitle || '(COO)' }}</span>
            </div>
          </div>
        </div>

        <div class="branch-connector" :style="{ '--director-cols': directorCards.length }">
          <div class="branch-v-top"></div>
          <div class="branch-rail">
            <div class="branch-h" aria-hidden="true"></div>
            <span v-for="n in directorCards.length" :key="n" class="branch-dot"></span>
          </div>
        </div>

        <div class="level level-4" :style="{ '--director-cols': directorCards.length }">
          <div
            v-for="dir in directorCards"
            :key="dir.title"
            class="director-card"
            :style="{ '--accent': dir.color, '--accent2': dir.accent }"
          >
            <div class="dir-icon-wrap" :style="{ background: dir.color }">
              <span class="dir-icon">{{ dir.icon }}</span>
            </div>
            <span class="dir-title">{{ dir.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Meet the Team — featured slider -->
    <div class="meet-slider" data-fade-team>
      <div class="meet-intro">
        <SectionKicker label="People" align="center" accent="orange" />
        <h3 class="meet-title">Meet Our Team</h3>
        <p class="meet-sub">The passionate people behind Street Digital Labs Africa.</p>
      </div>

      <div
        v-if="activeMember"
        class="slider-stage"
        @mouseenter="onStageEnter"
        @mouseleave="onStageLeave"
      >
        <button type="button" class="nav-arrow prev" aria-label="Previous teammate" @click="prev">
          ‹
        </button>
        <button type="button" class="nav-arrow next" aria-label="Next teammate" @click="next">
          ›
        </button>

        <transition :name="slideDir === 'next' ? 'slide-next' : 'slide-prev'" mode="out-in">
          <div :key="activeMember.name + activeIndex" class="featured">
            <div class="featured-copy">
              <h4 class="featured-name">{{ activeMember.name }}</h4>
              <p class="featured-role">{{ activeMember.role }}</p>
              <p class="featured-bio">{{ activeMember.bio }}</p>
              <div class="featured-actions">
                <button
                  v-if="activeMember.id && activeMember.accepts_meetings !== false"
                  type="button"
                  class="btn-primary"
                  @click="openPreview(activeMember, true)"
                >
                  Book a meeting
                </button>
                <button
                  type="button"
                  :class="activeMember.id && activeMember.accepts_meetings !== false ? 'btn-ghost' : 'btn-primary'"
                  @click="openPreview(activeMember, false)"
                >
                  View profile
                </button>
              </div>
            </div>

            <div class="featured-visual">
              <div
                class="portrait"
                :class="{ 'has-photo': activeMember.photo }"
                :style="activeMember.photo ? undefined : { background: activeMember.color || '#0a1f44' }"
              >
                <img
                  v-if="activeMember.photo"
                  :src="activeMember.photo"
                  :alt="activeMember.name"
                />
                <span v-else class="portrait-fallback">
                  {{ activeMember.initials || activeMember.name.slice(0, 1) }}
                </span>
              </div>
            </div>
          </div>
        </transition>

        <div class="thumb-rail">
          <button
            v-for="(member, index) in teamMembers"
            :key="member.name"
            type="button"
            class="thumb"
            :class="{ active: index === activeIndex }"
            @click="selectMember(index)"
          >
            <div class="thumb-avatar" :style="{ background: member.color || '#0a1f44' }">
              <img v-if="member.photo" :src="member.photo" :alt="member.name" />
              <span v-else>{{ member.initials || member.name.slice(0, 1) }}</span>
            </div>
            <div class="thumb-meta">
              <strong>{{ member.name }}</strong>
              <span>{{ member.role }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="join-cta" data-fade-team>
        <p class="join-text">Want to be part of the mission?</p>
        <a href="#contact" class="join-btn">Join Our Team →</a>
      </div>
    </div>

    <OfficialPreviewModal
      :open="previewOpen"
      :official="selected"
      :start-on-book="bookOnOpen"
      @close="closeOfficial"
    />
  </section>
</template>

<style scoped>
.team-section {
  background: #f4f7fb;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}
.section-header :deep(.landing-header) {
  margin-bottom: 0;
}
.team-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 0 auto 1.5rem;
  display: block;
}

/* Org chart */
.org-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 1rem;
}
.level {
  display: flex;
  justify-content: center;
  width: 100%;
}
.org-card {
  display: flex;
  align-items: center;
  border-radius: 14px;
  overflow: hidden;
  min-width: 320px;
  max-width: 380px;
  box-shadow: 0 4px 20px rgba(10, 31, 68, 0.12);
  border: 2px solid transparent;
  transition: transform 0.25s, box-shadow 0.25s;
}
.org-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(10, 31, 68, 0.18);
}
.card-icon-wrap {
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
}
.card-icon {
  font-size: 1.6rem;
  filter: brightness(1.8) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
}
.card-body {
  background: #ffffff;
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-title {
  font-family: 'Poppins', sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
  color: #0a1f44;
  letter-spacing: 0.02em;
  line-height: 1.3;
}
.card-sub {
  font-family: 'Poppins', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 0.2rem;
}
.card-navy { border-color: #0a1f44; }
.icon-navy { background: #0a1f44; }
.icon-navy .card-icon { filter: invert(1); }
.card-orange { border-color: #ff6a00; }
.icon-orange { background: #ff6a00; }
.card-orange .card-sub { color: #ff6a00; }
.card-green { border-color: #0a7a3d; }
.icon-green { background: #0a7a3d; }
.icon-green .card-icon { filter: invert(1); }
.card-green .card-sub { color: #0a7a3d; }
.connector-v {
  width: 2px;
  height: 36px;
  background: #0a7a3d;
  position: relative;
}
.connector-v::before,
.connector-v::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0a7a3d;
  left: 50%;
  transform: translateX(-50%);
}
.connector-v::before { top: -5px; }
.connector-v::after { bottom: -5px; }
.branch-connector {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.branch-v-top {
  width: 2px;
  height: 30px;
  background: #0a7a3d;
}
.branch-rail {
  width: 90%;
  display: grid;
  grid-template-columns: repeat(var(--director-cols, 6), 1fr);
  align-items: start;
}
.branch-h {
  grid-column: 1 / -1;
  height: 2px;
  background: #0a7a3d;
  width: calc(100% * (var(--director-cols, 6) - 1) / var(--director-cols, 6));
  margin-left: calc(100% / var(--director-cols, 6) / 2);
}
.branch-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0a7a3d;
  justify-self: center;
  margin-top: -4px;
}
.level-4 {
  display: grid;
  grid-template-columns: repeat(var(--director-cols, 6), 1fr);
  gap: 0.75rem;
  width: 90%;
  margin-top: 0.5rem;
  align-items: start;
}
.director-card {
  background: #ffffff;
  border: 2px solid var(--accent);
  border-radius: 14px;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
  box-shadow: 0 3px 12px rgba(10, 31, 68, 0.08);
  transition: transform 0.25s, box-shadow 0.25s;
}
.director-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(10, 31, 68, 0.15);
}
.dir-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dir-icon {
  font-size: 1.5rem;
  filter: brightness(1.5) drop-shadow(0 0 3px rgba(255, 255, 255, 0.4));
}
.dir-title {
  font-family: 'Poppins', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0a1f44;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

/* ── Meet Our Team slider ───────────────────────────── */
.meet-slider {
  position: relative;
  margin-top: 1rem;
  padding: 2.5rem 0 0;
  background: #f4f7fb;
  border-top: 1px solid rgba(10, 31, 68, 0.06);
  overflow: hidden;
}
.meet-intro {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 1.5rem;
  padding: 0 1rem;
}
.meet-title {
  margin: 0.5rem 0 0.35rem;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 800;
  color: #0a1f44;
}
.meet-sub {
  margin: 0;
  color: #5a6a85;
}

.slider-stage {
  position: relative;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 3.5rem 0;
  min-height: 520px;
}

.nav-arrow {
  position: absolute;
  top: 38%;
  z-index: 5;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid rgba(10, 31, 68, 0.15);
  background: rgba(255, 255, 255, 0.9);
  color: #0a1f44;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.nav-arrow:hover {
  background: #fff;
  border-color: #ff6a00;
  color: #ff6a00;
  transform: scale(1.05);
}
.nav-arrow.prev { left: 0.75rem; }
.nav-arrow.next { right: 0.75rem; }

.featured {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 2.5rem;
  align-items: center;
  padding: 1rem 0 8.5rem;
}
.featured-copy {
  padding-left: 0.5rem;
}
.featured-name {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0a1f44;
  line-height: 1.1;
}
.featured-role {
  margin: 0.65rem 0 1.1rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ff6a00;
}
.featured-bio {
  margin: 0 0 1.5rem;
  color: #5a6a85;
  line-height: 1.75;
  font-size: 1rem;
  max-width: 42ch;
}
.featured-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.btn-primary,
.btn-ghost {
  border: 0;
  border-radius: 999px;
  padding: 0.8rem 1.35rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: #fff;
  box-shadow: 0 8px 24px rgba(255, 106, 0, 0.35);
}
.btn-primary:hover {
  transform: translateY(-2px);
}
.btn-ghost {
  background: transparent;
  color: #0a1f44;
  border: 1.5px solid rgba(10, 31, 68, 0.18);
}
.btn-ghost:hover {
  border-color: #0a7a3d;
  color: #0a7a3d;
}

.featured-visual {
  display: flex;
  justify-content: center;
}
.portrait {
  width: min(420px, 100%);
  aspect-ratio: 4 / 5;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.18);
  display: grid;
  place-items: center;
}
.portrait.has-photo {
  background: transparent;
  box-shadow: none;
}
.portrait img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
  display: block;
}
.portrait-fallback {
  font-size: 4rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Poppins', sans-serif;
}

/* Frosted thumbnail rail */
.thumb-rail {
  position: absolute;
  left: 3.5rem;
  right: 3.5rem;
  bottom: 0;
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  padding: 1rem 1.1rem 1.15rem;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-bottom: 0;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 40px rgba(10, 31, 68, 0.08);
  scrollbar-width: thin;
}
.thumb {
  flex: 1 0 auto;
  min-width: 120px;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 14px;
  font: inherit;
  color: inherit;
  transition: background 0.2s;
}
.thumb:hover,
.thumb.active {
  background: rgba(255, 106, 0, 0.08);
}
.thumb-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid transparent;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  transition: border-color 0.2s, transform 0.2s;
}
.thumb.active .thumb-avatar {
  border-color: #ff6a00;
  transform: scale(1.06);
  box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.2);
}
.thumb-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-meta {
  text-align: center;
  display: grid;
  gap: 0.1rem;
}
.thumb-meta strong {
  font-size: 0.78rem;
  color: #0a1f44;
  line-height: 1.25;
}
.thumb-meta span {
  font-size: 0.68rem;
  color: #5a6a85;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-next-enter-from {
  opacity: 0;
  transform: translateX(48px);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-36px);
}
.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(36px);
}

@media (prefers-reduced-motion: reduce) {
  .slide-next-enter-active,
  .slide-next-leave-active,
  .slide-prev-enter-active,
  .slide-prev-leave-active {
    transition: opacity 0.2s ease;
  }
  .slide-next-enter-from,
  .slide-next-leave-to,
  .slide-prev-enter-from,
  .slide-prev-leave-to {
    transform: none;
  }
}

.join-cta {
  text-align: center;
  padding: 2.5rem 2rem;
  background: linear-gradient(135deg, #0a1f44, #163566);
  border-radius: 20px;
  color: white;
  margin-top: 2rem;
}
.join-text {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
  opacity: 0.9;
}
.join-btn {
  display: inline-block;
  text-decoration: none;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 0.8rem 2.25rem;
  border-radius: 50px;
  box-shadow: 0 6px 24px rgba(255, 106, 0, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.join-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 106, 0, 0.5);
}

[data-fade-team] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
[data-fade-team].is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (min-width: 1100px) {
  .thumb-rail {
    left: 1.25rem;
    right: 1.25rem;
    justify-content: center;
    overflow-x: visible;
  }
  .thumb {
    flex: 1 1 0;
    min-width: 0;
    max-width: 180px;
  }
}

@media (max-width: 900px) {
  .level-4 {
    grid-template-columns: repeat(3, 1fr);
    width: 100%;
  }
  .branch-rail {
    width: 100%;
  }
  .featured {
    grid-template-columns: 1fr;
    text-align: center;
    padding-bottom: 9rem;
    gap: 1.5rem;
  }
  .featured-bio {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .featured-actions {
    justify-content: center;
  }
  .featured-copy {
    padding-left: 0;
    order: 2;
  }
  .featured-visual {
    order: 1;
  }
  .portrait {
    width: min(280px, 70vw);
  }
  .slider-stage {
    padding: 0 2.75rem;
  }
  .thumb-rail {
    left: 0.75rem;
    right: 0.75rem;
  }
}

@media (max-width: 580px) {
  .level-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  .org-card {
    min-width: 220px;
    max-width: 100%;
  }
  .branch-rail {
    display: none;
  }
  .nav-arrow {
    width: 40px;
    height: 40px;
  }
  .thumb {
    min-width: 120px;
  }
}
</style>
