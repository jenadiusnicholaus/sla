<script setup lang="ts">
import { computed } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import LandingIcon from '@/components/landing/LandingIcon.vue'

interface Value {
  emoji: string
  title: string
  description: string
  color: string
}

const props = defineProps<{
  values?: Value[]
}>()

const DEFAULT_VALUES: Value[] = [
  { emoji: '🤲', title: 'Inclusion', description: 'Equal digital opportunities for every African, regardless of background.', color: '#ff6a00' },
  { emoji: '💡', title: 'Innovation', description: 'We foster creativity and build tech solutions for real community challenges.', color: '#0a7a3d' },
  { emoji: '🎓', title: 'Empowerment', description: 'Equipping individuals with the skills, mindset, and network for success.', color: '#ff6a00' },
  { emoji: '🤝', title: 'Integrity', description: 'Acting with honesty, transparency, and deep respect for all stakeholders.', color: '#0a7a3d' },
  { emoji: '🌐', title: 'Community', description: 'Building lasting networks that generate sustainable, measurable impact.', color: '#ff6a00' },
]

const displayValues = computed(() => (props.values?.length ? props.values : DEFAULT_VALUES))

useFadeUp('[data-fade-val]')
</script>

<template>
  <section id="values" class="brand-values">
    <div class="container">
      <LandingHeader
        index="04"
        kicker="Our Foundation"
        title="Brand Values"
        description="The principles that guide every decision, program, and partnership at Street Digital Labs Africa."
        accent="green"
        data-fade-val
      />

      <div class="values-grid">
        <div
          v-for="(v, i) in displayValues"
          :key="v.title"
          class="value-card"
          data-fade-val
        >
          <span class="value-index">{{ String(i + 1).padStart(2, '0') }}</span>
          <div
            class="value-icon-wrap"
            :style="{ '--tile-color': v.color, '--tile-bg': v.color + '10', '--tile-border': v.color + '30' }"
          >
            <LandingIcon :emoji="v.emoji" />
          </div>
          <h3 class="value-title">{{ v.title }}</h3>
          <p class="value-desc">{{ v.description }}</p>
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

/* Grid */
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}

/* Card */
.value-card {
  background: #ffffff;
  border: 1px solid rgba(10, 31, 68, 0.08);
  border-radius: 6px;
  padding: 1.75rem 1.5rem 1.5rem;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.85rem;
}
.value-card:hover {
  border-color: rgba(10, 31, 68, 0.16);
  box-shadow: 0 8px 24px rgba(10, 31, 68, 0.06);
}

.value-index {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: rgba(10, 31, 68, 0.28);
}

.value-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid var(--tile-border, rgba(10, 31, 68, 0.1));
  background: var(--tile-bg, rgba(10, 31, 68, 0.04));
  color: var(--tile-color, #0a1f44);
  display: grid;
  place-items: center;
}

.value-title {
  font-family: 'Poppins', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0a1f44;
}
.value-desc  { font-size: 0.88rem; color: rgba(10, 31, 68, 0.62); line-height: 1.7; }

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

