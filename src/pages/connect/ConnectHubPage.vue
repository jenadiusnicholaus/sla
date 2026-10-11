<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHomepageCms } from '@/composables/useHomepageCms'

const router = useRouter()
const { load, settings, socialLinks } = useHomepageCms()

onMounted(() => {
  load()
})

const orgName = computed(() => settings.value?.org_short_name || settings.value?.org_name || 'Streetlabs Africa')
const websiteUrl = computed(() => settings.value?.website_url || 'https://streetlabsafrica.org')

const cards = computed(() => [
  {
    key: 'social',
    title: 'Social Media',
    description: 'Connect with us across our social platforms and be part of our growing community',
    cta: 'Social Media',
    tone: 'green',
    to: '/connect/social',
    external: false,
  },
  {
    key: 'website',
    title: 'Website',
    description: 'Explore our website platforms and digital projects',
    cta: 'Explore website',
    tone: 'navy',
    href: websiteUrl.value,
    external: true,
  },
  {
    key: 'contact',
    title: 'Contact',
    description: 'Get in touch with the Streetlabs Africa team',
    cta: 'Contact Us',
    tone: 'orange',
    to: '/connect/contact',
    external: false,
  },
])

function openCard(card) {
  if (card.external && card.href) {
    window.open(card.href, '_blank', 'noopener,noreferrer')
    return
  }
  if (card.to) router.push(card.to)
}

const socialCount = computed(() => (socialLinks.value || []).filter((s) => s.is_active !== false).length)
</script>

<template>
  <div class="hub-page">
    <p class="watermark" aria-hidden="true">AFRICA</p>

    <div class="hub-grid">
      <section class="hub-copy connect-rise">
        <p class="eyebrow">Welcome to</p>
        <h1>
          <span class="name-navy">Streetlabs</span>
          <span class="name-green"> Africa</span>
        </h1>
        <p class="lede">
          Streetlabs Africa is a digital innovation platform empowering African communities through
          technology, creativity and collaboration. We create solutions, build partnerships and unlock
          opportunities for a more inclusive and prosperous Africa.
        </p>
        <div class="connect-bars" aria-hidden="true">
          <span class="navy" /><span class="orange" /><span class="green" />
        </div>
      </section>

      <section class="hub-brand connect-rise d1" aria-label="Street Labs Africa logo">
        <img
          src="/images/STREET_DIGITAL_LABS_AFRICA_FULL.png"
          :alt="orgName"
          class="brand-mark"
        />
      </section>
    </div>

    <div class="hub-cards">
      <button
        v-for="(card, i) in cards"
        :key="card.key"
        type="button"
        class="hub-card connect-rise"
        :class="[card.tone, `d${i + 2}`]"
        @click="openCard(card)"
      >
        <div class="card-icon" aria-hidden="true">
          <svg v-if="card.key === 'social'" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="currentColor" opacity="0.15" />
            <circle cx="22" cy="26" r="5" fill="currentColor" />
            <circle cx="42" cy="26" r="5" fill="currentColor" />
            <circle cx="32" cy="40" r="5" fill="currentColor" />
            <path d="M26 28.5 38 28.5M32 31v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
          <svg v-else-if="card.key === 'website'" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="currentColor" opacity="0.15" />
            <circle cx="32" cy="32" r="14" stroke="currentColor" stroke-width="2.5" />
            <ellipse cx="32" cy="32" rx="6" ry="14" stroke="currentColor" stroke-width="2.5" />
            <path d="M18 32h28M20 25h24M20 39h24" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="32" fill="currentColor" opacity="0.15" />
            <rect x="16" y="22" width="32" height="22" rx="3" stroke="currentColor" stroke-width="2.5" />
            <path d="m18 25 14 10 14-10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2>{{ card.title }}</h2>
        <p>{{ card.description }}</p>
        <span class="card-cta">
          {{ card.cta }}
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
    </div>

    <p v-if="socialCount" class="hub-foot connect-rise d5">
      {{ socialCount }} social channel{{ socialCount === 1 ? '' : 's' }} ready · Street Labs Africa
    </p>
  </div>
</template>

<style scoped>
.hub-page {
  position: relative;
  padding-top: 0.5rem;
}

.watermark {
  display: none;
}

.hub-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2.5rem;
}

.eyebrow {
  margin: 0 0 0.45rem;
  color: var(--green);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 1rem;
  font-size: clamp(2.1rem, 5vw, 3.35rem);
  line-height: 1.08;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.name-navy { color: var(--navy); }
.name-green { color: var(--green); }

.lede {
  margin: 0;
  max-width: 36rem;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
}

.hub-brand {
  display: grid;
  place-items: center;
}

.brand-mark {
  width: min(100%, 340px);
  height: auto;
  display: block;
}

.hub-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.15rem;
}

.hub-card {
  text-align: left;
  border: 1px solid transparent;
  border-radius: 18px;
  padding: 1.35rem 1.25rem 1.2rem;
  cursor: pointer;
  font: inherit;
  display: grid;
  gap: 0.7rem;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  box-shadow: 0 10px 28px rgba(10, 31, 68, 0.06);
}

.hub-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(10, 31, 68, 0.12);
}

.hub-card.green {
  background: linear-gradient(180deg, #eef8f1, #f7fcf8);
  border-color: rgba(10, 122, 61, 0.14);
  color: var(--green);
}
.hub-card.navy {
  background: linear-gradient(180deg, #eef3f9, #f7f9fc);
  border-color: rgba(10, 31, 68, 0.12);
  color: var(--navy);
}
.hub-card.orange {
  background: linear-gradient(180deg, #fff4ec, #fffaf6);
  border-color: rgba(255, 106, 0, 0.16);
  color: var(--orange);
}

.card-icon {
  width: 64px;
  height: 64px;
  color: inherit;
}
.card-icon svg {
  width: 100%;
  height: 100%;
}

.hub-card h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: inherit;
}

.hub-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.55;
  min-height: 2.8em;
}

.card-cta {
  margin-top: 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #fff;
  font-weight: 700;
  font-size: 0.92rem;
}

.hub-card.green .card-cta { background: var(--green); }
.hub-card.navy .card-cta { background: var(--navy); }
.hub-card.orange .card-cta { background: var(--orange); }

.card-cta svg {
  width: 18px;
  height: 18px;
}

.hub-foot {
  margin: 1.75rem 0 0;
  text-align: center;
  color: var(--muted);
  font-size: 0.82rem;
}

@media (max-width: 900px) {
  .hub-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .lede {
    margin-inline: auto;
  }
  .connect-bars {
    justify-content: center;
  }
  .watermark {
    display: none;
  }
  .hub-cards {
    grid-template-columns: 1fr;
  }
  .brand-mark {
    width: min(70vw, 260px);
  }
}
</style>
