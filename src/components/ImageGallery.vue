<script setup lang="ts">
import { computed } from "vue";
import { useFadeUp } from "@/composables/useFadeUp";

interface GalleryImage {
  src: string;
  alt: string;
  label: string;
  color: string;
}

interface CmsGalleryImage {
  image?: string;
  alt?: string;
  label?: string;
  accent_color?: string;
  is_active?: boolean;
  order?: number;
}

interface GallerySection {
  eyebrow?: string;
  title?: string;
  description?: string;
  images?: CmsGalleryImage[];
}

interface Stat {
  value: string;
  label: string;
}

const props = defineProps<{
  gallery?: GallerySection | null;
  stats?: Stat[];
}>();

const DEFAULT_IMAGES: GalleryImage[] = [
  { src: "/images/gallery_coding.png", alt: "Youth coding", label: "Digital Skills Training", color: "#ff6a00" },
  { src: "/images/gallery_workshop.png", alt: "Team workshop", label: "Collaborative Innovation", color: "#0a7a3d" },
  { src: "/images/gallery_robotics.png", alt: "Robotics lab", label: "Robotics & Hardware Labs", color: "#163566" },
  { src: "/images/gallery_mentorship.png", alt: "Mentorship", label: "1-on-1 Mentorship Coaching", color: "#ff6a00" },
  { src: "/images/gallery_presentation.png", alt: "Tech talk", label: "Project Pitch Presentations", color: "#7c3aed" },
  { src: "/images/gallery_graduation.png", alt: "Graduation", label: "Empowerment Graduation Day", color: "#0a7a3d" },
  { src: "/images/gallery_outdoor.png", alt: "Outdoor learning", label: "Outreach & Community Hub", color: "#0891b2" },
  { src: "/images/gallery_design.png", alt: "UX Design", label: "UI/UX & Creative Digital Arts", color: "#ff6a00" },
  { src: "/images/gallery_hackathon.png", alt: "Hackathon", label: "Hackathons & Tech Sprints", color: "#163566" },
];

const DEFAULT_STATS: [string, string][] = [
  ["10K+", "Youth Empowered"],
  ["36", "States Covered"],
  ["50+", "Programs Run"],
  ["98%", "Success Rate"],
];

const imagePool = computed<GalleryImage[]>(() => {
  const cmsImages = (props.gallery?.images || [])
    .filter((img) => img.is_active !== false && img.image)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((img) => ({
      src: img.image as string,
      alt: img.alt || img.label || "Gallery image",
      label: img.label || "",
      color: img.accent_color || "#ff6a00",
    }));
  return cmsImages.length ? cmsImages : DEFAULT_IMAGES;
});

const rows = computed(() => {
  const pool = imagePool.value;
  return [
    { direction: "right", images: [...pool, ...pool], speed: 40 },
    {
      direction: "left",
      images: [
        ...pool.slice(3),
        ...pool.slice(0, 3),
        ...pool.slice(3),
        ...pool.slice(0, 3),
      ],
      speed: 50,
    },
    {
      direction: "right",
      images: [
        ...pool.slice(6),
        ...pool.slice(0, 6),
        ...pool.slice(6),
        ...pool.slice(0, 6),
      ],
      speed: 35,
    },
  ];
});

const eyebrow = computed(() => props.gallery?.eyebrow || "Our Community In Action");
const title = computed(() => props.gallery?.title || "Hands On at SLA");
const description = computed(
  () =>
    props.gallery?.description ||
    "A living mosaic of moments — rows scroll endlessly left and right, showcasing the energy inside Street Labs.",
);
const displayStats = computed(() => {
  if (props.stats?.length) return props.stats.map((s) => [s.value, s.label] as [string, string]);
  return DEFAULT_STATS;
});

useFadeUp("[data-fade-gallery]");
</script>

<template>
  <section class="gallery-section">
    <div class="gallery-header" data-fade-gallery>
      <span class="eyebrow">{{ eyebrow }}</span>
      <h2 class="section-title">{{ title }}</h2>
      <div class="title-bar"></div>
      <p class="section-desc">{{ description }}</p>
    </div>

    <div class="marquee-gallery" aria-label="Scrolling image gallery">
      <div v-for="(row, rowIdx) in rows" :key="rowIdx" class="marquee-row">
        <div
          class="marquee-track"
          :class="row.direction === 'left' ? 'scroll-left' : 'scroll-right'"
          :style="{ '--speed': row.speed + 's' }"
        >
          <div
            v-for="(img, imgIdx) in row.images"
            :key="imgIdx"
            class="marquee-item"
          >
            <img
              :src="img.src"
              :alt="img.alt"
              class="marquee-img"
              loading="lazy"
              draggable="false"
            />
            <div class="marquee-caption">
              <span class="cap-dot" :style="{ background: img.color }"></span>
              {{ img.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="gallery-stats" data-fade-gallery>
      <div
        v-for="[num, lbl] in displayStats"
        :key="num"
        class="gstat"
      >
        <span class="gstat-num">{{ num }}</span>
        <span class="gstat-lbl">{{ lbl }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Section ─────────────────────────────────────────── */
.gallery-section {
  background: #fff;
  padding: 6rem 0 0;
  overflow: hidden;
}

/* ── Header ──────────────────────────────────────────── */
.gallery-header {
  text-align: center;
  padding: 0 2rem 3.5rem;
  max-width: 680px;
  margin: 0 auto;
}
.eyebrow {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #ff6a00;
  background: rgba(255, 106, 0, 0.08);
  border: 1px solid rgba(255, 106, 0, 0.2);
  padding: 0.35rem 1rem;
  border-radius: 50px;
  margin-bottom: 1rem;
  font-family: "Poppins", sans-serif;
}
.section-title {
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
  letter-spacing: -0.02em;
}
.title-bar {
  width: 48px;
  height: 4px;
  background: linear-gradient(90deg, #ff6a00, #0a7a3d);
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}
.section-desc {
  font-size: 0.98rem;
  color: #64748b;
  line-height: 1.75;
}

/* ── Marquee Wrapper ─────────────────────────────────── */
.marquee-gallery {
  display: flex;
  flex-direction: column;
  gap: 6px; /* tiny gap between rows */
  overflow: hidden;
  /* Soft fade-out on the left and right edges */
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 6%,
    black 94%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 6%,
    black 94%,
    transparent 100%
  );
}

/* ── A single infinite row ───────────────────────────── */
.marquee-row {
  overflow: hidden;
}

/* The track holds TWO identical sets of images side by side.
   Animation moves it by exactly -50% (= one full set width),
   then loops — producing a seamless infinite scroll. */
.marquee-track {
  display: flex;
  width: max-content; /* expand to fit all items */
  will-change: transform;
}

/* ── Directions ──────────────────────────────────────── */
.scroll-right {
  animation: scrollRight var(--speed, 40s) linear infinite;
}
.scroll-left {
  animation: scrollLeft var(--speed, 40s) linear infinite;
}

/* Pause on any hover within the row */
.marquee-row:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes scrollRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes scrollLeft {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

/* ── Individual Image Cell ───────────────────────────── */
.marquee-item {
  position: relative;
  flex: none;
  width: 280px;
  height: 190px;
  overflow: hidden;
  cursor: pointer;
}

/* Slight gap between each image */
.marquee-item + .marquee-item {
  margin-left: 6px;
}

.marquee-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 0.35s ease;
}

/* Hover: zoom image inside its container */
.marquee-item:hover .marquee-img {
  transform: scale(1.08);
  filter: brightness(1.1) saturate(1.2);
}

/* ── Caption that slides up on hover ────────────────── */
.marquee-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem 0.65rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.72) 0%, transparent 100%);
  color: #fff;
  font-family: "Poppins", sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}
.cap-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.marquee-item:hover .marquee-caption {
  transform: translateY(0);
}

/* ── Stats Strip ─────────────────────────────────────── */
.gallery-stats {
  display: flex;
  justify-content: center;
  gap: 4rem;
  padding: 3rem 2rem;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.gstat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}
.gstat-num {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  font-family: "Poppins", sans-serif;
  line-height: 1;
  letter-spacing: -0.03em;
}
.gstat-lbl {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Fade-up ─────────────────────────────────────────── */
[data-fade-gallery] {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.65s ease,
    transform 0.65s ease;
}
[data-fade-gallery].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 768px) {
  .marquee-item {
    width: 200px;
    height: 140px;
  }
}
@media (max-width: 480px) {
  .marquee-item {
    width: 150px;
    height: 110px;
  }
  .gallery-stats {
    gap: 2rem;
  }
  .gstat-num {
    font-size: 2rem;
  }
}
</style>
