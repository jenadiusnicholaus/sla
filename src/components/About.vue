<script setup lang="ts">
import { onMounted } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'

interface Stat {
  number: string
  label: string
}

interface AboutData {
  title: string
  description: string
  mission: string
  vision: string
  stats: Stat[]
}

const aboutData: AboutData = {
  title: 'About Street Labs',
  description:
    'Street Digital Labs Africa (Street Labs) is a digital skills and innovation hub committed to empowering young people and communities across Africa through technology, training, and inclusive opportunities.',
  mission:
    'To empower Africans with digital skills, innovation, and opportunities for a better future.',
  vision:
    'An inclusive Africa where everyone thrives in the digital economy.',
  stats: [
    { number: '10K+', label: 'Youth Trained' },
    { number: '36',   label: 'States Reached' },
    { number: '98%',  label: 'Success Rate' },
    { number: '50+',  label: 'Expert Trainers' },
  ],
}

useFadeUp('[data-fade-about]')
</script>

<template>
  <section id="about" class="about">
    <div class="container">
      <!-- Section header -->
      <div class="about-header" data-fade-about>
        <span class="eyebrow">Who We Are</span>
        <h2 class="section-title">{{ aboutData.title }}</h2>
        <div class="title-bar"></div>
        <p class="section-description">{{ aboutData.description }}</p>
      </div>

      <!-- Mission / Vision cards -->
      <div class="mv-grid">
        <div class="mv-card mission-card" data-fade-about>
          <div class="mv-icon-wrap mission-icon">
            <span class="mv-icon">🎯</span>
          </div>
          <div class="mv-body">
            <h3 class="mv-heading">Our Mission</h3>
            <p class="mv-text">{{ aboutData.mission }}</p>
          </div>
        </div>
        <div class="mv-card vision-card" data-fade-about>
          <div class="mv-icon-wrap vision-icon">
            <span class="mv-icon">🌍</span>
          </div>
          <div class="mv-body">
            <h3 class="mv-heading">Our Vision</h3>
            <p class="mv-text">{{ aboutData.vision }}</p>
          </div>
        </div>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid">
        <div
          v-for="stat in aboutData.stats"
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

/* Eyebrow + title */
.about-header { text-align: center; margin-bottom: 4rem; }
.eyebrow {
  display: inline-block;
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: #ff6a00;
  font-family: 'Poppins', sans-serif;
  background: rgba(255,106,0,0.08); border: 1px solid rgba(255,106,0,0.2);
  padding: 0.3rem 1rem; border-radius: 50px; margin-bottom: 1rem;
}
.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800;
  color: #0a1f44; margin-bottom: 0.75rem;
  font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;
}
.title-bar {
  width: 56px; height: 4px; background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.5rem; border-radius: 2px;
}
.section-description {
  font-size: 1.05rem; color: #5a6a85;
  max-width: 700px; margin: 0 auto; line-height: 1.8;
}

/* Mission / Vision */
.mv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
.mv-card {
  display: flex; align-items: flex-start; gap: 1.25rem;
  padding: 2.25rem; border-radius: 18px;
}
.mission-card { background: #fff8f3; border: 1.5px solid rgba(255,106,0,0.15); }
.vision-card  { background: #f0faf4; border: 1.5px solid rgba(10,122,61,0.15); }

.mv-icon-wrap {
  width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
}
.mission-icon { background: rgba(255,106,0,0.12); }
.vision-icon  { background: rgba(10,122,61,0.12); }

.mv-heading {
  font-size: 1.15rem; font-weight: 700; color: #0a1f44;
  margin-bottom: 0.5rem; font-family: 'Poppins', sans-serif;
}
.mv-text { color: #5a6a85; line-height: 1.75; font-size: 0.95rem; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.stat-card {
  background: linear-gradient(135deg, #0a1f44 0%, #163566 100%);
  color: white; padding: 2rem 1.5rem;
  border-radius: 18px; text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255,255,255,0.06);
}
.stat-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(10,31,68,0.25); }
.stat-number {
  font-size: 2.6rem; font-weight: 800; color: #ff6a00;
  margin-bottom: 0.4rem; font-family: 'Poppins', sans-serif; line-height: 1;
}
.stat-label { font-size: 0.88rem; opacity: 0.75; letter-spacing: 0.02em; }

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
