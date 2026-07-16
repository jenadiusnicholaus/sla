<script setup lang="ts">
import { useFadeUp } from '@/composables/useFadeUp'

interface Value {
  emoji: string
  title: string
  description: string
  color: string
}

const values: Value[] = [
  { emoji: '🤲', title: 'Inclusion',   description: 'Equal digital opportunities for every African, regardless of background.',    color: '#ff6a00' },
  { emoji: '💡', title: 'Innovation',  description: 'We foster creativity and build tech solutions for real community challenges.', color: '#0a7a3d' },
  { emoji: '🎓', title: 'Empowerment', description: 'Equipping individuals with the skills, mindset, and network for success.',      color: '#ff6a00' },
  { emoji: '🤝', title: 'Integrity',   description: 'Acting with honesty, transparency, and deep respect for all stakeholders.',   color: '#0a7a3d' },
  { emoji: '🌐', title: 'Community',   description: 'Building lasting networks that generate sustainable, measurable impact.',      color: '#ff6a00' },
]

useFadeUp('[data-fade-val]')
</script>

<template>
  <section id="values" class="brand-values">
    <div class="container">
      <!-- Header -->
      <div class="section-header" data-fade-val>
        <span class="eyebrow">Our Foundation</span>
        <h2 class="section-title">Brand Values</h2>
        <div class="title-bar"></div>
        <p class="section-desc">The principles that guide every decision, program, and partnership at Street Digital Labs Africa.</p>
      </div>

      <!-- Values grid -->
      <div class="values-grid">
        <div
          v-for="v in values"
          :key="v.title"
          class="value-card"
          data-fade-val
        >
          <div
            class="value-icon-wrap"
            :style="{ background: v.color + '18', borderColor: v.color + '44' }"
          >
            <span class="value-icon">{{ v.emoji }}</span>
          </div>
          <h3 class="value-title" :style="{ color: v.color }">{{ v.title }}</h3>
          <p class="value-desc">{{ v.description }}</p>
          <div class="value-accent" :style="{ background: v.color }"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.brand-values {
  background: #f4f6fa;
  color: #212121;
  padding: 2rem 0;
}

.container { max-width: 1200px; margin: 0 auto; padding: 4rem 0.5rem; }

.section-header { text-align: center; margin-bottom: 4rem; }
.eyebrow {
  display: inline-block; font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: #ff6a00; background: rgba(255,106,0,0.1);
  border: 1px solid rgba(255,106,0,0.25);
  padding: 0.3rem 1rem; border-radius: 50px;
  margin-bottom: 1rem; font-family: 'Poppins', sans-serif;
}
.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800;
  color: #0a1f44; margin-bottom: 0.75rem;
  font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;
}
.title-bar {
  width: 56px; height: 4px;
  background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.5rem; border-radius: 2px;
}
.section-desc {
  font-size: 1.05rem;
  color: rgba(10, 31, 68, 0.65);
  max-width: 600px; margin: 0 auto; line-height: 1.8;
}

/* Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.75rem;
}

/* Card */
.value-card {
  background: #ffffff;
  border: 1px solid rgba(10, 31, 68, 0.08);
  border-radius: 20px; padding: 2rem 1.75rem;
  text-align: center; position: relative; overflow: hidden;
  transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  display: flex; flex-direction: column; align-items: center; gap: 0.85rem;
  box-shadow: 0 2px 12px rgba(10, 31, 68, 0.06);
}
.value-card:hover {
  background: #fff;
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(10, 31, 68, 0.12);
}
.value-accent {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; border-radius: 0 0 20px 20px;
  opacity: 0.6; transition: opacity 0.3s;
}
.value-card:hover .value-accent { opacity: 1; }

.value-icon-wrap {
  width: 64px; height: 64px; border-radius: 16px;
  border: 1.5px solid; display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s;
}
.value-card:hover .value-icon-wrap { transform: scale(1.1); }
.value-icon { font-size: 1.75rem; }

.value-title { font-size: 1.1rem; font-weight: 700; font-family: 'Poppins', sans-serif; }
.value-desc  { font-size: 0.88rem; color: rgba(10, 31, 68, 0.6); line-height: 1.7; }

/* Fade-up */
[data-fade-val] {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
[data-fade-val].is-visible { opacity: 1; transform: translateY(0); }

@media (max-width: 640px) {
  .values-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

