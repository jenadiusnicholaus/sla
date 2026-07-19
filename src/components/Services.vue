<script setup lang="ts">
import { computed } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'

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
      <div class="section-header" data-fade-svc>
        <span class="eyebrow">What We Do</span>
        <h2 class="section-title">Our Programs</h2>
        <div class="title-bar"></div>
        <p class="section-desc">Comprehensive digital skills solutions tailored to empower African communities and create lasting change.</p>
      </div>

      <div class="programs-grid">
        <article
          v-for="program in displayPrograms"
          :key="program.title"
          class="program-card"
          data-fade-svc
        >
          <div class="card-top" :style="{ borderTopColor: program.tagColor }">
            <div class="program-emoji">{{ program.emoji }}</div>
            <span class="program-tag" :style="{ color: program.tagColor, background: program.tagColor + '18', borderColor: program.tagColor + '44' }">
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

.section-header { text-align: center; margin-bottom: 4rem; }
.eyebrow {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #163566; background: rgba(22,53,102,0.08);
  border: 1px solid rgba(22,53,102,0.18);
  padding: 0.3rem 1rem; border-radius: 50px;
  margin-bottom: 1rem; font-family: 'Poppins', sans-serif;
}
.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; color: #0a1f44;
  margin-bottom: 0.75rem; font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;
}
.title-bar {
  width: 56px; height: 4px;
  background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.5rem; border-radius: 2px;
}
.section-desc { font-size: 1.05rem; color: #5a6a85; max-width: 650px; margin: 0 auto; line-height: 1.8; }

/* Grid */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Card */
.program-card {
  background: white; border-radius: 20px;
  padding: 2rem; display: flex; flex-direction: column; gap: 0.75rem;
  box-shadow: 0 2px 16px rgba(10,31,68,0.07);
  border: 1px solid rgba(10,31,68,0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}
.program-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(10,31,68,0.12); }

.card-top { display: flex; justify-content: space-between; align-items: flex-start; border-top: 4px solid; border-radius: 4px; padding-top: 1.25rem; }
.program-emoji { font-size: 2.4rem; }
.program-tag {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em;
  padding: 0.28rem 0.85rem; border-radius: 20px; border: 1px solid;
  font-family: 'Poppins', sans-serif; white-space: nowrap;
}
.program-title { font-size: 1.15rem; font-weight: 700; color: #0a1f44; font-family: 'Poppins', sans-serif; line-height: 1.3; }
.program-desc  { font-size: 0.9rem; color: #5a6a85; line-height: 1.75; flex: 1; }
.learn-more {
  font-size: 0.88rem; font-weight: 700; text-decoration: none;
  font-family: 'Poppins', sans-serif;
  transition: letter-spacing 0.2s;
  align-self: flex-start;
}
.learn-more:hover { letter-spacing: 0.02em; }

/* Fade-up */
[data-fade-svc] {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-fade-svc].is-visible { opacity: 1; transform: translateY(0); }
</style>
