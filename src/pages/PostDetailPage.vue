<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { postsApi } from "@/api/posts";
import type { Post } from "@/api/posts";
import { MEDIA_BASE } from "@/api/client";
import { marked } from "marked";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { useHomepageCms } from "@/composables/useHomepageCms";

const route = useRoute();
const router = useRouter();
const { settings, announcement, socialLinks, navFor } = useHomepageCms();
const headerNav = navFor("header");
const footerNav = navFor("footer");

const post = ref<Post | null>(null);
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

function renderMarkdown(md: string): string {
  try {
    return marked(md) as string;
  } catch {
    return md;
  }
}

const isPodcast = computed(() => post.value?.post_type === "podcast");

const pageUrl = computed(() => window.location.href);
const pageTitle = computed(() => post.value?.title || "");

function shareUrl(platform: string): string {
  const url = encodeURIComponent(pageUrl.value);
  const text = encodeURIComponent(pageTitle.value);
  switch (platform) {
    case "twitter":
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    case "whatsapp":
      return `https://wa.me/?text=${text}%20${url}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    default:
      return "#";
  }
}

const copied = ref(false);
async function copyLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    //
  }
}

async function load() {
  const slug = route.params.slug as string;
  if (!slug) return;
  loading.value = true;
  error.value = "";
  try {
    post.value = await postsApi.publicGet(slug);
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : "Failed to load post";
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.slug, load);
onMounted(load);
</script>

<template>
  <div class="sla-website">
    <Header
      :announcement="announcement"
      :nav="headerNav"
      :settings="settings"
    />
    <main class="post-detail-section">
      <div class="post-detail-container">
        <button
          class="back-link"
          @click="router.push(isPodcast ? '/podcast' : '/blog')"
        >
          ← Back to {{ isPodcast ? "Podcasts" : "Blog" }}
        </button>

        <div v-if="loading" class="loading-state">
          <VaProgressCircle indeterminate size="small" />
          <span>Loading…</span>
        </div>

        <p v-else-if="error" class="error-msg">{{ error }}</p>

        <article v-else-if="post" class="post-article">
          <div v-if="post.cover_image" class="post-cover">
            <img :src="resolveMediaUrl(post.cover_image)" :alt="post.title" />
          </div>

          <div class="post-meta">
            <span v-if="isPodcast && post.episode_number" class="meta-ep">
              EP {{ String(post.episode_number).padStart(3, "0") }}
            </span>
            <span class="meta-date">
              {{ formatDate(post.scheduled_at || post.created_at) }}
            </span>
          </div>

          <h1 class="post-title">{{ post.title }}</h1>
          <p v-if="post.excerpt" class="post-excerpt">{{ post.excerpt }}</p>

          <div v-if="isPodcast" class="podcast-actions">
            <a
              v-if="isUpcoming(post.scheduled_at) && post.live_join_url"
              :href="post.live_join_url"
              target="_blank"
              rel="noopener"
              class="btn-live"
            >
              ● Join Live{{
                post.scheduled_at ? ` · ${formatTime(post.scheduled_at)}` : ""
              }}
            </a>
            <a
              v-if="post.recording_url"
              :href="post.recording_url"
              target="_blank"
              rel="noopener"
              class="btn-recording"
            >
              ▶ Watch Recording
            </a>
          </div>

          <div
            v-if="post.body"
            class="post-body md-render"
            v-html="renderMarkdown(post.body)"
          />

          <!-- Share bar -->
          <div class="share-bar">
            <span class="share-label">Share</span>
            <div class="share-buttons">
              <a
                :href="shareUrl('whatsapp')"
                target="_blank"
                rel="noopener"
                class="share-btn whatsapp"
                title="Share on WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
              </a>
              <a
                :href="shareUrl('twitter')"
                target="_blank"
                rel="noopener"
                class="share-btn twitter"
                title="Share on X / Twitter"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.736-8.857L1.86 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>
              <a
                :href="shareUrl('facebook')"
                target="_blank"
                rel="noopener"
                class="share-btn facebook"
                title="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
              <a
                :href="shareUrl('linkedin')"
                target="_blank"
                rel="noopener"
                class="share-btn linkedin"
                title="Share on LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
              </a>
              <a
                :href="shareUrl('telegram')"
                target="_blank"
                rel="noopener"
                class="share-btn telegram"
                title="Share on Telegram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                  />
                </svg>
              </a>
              <button
                class="share-btn copy"
                :class="{ copied }"
                :title="copied ? 'Copied!' : 'Copy link'"
                @click="copyLink"
              >
                <svg
                  v-if="!copied"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path
                    d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                  />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>
    <Footer :settings="settings" :nav="footerNav" :social-links="socialLinks" />
  </div>
</template>

<style scoped>
@import "@/styles/landing.css";

.post-detail-section {
  padding: 10rem 1.5rem 5rem;
  background: #f5f7fa;
  min-height: 60vh;
}
.post-detail-container {
  max-width: 760px;
  margin: 0 auto;
}
.back-link {
  background: none;
  border: 0;
  color: var(--landing-orange);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0;
}
.back-link:hover {
  text-decoration: underline;
}
.loading-state {
  display: grid;
  place-content: center;
  min-height: 200px;
  text-align: center;
  color: var(--landing-muted);
  gap: 0.75rem;
}
.error-msg {
  text-align: center;
  color: #b42318;
}
.post-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 14px;
  margin-bottom: 1.5rem;
}
.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.meta-ep {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: var(--landing-orange);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}
.meta-date {
  font-size: 0.85rem;
  color: var(--landing-muted);
}
.post-title {
  font-family: var(--landing-font);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 800;
  color: var(--landing-navy);
  margin: 0 0 0.75rem;
  line-height: 1.2;
}
.post-excerpt {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--landing-muted);
  margin: 0 0 1.5rem;
}
.podcast-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.btn-live,
.btn-recording {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid;
}
.btn-live {
  background: #fef3f2;
  color: #b42318;
  border-color: #fda29b;
}
.btn-recording {
  background: #ecfdf3;
  color: #0a7a3d;
  border-color: #a6f4c5;
}
.post-body {
  font-family: var(--landing-font);
  font-size: 1rem;
  line-height: 1.8;
  color: #1a2a44;
}
.post-body :deep(h2) {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--landing-navy);
  margin: 2rem 0 0.75rem;
}
.post-body :deep(h3) {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--landing-navy);
  margin: 1.5rem 0 0.5rem;
}
.post-body :deep(p) {
  margin: 0 0 1rem;
}
.post-body :deep(ul),
.post-body :deep(ol) {
  margin: 0 0 1rem;
  padding-left: 1.5rem;
}
.post-body :deep(li) {
  margin-bottom: 0.4rem;
}
.post-body :deep(blockquote) {
  border-left: 3px solid var(--landing-orange);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--landing-muted);
  font-style: italic;
}
.post-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
.post-body :deep(a) {
  color: var(--landing-orange);
  text-decoration: underline;
}
.post-body :deep(code) {
  background: #f2f5f9;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.9em;
}
.post-body :deep(pre) {
  background: #0a1f44;
  color: #e6ebf2;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}
.post-body :deep(pre code) {
  background: none;
  color: inherit;
}

/* ── Share bar ── */
.share-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e6ebf2;
}
.share-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--landing-muted);
  white-space: nowrap;
}
.share-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.share-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(10, 31, 68, 0.1);
  background: #fff;
  color: #5b6b82;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.18s,
    color 0.18s,
    border-color 0.18s,
    transform 0.15s;
}
.share-btn svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}
.share-btn:hover {
  transform: translateY(-2px);
}
.share-btn.whatsapp:hover {
  background: #25d366;
  color: #fff;
  border-color: #25d366;
}
.share-btn.twitter:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}
.share-btn.facebook:hover {
  background: #1877f2;
  color: #fff;
  border-color: #1877f2;
}
.share-btn.linkedin:hover {
  background: #0a66c2;
  color: #fff;
  border-color: #0a66c2;
}
.share-btn.telegram:hover {
  background: #26a5e4;
  color: #fff;
  border-color: #26a5e4;
}
.share-btn.copy:hover {
  background: var(--landing-navy);
  color: #fff;
  border-color: var(--landing-navy);
}
.share-btn.copy.copied {
  background: #ecfdf3;
  color: #0a7a3d;
  border-color: #a6f4c5;
}
</style>
