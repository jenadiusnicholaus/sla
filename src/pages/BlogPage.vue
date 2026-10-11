<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { postsApi } from "@/api/posts";
import type { Post } from "@/api/posts";
import { MEDIA_BASE } from "@/api/client";
import { marked } from "marked";
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

function excerptHtml(md: string): string {
  try {
    return marked(md.slice(0, 300) + (md.length > 300 ? "…" : "")) as string;
  } catch {
    return md;
  }
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const res = await postsApi.publicList({ post_type: "blog" });
    posts.value = res?.results || [];
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load blog posts";
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
    <section class="blog-hero">
      <div class="blog-hero-inner">
        <div class="hero-kicker">
          <span class="kicker-rule" />
          <span>Insights</span>
          <span class="kicker-rule" />
        </div>
        <h1 class="hero-title">Blog</h1>
        <p class="hero-lead">
          Stories, insights, and thought leadership from Street Digital Labs
          Africa.
        </p>
      </div>
    </section>

    <main class="blog-section">
      <div class="blog-container">
        <p v-if="error" class="error-msg">{{ error }}</p>

        <div v-if="loading" class="loading-state">
          <div class="spinner" />
          <span>Loading posts…</span>
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
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>No articles published yet. Check back soon.</p>
        </div>

        <template v-else>
          <!-- Featured first post -->
          <article
            class="blog-card featured"
            @click="$router.push(`/blog/${posts[0].slug}`)"
          >
            <div class="card-cover featured-cover">
              <img
                v-if="posts[0].cover_image"
                :src="resolveMediaUrl(posts[0].cover_image)"
                :alt="posts[0].title"
                loading="lazy"
              />
              <div v-else class="cover-placeholder" />
            </div>
            <div class="card-body">
              <span class="card-tag">Featured</span>
              <span class="card-date">{{
                formatDate(posts[0].created_at)
              }}</span>
              <h2 class="card-title featured-title">{{ posts[0].title }}</h2>
              <p class="card-excerpt">{{ posts[0].excerpt }}</p>
              <span class="card-link">Read article →</span>
            </div>
          </article>

          <!-- Remaining grid -->
          <div v-if="posts.length > 1" class="blog-grid">
            <article
              v-for="post in posts.slice(1)"
              :key="post.id"
              class="blog-card"
              @click="$router.push(`/blog/${post.slug}`)"
            >
              <div class="card-cover">
                <img
                  v-if="post.cover_image"
                  :src="resolveMediaUrl(post.cover_image)"
                  :alt="post.title"
                  loading="lazy"
                />
                <div v-else class="cover-placeholder" />
              </div>
              <div class="card-body">
                <span class="card-date">{{ formatDate(post.created_at) }}</span>
                <h3 class="card-title">{{ post.title }}</h3>
                <p class="card-excerpt">{{ post.excerpt }}</p>
                <span class="card-link">Read more →</span>
              </div>
            </article>
          </div>
        </template>
      </div>
    </main>

    <Footer :settings="settings" :nav="footerNav" :social-links="socialLinks" />
  </div>
</template>

<style scoped>
@import "@/styles/landing.css";

/* ── Hero ── */
.blog-hero {
  background: linear-gradient(135deg, #0a1f44 0%, #163566 60%, #0a1f44 100%);
  padding: 5rem 1.5rem 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.blog-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 50%,
    rgba(255, 106, 0, 0.1) 0%,
    transparent 60%
  );
  pointer-events: none;
}
.blog-hero-inner {
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
.blog-section {
  background: #f4f7fb;
  padding: 3.5rem 1.5rem 5rem;
  min-height: 40vh;
}
.blog-container {
  max-width: 1100px;
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

/* ── Cards ── */
.blog-card {
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
.blog-card:hover {
  box-shadow: 0 16px 40px rgba(10, 31, 68, 0.13);
  transform: translateY(-3px);
}

/* Featured card */
.blog-card.featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 2rem;
  border-color: rgba(255, 106, 0, 0.18);
  box-shadow: 0 4px 20px rgba(10, 31, 68, 0.09);
}
.featured-cover {
  aspect-ratio: unset !important;
  min-height: 320px;
}

/* Grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Cover */
.card-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #0a1f44;
}
.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.blog-card:hover .card-cover img {
  transform: scale(1.04);
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  min-height: 180px;
  background: linear-gradient(135deg, #0a1f44, #163566);
}

/* Body */
.card-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.blog-card.featured .card-body {
  padding: 2rem 2rem;
  justify-content: center;
}
.card-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  background: var(--landing-orange);
  color: #fff;
  padding: 0.22rem 0.6rem;
  border-radius: 5px;
  margin-bottom: 0.25rem;
  width: fit-content;
}
.card-date {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--landing-orange);
}
.card-title {
  font-family: var(--landing-font);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--landing-navy);
  margin: 0.2rem 0 0;
  line-height: 1.35;
}
.featured-title {
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  line-height: 1.25;
}
.card-excerpt {
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--landing-muted);
  margin: 0.25rem 0 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.blog-card.featured .card-excerpt {
  -webkit-line-clamp: 5;
}
.card-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--landing-orange);
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 720px) {
  .blog-card.featured {
    grid-template-columns: 1fr;
  }
  .featured-cover {
    min-height: unset;
    aspect-ratio: 16 / 9;
  }
}
</style>
