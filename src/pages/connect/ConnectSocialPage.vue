<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHomepageCms } from '@/composables/useHomepageCms'

const router = useRouter()
const { load, settings } = useHomepageCms()

onMounted(() => {
  load()
})

const CATALOG = [
  {
    platform: 'instagram',
    label: 'Instagram',
    cta: 'Follow Us',
    tone: 'instagram',
    url: 'https://www.instagram.com/streetlabsafrica/',
  },
  {
    platform: 'twitter',
    label: 'x(Twitter)',
    cta: 'Follow Us',
    tone: 'x',
    url: 'https://x.com/streetlabafrica',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    cta: 'Connect with Us',
    tone: 'linkedin',
    url: 'https://www.linkedin.com/in/streetlabs-africa-6b3304424',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    cta: 'Follow Us',
    tone: 'facebook',
    url: 'https://www.facebook.com/share/1MVuY9MMuu/',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    cta: 'Follow Us',
    tone: 'tiktok',
    url: 'https://www.tiktok.com/@streetlabs.africa',
  },
]

const channels = computed(() => CATALOG)

const handle = computed(() => settings.value?.social_handle || '@Streetlabafrica')
</script>

<template>
  <div class="social-page">
    <p class="watermark" aria-hidden="true">AFRICA</p>

    <button type="button" class="connect-back" @click="router.push('/connect')">
      ← Back
    </button>

    <header class="social-head connect-rise">
      <h1>
        <span class="t-orange">Connect with</span>
        <span class="t-navy"> Streetlabs</span>
        <span class="t-green"> Africa</span>
      </h1>
      <div class="connect-bars center" aria-hidden="true">
        <span class="navy" /><span class="orange" /><span class="green" />
      </div>
      <p>
        Follow Streetlabs Africa across our social platforms to discover our latest innovation,
        stories, opportunities, events and impact across Africa.
      </p>
    </header>

    <div class="social-grid">
      <a
        v-for="(item, i) in channels"
        :key="item.platform"
        class="social-card connect-rise"
        :class="[item.tone, `d${i + 1}`, i >= 3 ? 'bottom' : '']"
        :href="item.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="logo" aria-hidden="true">
          <!-- Instagram glyph -->
          <svg v-if="item.platform === 'instagram'" viewBox="0 0 48 48" fill="none">
            <defs>
              <radialGradient id="ig-bg" cx="30%" cy="107%" r="150%">
                <stop offset="0%" stop-color="#fdf497" />
                <stop offset="5%" stop-color="#fdf497" />
                <stop offset="45%" stop-color="#fd5949" />
                <stop offset="60%" stop-color="#d6249f" />
                <stop offset="90%" stop-color="#285AEB" />
              </radialGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#ig-bg)" />
            <rect x="12" y="12" width="24" height="24" rx="7" stroke="#fff" stroke-width="2.6" />
            <circle cx="24" cy="24" r="5.8" stroke="#fff" stroke-width="2.6" />
            <circle cx="31.8" cy="16.2" r="1.7" fill="#fff" />
          </svg>

          <!-- X / Twitter -->
          <svg v-else-if="item.platform === 'twitter'" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#0a0a0a" />
            <path
              fill="#fff"
              d="M27.55 21.55 36.2 12h-2.05l-7.5 8.66L20.7 12H13.5l9.08 13.2L13.5 36h2.05l7.94-9.17L28.5 36h7.2L27.55 21.55Zm-2.81 3.25-.92-1.31-7.32-10.45h3.15l5.9 8.42.92 1.31 7.67 10.94h-3.15l-6.25-8.91Z"
            />
          </svg>

          <!-- LinkedIn -->
          <svg v-else-if="item.platform === 'linkedin'" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="10" fill="#0a66c2" />
            <path
              fill="#fff"
              d="M14.2 19.4h4.35V34.2H14.2V19.4Zm2.18-6.95a2.52 2.52 0 1 1 0 5.04 2.52 2.52 0 0 1 0-5.04ZM21.7 19.4h4.17v2.02c.58-1.1 2.03-2.26 4.18-2.26 4.48 0 5.31 2.95 5.31 6.78V34.2H31.1v-8.55c0-2.04-.04-4.66-2.84-4.66-2.84 0-3.28 2.22-3.28 4.51V34.2H21.7V19.4Z"
            />
          </svg>

          <!-- Facebook -->
          <svg v-else-if="item.platform === 'facebook'" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#1877f2" />
            <path
              fill="#fff"
              d="M27.55 34.2v-8.55h2.87l.43-3.33h-3.3v-2.13c0-.96.27-1.62 1.65-1.62h1.76v-2.98a23.5 23.5 0 0 0-2.57-.13c-2.54 0-4.28 1.55-4.28 4.4v2.46h-2.87v3.33h2.87v8.55h3.44Z"
            />
          </svg>

          <!-- TikTok -->
          <svg v-else-if="item.platform === 'tiktok'" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#0a0a0a" />
            <path
              fill="#25f4ee"
              d="M30.6 16.2c1.15 1.04 2.5 1.78 4 2.12v3.05a7.9 7.9 0 0 1-4-.98v7.2c0 4.35-3.52 7.88-7.86 7.88A7.87 7.87 0 0 1 14.9 28c0-4.35 3.52-7.88 7.86-7.88.27 0 .54.02.8.05v3.22a4.7 4.7 0 0 0-.8-.07 4.66 4.66 0 0 0-4.65 4.66c0 2.57 2.08 4.66 4.65 4.66A4.67 4.67 0 0 0 27.4 28V12.4h3.2v3.8Z"
            />
            <path
              fill="#fe2c55"
              d="M29.35 15.05c1.15 1.04 2.5 1.78 4 2.12v3.05a7.9 7.9 0 0 1-4-.98v7.2c0 4.35-3.52 7.88-7.86 7.88A7.87 7.87 0 0 1 13.65 26.8c0-4.35 3.52-7.88 7.86-7.88.27 0 .54.02.8.05v3.22a4.7 4.7 0 0 0-.8-.07 4.66 4.66 0 0 0-4.65 4.66c0 2.57 2.08 4.66 4.65 4.66A4.67 4.67 0 0 0 26.15 26.8V11.25h3.2v3.8Z"
              opacity="0.95"
              transform="translate(1.15 1.05)"
            />
            <path
              fill="#fff"
              d="M28.9 15.8c1.15 1.04 2.5 1.78 4 2.12v3.05a7.9 7.9 0 0 1-4-.98v7.2c0 4.35-3.52 7.88-7.86 7.88A7.87 7.87 0 0 1 13.2 27.55c0-4.35 3.52-7.88 7.86-7.88.27 0 .54.02.8.05v3.22a4.7 4.7 0 0 0-.8-.07 4.66 4.66 0 0 0-4.65 4.66c0 2.57 2.08 4.66 4.65 4.66A4.67 4.67 0 0 0 25.7 27.55V12h3.2v3.8Z"
            />
          </svg>
        </div>

        <div class="divider" aria-hidden="true" />

        <div class="meta">
          <strong>{{ item.label }}</strong>
          <span class="btn">
            {{ item.cta }}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </a>
    </div>

    <p class="handle connect-rise d5">{{ handle }}</p>
  </div>
</template>

<style scoped>
.social-page {
  position: relative;
}

.watermark {
  display: none;
}

.social-head {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 46rem;
  margin: 0 auto 2.25rem;
}

.social-head h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.7rem, 4.5vw, 2.6rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.social-head .connect-bars {
  margin: 0.15rem auto 0.95rem;
}

.t-orange { color: var(--orange); }
.t-navy { color: var(--navy); }
.t-green { color: var(--green); }

.social-head p {
  margin: 0;
  color: #1a1a1a;
  line-height: 1.65;
  font-size: 0.95rem;
}

/* 3 on top, 2 centered below — matches mockup */
.social-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  max-width: 980px;
  margin: 0 auto;
}

.social-card {
  grid-column: span 2;
  display: grid;
  grid-template-columns: auto 1px 1fr;
  gap: 0.9rem;
  align-items: center;
  text-decoration: none;
  color: inherit;
  background: #fff;
  border: 1px solid rgba(10, 31, 68, 0.08);
  border-radius: 16px;
  padding: 1.05rem 1.1rem;
  box-shadow: 0 10px 26px rgba(10, 31, 68, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.social-card:nth-child(4) {
  grid-column: 2 / span 2;
}

.social-card:nth-child(5) {
  grid-column: 4 / span 2;
}

.social-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(10, 31, 68, 0.1);
}

.social-card.instagram { background: linear-gradient(180deg, #fff0f6, #fff); }
.social-card.x { background: linear-gradient(180deg, #f3f4f6, #fff); }
.social-card.linkedin { background: linear-gradient(180deg, #eef5ff, #fff); }
.social-card.facebook { background: linear-gradient(180deg, #eef5ff, #fff); }
.social-card.tiktok { background: linear-gradient(180deg, #e8fbf8, #fff); }

.logo svg {
  width: 56px;
  height: 56px;
  display: block;
  border-radius: 14px;
}

.divider {
  width: 1px;
  align-self: stretch;
  background: rgba(10, 31, 68, 0.1);
}

.meta {
  display: grid;
  gap: 0.55rem;
  min-width: 0;
}

.meta strong {
  color: var(--navy);
  font-size: 1.05rem;
  font-weight: 800;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  padding: 0.48rem 0.95rem;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
}

.btn svg {
  width: 15px;
  height: 15px;
}

.instagram .btn { background: linear-gradient(90deg, #f58529, #dd2a7b 55%, #515bd4); }
.x .btn { background: #0a0a0a; }
.linkedin .btn { background: #0a66c2; }
.facebook .btn { background: #1877f2; }
.tiktok .btn { background: #0a0a0a; }

.handle {
  position: relative;
  z-index: 1;
  margin: 1.75rem 0 0;
  text-align: center;
  color: var(--muted);
  font-weight: 600;
}

@media (max-width: 900px) {
  .social-grid {
    grid-template-columns: 1fr;
  }

  .social-card,
  .social-card:nth-child(4),
  .social-card:nth-child(5) {
    grid-column: 1;
  }

  .watermark {
    opacity: 0.7;
  }
}
</style>
