<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { postsApi } from "@/api/posts";
import type { Post } from "@/api/posts";
import { MEDIA_BASE } from "@/api/client";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LandingHeader from "@/components/landing/LandingHeader.vue";
import { useHomepageCms } from "@/composables/useHomepageCms";

const { settings, announcement, socialLinks, navFor } = useHomepageCms();
const headerNav = navFor("header");
const footerNav = navFor("footer");

const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref("");

function resolveMediaUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE}${url.replace(/^\//, "")}`;
}

function formatDate(v: string): string {
  if (!v) return "";
  try {
    return new Date(v).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return v;
  }
}

function formatTime(v: string): string {
  if (!v) return "";
  try {
    return new Date(v).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return v;
  }
}

function isUpcoming(scheduledAt: string | null): boolean {
  if (!scheduledAt) return false;
  return new Date(scheduledAt) > new Date();
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await postsApi.publicList({ post_type: "podcast" });
    posts.value = res?.results || [];
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load podcasts";
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="sla-website">
    <Header
      :announcement="announcement"
      :nav="headerNav"
      :settings="settings"
    />

    <!-- Hero banner -->
    <section class="podcast-hero">
      <div class="podcast-hero-inner">
        <div class="hero-kicker">
          <span class="kicker-rule" />
          <span>Conversations</span>
          <span class="kicker-rule" />
        </div>
        <h1 class="hero-title">Podcast</h1>
        <p class="hero-lead">
          Roundtable discussions on tech, innovation, and digital transformation
          in Africa.
        </p>
      </div>
    </section>

    <main class="podcast-section">
      <div class="podcast-container">
        <p v-if="error" class="error-msg">{{ error }}</p>

        <div v-if="loading" class="loading-state">
          <div class="spinner" />
          <span>Loading episodes…</span>
        </div>

        <div v-else-if="!posts.length" class="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c5cedc"
            stroke-width="1.5"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <p>No episodes published yet. Check back soon.</p>
        </div>

        <div v-else class="episode-list">
          <article
            v-for="(post, i) in posts"
            :key="post.id"
            class="episode-card"
            :class="{ featured: i === 0 }"
            @click="$router.push(`/podcast/${post.slug}`)"
          >
            <!-- Cover -->
            <div class="episode-artwork">
              <img
                v-if="post.cover_image"
                :src="resolveMediaUrl(post.cover_image)"
                :alt="post.title"
                loading="lazy"
              />
              <div v-else class="artwork-placeholder">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b98a9"
                  stroke-width="1.5"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div v-if="isUpcoming(post.scheduled_at)" class="live-badge">
                LIVE SOON
              </div>
            </div>

            <!-- Body -->
            <div class="episode-body">
              <div class="episode-top">
                <div class="episode-tags">
                  <span v-if="post.episode_number" class="ep-badge">
                    EP {{ String(post.episode_number).padStart(3, "0") }}
                  </span>
                  <span v-if="isUpcoming(post.scheduled_at)" class="live-tag"
                    >Upcoming</span
                  >
                  <span v-else-if="post.recording_url" class="rec-tag"
                    >Recorded</span
                  >
                </div>
                <span class="episode-date">
                  {{ formatDate(post.scheduled_at || post.created_at) }}
                </span>
              </div>

              <h3 class="episode-title">{{ post.title }}</h3>
              <p v-if="post.excerpt" class="episode-excerpt">
                {{ post.excerpt }}
              </p>

              <div class="episode-footer">
                <div class="episode-actions">
                  <a
                    v-if="isUpcoming(post.scheduled_at) && post.live_join_url"
                    :href="post.live_join_url"
                    target="_blank"
                    rel="noopener"
                    class="btn-action btn-live"
                    @click.stop
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                    Join Live · {{ formatTime(post.scheduled_at!) }}
                  </a>
                  <a
                    v-if="post.recording_url"
                    :href="post.recording_url"
                    target="_blank"
                    rel="noopener"
                    class="btn-action btn-recording"
                    @click.stop
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Watch Recording
                  </a>
                </div>
                <span class="btn-details">View Episode →</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>

    <Footer :settings="settings" :nav="footerNav" :social-links="socialLinks" />
  </div>
</template>

<style scoped>
@import "@/styles/landing.css";

/* ── Hero ── */
.podcast-hero {
  background: linear-gradient(135deg, #0a1f44 0%, #163566 60%, #0a1f44 100%);
  padding: 8rem 1.5rem 5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.podcast-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 70% 50%,
    rgba(255, 106, 0, 0.12) 0%,
    transparent 60%
  );
  pointer-events: none;
}
.podcast-hero-inner {
  max-width: 680px;
  margin: 0 auto;
  position: relative;
}
.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 1.1rem;
}
.kicker-rule {
  width: 28px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
}
.hero-title {
  font-family: var(--landing-font);
  font-size: clamp(2.8rem, 6vw, 4rem);
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  line-height: 1.1;
}
.hero-lead {
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.65);
  max-width: 540px;
  margin: 0 auto;
}

/* ── Section ── */
.podcast-section {
  background: #f4f7fb;
  padding: 3.5rem 1.5rem 5rem;
  min-height: 40vh;
}
.podcast-container {
  max-width: 860px;
  margin: 0 auto;
}
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  gap: 1rem;
  color: var(--landing-muted);
  font-size: 0.95rem;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e6ebf2;
  border-top-color: var(--landing-orange);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.error-msg {
  text-align: center;
  color: #b42318;
  margin-bottom: 1rem;
}

/* ── Episode list ── */
.episode-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Episode card ── */
.episode-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(10, 31, 68, 0.08);
  cursor: pointer;
  transition:
    box-shadow 0.22s,
    transform 0.22s;
  box-shadow: 0 2px 8px rgba(10, 31, 68, 0.05);
}
.episode-card:hover {
  box-shadow: 0 16px 40px rgba(10, 31, 68, 0.13);
  transform: translateY(-3px);
}
.episode-card.featured {
  grid-template-columns: 260px 1fr;
  border-color: rgba(255, 106, 0, 0.2);
  box-shadow: 0 4px 16px rgba(10, 31, 68, 0.08);
}

/* Artwork */
.episode-artwork {
  position: relative;
  overflow: hidden;
  background: #0a1f44;
}
.episode-artwork img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.artwork-placeholder {
  width: 100%;
  height: 100%;
  min-height: 180px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0a1f44, #163566);
}
.live-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  background: #dc2626;
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.22rem 0.5rem;
  border-radius: 4px;
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.65;
  }
}

/* Body */
.episode-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.episode-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.episode-tags {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
.ep-badge {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: var(--landing-orange);
  color: #fff;
  padding: 0.22rem 0.55rem;
  border-radius: 5px;
}
.live-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #fef3f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
}
.rec-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #ecfdf3;
  color: #0a7a3d;
  border: 1px solid #a6f4c5;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
}
.episode-date {
  font-size: 0.78rem;
  color: var(--landing-muted);
  white-space: nowrap;
}
.episode-title {
  font-family: var(--landing-font);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--landing-navy);
  margin: 0.25rem 0 0;
  line-height: 1.35;
}
.episode-card.featured .episode-title {
  font-size: 1.3rem;
}
.episode-excerpt {
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--landing-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.episode-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f3f8;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.episode-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.85rem;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid;
  transition: opacity 0.15s;
}
.btn-action:hover {
  opacity: 0.82;
}
.btn-live {
  background: #fef3f2;
  color: #dc2626;
  border-color: #fca5a5;
}
.btn-recording {
  background: #0a1f44;
  color: #fff;
  border-color: #0a1f44;
}
.btn-details {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--landing-orange);
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 680px) {
  .episode-card,
  .episode-card.featured {
    grid-template-columns: 1fr;
  }
  .episode-artwork {
    aspect-ratio: 16 / 9;
  }
  .artwork-placeholder {
    min-height: unset;
    aspect-ratio: 16 / 9;
  }
  .episode-body {
    padding: 1.25rem;
  }
}
</style>
