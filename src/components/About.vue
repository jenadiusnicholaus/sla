<script setup lang="ts">
import { computed } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import LandingIcon from '@/components/landing/LandingIcon.vue'

interface Stat {
  value?: string
  number?: string
  label: string
}

interface AboutData {
  eyebrow?: string
  title?: string
  description?: string
  mission_title?: string
  mission_text?: string
  mission_icon?: string
  vision_title?: string
  vision_text?: string
  vision_icon?: string
}

const props = defineProps<{
  about?: AboutData | null
  stats?: Stat[]
}>()

const DEFAULT_STATS: Stat[] = [
  { number: '10K+', label: 'Youth Trained' },
  { number: '36', label: 'States Reached' },
  { number: '98%', label: 'Success Rate' },
  { number: '50+', label: 'Expert Trainers' },
]

const eyebrow = computed(() => props.about?.eyebrow || 'Who We Are')
const title = computed(() => props.about?.title || 'About Street Labs')
const description = computed(
  () =>
    props.about?.description ||
    'Street Digital Labs Africa (Street Labs) is a digital skills and innovation hub committed to empowering young people and communities across Africa through technology, training, and inclusive opportunities.',
)
const missionTitle = computed(() => props.about?.mission_title || 'Our Mission')
const missionText = computed(
  () =>
    props.about?.mission_text ||
    'To empower Africans with digital skills, innovation, and opportunities for a better future.',
)
const missionIcon = computed(() => props.about?.mission_icon || '🎯')
const visionTitle = computed(() => props.about?.vision_title || 'Our Vision')
const visionText = computed(
  () =>
    props.about?.vision_text ||
    'An inclusive Africa where everyone thrives in the digital economy.',
)
const visionIcon = computed(() => props.about?.vision_icon || '🌍')
const displayStats = computed(() => {
  if (props.stats?.length) {
    return props.stats.map((s) => ({
      number: s.value || s.number || '',
      label: s.label,
    }))
  }
  return DEFAULT_STATS
})

useFadeUp('[data-fade-about]')
</script>

<template>
  <section id="about" class="about">
    <div class="container">
      <LandingHeader
        index="03"
        :kicker="eyebrow"
        :title="title"
        :description="description"
        data-fade-about
      />

      <div class="mv-grid">
        <div class="mv-card mission-card" data-fade-about>
          <div class="mv-icon-wrap mission-icon">
            <LandingIcon :emoji="missionIcon" name="target" />
          </div>
          <div class="mv-body">
            <h3 class="mv-heading">{{ missionTitle }}</h3>
            <p class="mv-text">{{ missionText }}</p>
          </div>
        </div>
        <div class="mv-card vision-card" data-fade-about>
          <div class="mv-icon-wrap vision-icon">
            <LandingIcon :emoji="visionIcon" name="globe" />
          </div>
          <div class="mv-body">
            <h3 class="mv-heading">{{ visionTitle }}</h3>
            <p class="mv-text">{{ visionText }}</p>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div
          v-for="stat in displayStats"
          :key="stat.label"
          class="stat-card"
          data-fade-about
        >
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about { background: #ffffff; }

.container { max-width: 1200px; margin: 0 auto; padding: 3rem 0.5rem; }

/* Mission / Vision */
.mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
.mv-card {
  display: flex; align-items: flex-start; gap: 1.25rem;
  padding: 2rem; border-radius: 6px;
  border-left: 3px solid;
}
.mission-card { background: #fafbfc; border-color: #ff6a00; border-top: 1px solid rgba(10, 31, 68, 0.06); border-right: 1px solid rgba(10, 31, 68, 0.06); border-bottom: 1px solid rgba(10, 31, 68, 0.06); }
.vision-card  { background: #fafbfc; border-color: #0a7a3d; border-top: 1px solid rgba(10, 31, 68, 0.06); border-right: 1px solid rgba(10, 31, 68, 0.06); border-bottom: 1px solid rgba(10, 31, 68, 0.06); }

.mv-icon-wrap {
  width: 52px; height: 52px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.mission-icon { background: rgba(255,106,0,0.08); color: #ff6a00; border: 1px solid rgba(255,106,0,0.2); }
.vision-icon  { background: rgba(10,122,61,0.08); color: #0a7a3d; border: 1px solid rgba(10,122,61,0.2); }

.mv-heading {
  font-family: 'Poppins', sans-serif;
  font-size: 1.35rem; font-weight: 700; color: #0a1f44;
  margin-bottom: 0.5rem;
}
.mv-text { color: #5a6a85; line-height: 1.75; font-size: 0.95rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(10, 31, 68, 0.08); border: 1px solid rgba(10, 31, 68, 0.08); border-radius: 6px; overflow: hidden; }
.stat-card {
  background: #fff;
  color: #0a1f44; padding: 2rem 1.5rem;
  text-align: center;
  transition: background 0.2s;
}
.stat-card:hover { background: #fafbfc; }
.stat-number {
  font-family: 'Poppins', sans-serif;
  font-size: 2.75rem; font-weight: 800; color: #ff6a00;
  margin-bottom: 0.35rem; line-height: 1;
}
.stat-label { font-size: 0.82rem; color: #5a6a85; letter-spacing: 0.04em; text-transform: uppercase; font-weight: 600; }

/* Fade-up animation */
[data-fade-about] {
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
[data-fade-about].is-visible { opacity: 1; transform: translateY(0); }

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .mv-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
