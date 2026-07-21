<script setup lang="ts">
import { computed } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import LandingIcon from '@/components/landing/LandingIcon.vue'

interface Program {
  emoji: string
  title: string
  description: string
  tag: string
  tag_color?: string
  tagColor?: string
  learn_more_href?: string
}

const props = defineProps<{
  programs?: Program[]
}>()

const DEFAULT_PROGRAMS: Program[] = [
  {
    emoji: '💻',
    title: 'Digital Skills Training',
    description: 'Hands-on training in coding, web development, graphic design, and digital marketing for young Africans.',
    tag: 'Flagship',
    tagColor: '#ff6a00',
  },
  {
    emoji: '🚀',
    title: 'Innovation Lab',
    description: 'A creative space where participants develop tech solutions to solve real community challenges across Africa.',
    tag: 'Innovation',
    tagColor: '#0a7a3d',
  },
  {
    emoji: '🎓',
    title: 'Mentorship & Coaching',
    description: 'One-on-one mentorship from industry experts guiding participants on career paths and entrepreneurship.',
    tag: 'Empowerment',
    tagColor: '#163566',
  },
  {
    emoji: '🤝',
    title: 'Community Outreach',
    description: 'Inclusive programs bringing digital skills to underserved communities, schools, and grassroots organizations.',
    tag: 'Inclusion',
    tagColor: '#7c3aed',
  },
]

const displayPrograms = computed(() => {
  const list = props.programs?.length ? props.programs : DEFAULT_PROGRAMS
  return list.map((p) => ({
    ...p,
    tagColor: p.tag_color || p.tagColor || '#ff6a00',
    learnMoreHref: p.learn_more_href || '#contact',
  }))
})

useFadeUp('[data-fade-svc]')
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <LandingHeader
        index="05"
        kicker="What We Do"
        title="Our Programs"
        description="Comprehensive digital skills solutions tailored to empower African communities and create lasting change."
        accent="navy"
        data-fade-svc
      />

      <div class="programs-grid">
        <article
          v-for="program in displayPrograms"
          :key="program.title"
          class="program-card"
          data-fade-svc
        >
          <div class="card-top">
            <div class="program-icon">
              <LandingIcon :emoji="program.emoji" />
            </div>
            <span
              class="meta-tag program-tag"
              :style="{ color: program.tagColor, borderColor: program.tagColor + '55', background: program.tagColor + '0d' }"
            >
              {{ program.tag }}
            </span>
          </div>
          <h3 class="program-title">{{ program.title }}</h3>
          <p class="program-desc">{{ program.description }}</p>
          <a :href="program.learnMoreHref" class="learn-more" :style="{ color: program.tagColor }">
            Learn more →
          </a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services { background: #f4f7fb; }

.container { max-width: 1200px; margin: 0 auto; padding: 3rem 0.5rem; }

/* Grid */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* Card */
.program-card {
  background: white;
  border-radius: 6px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid rgba(10,31,68,0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.program-card:hover {
  border-color: rgba(10,31,68,0.14);
  box-shadow: 0 10px 28px rgba(10,31,68,0.07);
}

.card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.program-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(10, 31, 68, 0.1);
  background: rgba(10, 31, 68, 0.03);
  color: #0a1f44;
  display: grid;
  place-items: center;
}
.program-icon :deep(svg) { width: 22px; height: 22px; }
.program-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem; font-weight: 700; color: #0a1f44; line-height: 1.3;
}
.program-desc  { font-size: 0.9rem; color: #5a6a85; line-height: 1.75; flex: 1; }
.learn-more {
  font-size: 0.82rem; font-weight: 700; text-decoration: none;
  font-family: 'Poppins', sans-serif;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: opacity 0.2s;
  align-self: flex-start;
}
.learn-more:hover { opacity: 0.7; }

/* Fade-up */
[data-fade-svc] {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-fade-svc].is-visible { opacity: 1; transform: translateY(0); }
</style>
