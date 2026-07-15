<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useFadeUp } from '@/composables/useFadeUp'

interface GalleryImage {
  src: string
  alt: string
  label: string
  color: string
}

// 9 unique high-resolution image resources
const imagePool: GalleryImage[] = [
  { src: '/images/gallery_coding.png',       alt: 'Youth coding',      label: 'Digital Skills Training', color: '#ff6a00' },
  { src: '/images/gallery_workshop.png',     alt: 'Team workshop',     label: 'Collaborative Innovation', color: '#0a7a3d' },
  { src: '/images/gallery_robotics.png',     alt: 'Robotics lab',      label: 'Robotics & Hardware Labs', color: '#163566' },
  { src: '/images/gallery_mentorship.png',   alt: 'Mentorship',        label: '1-on-1 Mentorship Coaching', color: '#ff6a00' },
  { src: '/images/gallery_presentation.png', alt: 'Tech talk',         label: 'Project Pitch Presentations', color: '#7c3aed' },
  { src: '/images/gallery_graduation.png',   alt: 'Graduation',        label: 'Empowerment Graduation Day', color: '#0a7a3d' },
  { src: '/images/gallery_outdoor.png',      alt: 'Outdoor learning',  label: 'Outreach & Community Hub', color: '#0891b2' },
  { src: '/images/gallery_design.png',       alt: 'UX Design',         label: 'UI/UX & Creative Digital Arts', color: '#ff6a00' },
  { src: '/images/gallery_hackathon.png',    alt: 'Hackathon',         label: 'Hackathons & Tech Sprints', color: '#163566' },
]

// Generate 22 bubble cards by cycling the 9 images
const bubbles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  image: imagePool[i % imagePool.length],
}))

interface SlotPosition {
  x: number     // left %
  y: number     // top %
  size: number  // px diameter
}

// 22 distributed bubble slots covering the full section width densely
const slots: SlotPosition[] = [
  { x: 5,  y: 10, size: 120 },
  { x: 19, y: 35, size: 135 },
  { x: 33, y: 15, size: 110 },
  { x: 47, y: 40, size: 130 },
  { x: 61, y: 18, size: 120 },
  { x: 75, y: 35, size: 140 },
  { x: 89, y: 15, size: 125 },
  { x: 93, y: 55, size: 110 },
  { x: 79, y: 78, size: 130 },
  { x: 65, y: 52, size: 110 },
  { x: 51, y: 80, size: 135 },
  { x: 37, y: 48, size: 120 },
  { x: 23, y: 78, size: 130 },
  { x: 9,  y: 48, size: 115 },
  { x: 8,  y: 80, size: 125 },
  { x: 92, y: 78, size: 130 },
  { x: 14, y: 22, size: 105 },
  { x: 28, y: 20, size: 115 },
  { x: 42, y: 26, size: 110 },
  { x: 56, y: 28, size: 105 },
  { x: 70, y: 24, size: 120 },
  { x: 83, y: 20, size: 110 },
]

// Array mapping bubble indexes to slot indexes
const slotAssignments = ref<number[]>([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
])
const hoveredId = ref<number | null>(null)
let intervalId: number | null = null

// Rotate assignments loopingly
const shiftPositions = (): void => {
  if (hoveredId.value !== null) return // Pause shifting on hover
  slotAssignments.value = slotAssignments.value.map(slotIdx => (slotIdx + 1) % slots.length)
}

onMounted(() => {
  // Move bubbles every 14 seconds (gives a slow 12s dreamy transition + 2s pause)
  intervalId = window.setInterval(shiftPositions, 14000)
})

onUnmounted(() => {
  if (intervalId !== null) window.clearInterval(intervalId)
})

useFadeUp('[data-fade-gallery]')
</script>

<template>
  <section class="gallery-section">
    <!-- Header -->
    <div class="gallery-header" data-fade-gallery>
      <span class="eyebrow">A Glimpse Inside</span>
      <h2 class="section-title">Life at Street Labs</h2>
      <div class="title-bar"></div>
      <p class="section-desc">
        Watch our community in motion. The bubbles continuously drift and swap positions—hover over any moment to magnify and explore the experience in focus.
      </p>
    </div>

    <!-- ── Bubble Tank ─────────────────────────────────── -->
    <div class="bubble-tank" aria-label="Swapping image gallery">
      <!-- Ambient glow blobs for a modern mesh gradient feel -->
      <div class="glow-blob blob-orange" aria-hidden="true"></div>
      <div class="glow-blob blob-blue"  aria-hidden="true"></div>
      <div class="glow-blob blob-purple" aria-hidden="true"></div>

      <!-- Rising micro bubbles (using fully GPU-accelerated translate3d) -->
      <div
        v-for="n in 18"
        :key="'mb' + n"
        class="micro-bubble"
        :style="{
          left: (n * 5.5) + '%',
          animationDuration: (8 + (n % 4)) + 's',
          animationDelay: (n * 0.4) + 's',
          width: (4 + (n % 3)) + 'px',
          height: (4 + (n % 3)) + 'px'
        }"
        aria-hidden="true"
      ></div>

      <!-- ── 22 Swapping Bubbles ────────────────────────── -->
      <div
        v-for="(b, idx) in bubbles"
        :key="b.id"
        class="photo-bubble"
        :class="{
          'is-hovered': hoveredId === idx,
          'is-dimmed': hoveredId !== null && hoveredId !== idx
        }"
        :style="{
          left: slots[slotAssignments[idx]].x + '%',
          top: slots[slotAssignments[idx]].y + '%',
          width: slots[slotAssignments[idx]].size + 'px',
          height: slots[slotAssignments[idx]].size + 'px',
          zIndex: hoveredId === idx ? 150 : (idx % 5) + 5
        }"
        @mouseenter="hoveredId = idx"
        @mouseleave="hoveredId = null"
      >
        <!-- bubble-inner isolates the bobbing animation to prevent layout thrashing -->
        <div class="bubble-inner">
          <img
            :src="b.image.src"
            :alt="b.image.alt"
            class="bubble-img"
            loading="lazy"
            draggable="false"
          />

          <!-- Hover caption -->
          <div class="bubble-caption">
            <span class="caption-dot" :style="{ background: b.image.color }"></span>
            <span class="caption-text">{{ b.image.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats strip -->
    <div class="gallery-stats" data-fade-gallery>
      <div
        v-for="[num, lbl] in [['10K+','Youth Empowered'],['36','States Covered'],['50+','Programs Run'],['98%','Success Rate']]"
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
/* ── Section ──────────────────────────────────────────── */
.gallery-section {
  background: #ffffff;
  padding: 6rem 0 0;
  overflow: hidden;
  position: relative;
}

/* ── Header ───────────────────────────────────────────── */
.gallery-header {
  text-align: center;
  padding: 0 2rem 4rem;
  max-width: 720px;
  margin: 0 auto;
}
.eyebrow {
  display: inline-block;
  font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em;
  text-transform: uppercase; color: #5a6a85;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  padding: 0.4rem 1.2rem; border-radius: 50px;
  margin-bottom: 1.25rem; font-family: 'Poppins', sans-serif;
}
.section-title {
  font-size: clamp(2.2rem, 4vw, 3rem); font-weight: 800; color: #0f172a;
  margin-bottom: 1rem; font-family: 'Poppins', sans-serif; letter-spacing: -0.02em;
}
.title-bar {
  width: 48px; height: 4px;
  background: #3b82f6; /* Sleek modern blue */
  margin: 0 auto 1.5rem; border-radius: 2px;
}
.section-desc { font-size: 1.05rem; color: #64748b; line-height: 1.7; font-weight: 400; }

/* ── Bubble Tank ──────────────────────────────────────── */
.bubble-tank {
  position: relative;
  width: 100%;
  height: 700px;
  background: #f8fafc; /* Professional cool off-white */
  
  /* Create a sophisticated fade in/out at the top and bottom edges */
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
}

/* ── Glow Blobs (Mesh Gradient Vibe) ──────────────────── */
.glow-blob {
  position: absolute; border-radius: 50%;
  filter: blur(90px); pointer-events: none; opacity: 0.6;
}
.blob-orange { width: 500px; height: 500px; background: rgba(255, 106, 0, 0.05);  top: -100px; left: 10%; }
.blob-blue   { width: 600px; height: 600px; background: rgba(59, 130, 246, 0.08); bottom: -100px; right: 5%; }
.blob-purple { width: 450px; height: 450px; background: rgba(124, 58, 237, 0.05); top: 20%; left: 45%; }

/* ── Micro bubbles rising ─────────────────────────────── */
.micro-bubble {
  position: absolute; bottom: -20px;
  border-radius: 50%; background: rgba(255,255,255,0.8);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  pointer-events: none;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  from { transform: translate3d(0, 0, 0) scale(1); opacity: 0.6; }
  to   { transform: translate3d(0, -750px, 0) scale(0.4); opacity: 0; }
}

/* ── Photo bubble ─────────────────────────────────────── */
.photo-bubble {
  position: absolute;
  border-radius: 50%;
  /* Sleek, professional white border replacing the chaotic colored borders */
  border: 4px solid #ffffff;
  background: #ffffff;
  cursor: pointer;
  transform: translate(-50%, -50%);
  
  /* Soft, premium drop shadow */
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  
  /* Ultra-smooth and dreamy 12s transition using a gentle spring curve */
  transition:
    left 12s cubic-bezier(0.45, 0, 0.15, 1),
    top 12s cubic-bezier(0.45, 0, 0.15, 1),
    width 12s cubic-bezier(0.45, 0, 0.15, 1),
    height 12s cubic-bezier(0.45, 0, 0.15, 1),
    box-shadow 0.4s ease,
    opacity 0.5s ease,
    filter 0.5s ease;
  
  will-change: left, top, width, height, transform, filter;
}

/* inner wrapper for GPU-accelerated bobbing */
.bubble-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
  animation: gentleBob 7s ease-in-out infinite alternate;
  will-change: transform;
}

@keyframes gentleBob {
  from { transform: translate3d(0, -8px, 0); }
  to   { transform: translate3d(0, 8px, 0); }
}

/* ── Cinematic Depth of Field on Hover ────────────────── */
.photo-bubble.is-dimmed {
  opacity: 0.35;
  filter: blur(4px) grayscale(30%);
  transform: translate(-50%, -50%) scale(0.9);
}

/* ── Professional Modal Hover State ───────────────────── */
.photo-bubble.is-hovered {
  /* Center it like a focused modal window */
  left: 50% !important;
  top: 50% !important;
  width: 500px !important;
  height: 340px !important;
  max-width: 90vw !important;
  
  /* Morph from circle to soft rounded rectangle */
  border-radius: 24px !important;
  border: 6px solid #ffffff;
  transform: translate(-50%, -50%) scale(1.0) !important;
  
  /* High-end elevated shadow */
  box-shadow: 
    0 40px 100px rgba(15, 23, 42, 0.25),
    0 10px 40px rgba(15, 23, 42, 0.15);
  
  z-index: 200 !important;
  
  /* Fast, snappy response when hovered */
  transition:
    left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    top 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    border-radius 0.45s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.4s ease,
    opacity 0.4s ease !important;
}

.photo-bubble.is-hovered .bubble-inner {
  animation: none; /* stop bobbing when focused */
  transform: none;
}

.bubble-img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  transition: border-radius 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.photo-bubble.is-hovered .bubble-img {
  border-radius: 18px !important;
}

/* ── Premium Glassmorphism Caption ────────────────────── */
.bubble-caption {
  position: absolute;
  bottom: 24px; left: 50%;
  transform: translateX(-50%) translateY(15px);
  
  /* Glass effect */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  color: #0f172a;
  font-size: 0.95rem; font-weight: 600;
  white-space: nowrap;
  padding: 0.6rem 1.4rem;
  border-radius: 40px;
  display: flex; align-items: center; gap: 0.6rem;
  
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
  font-family: 'Poppins', sans-serif;
  
  /* Sharp crisp shadow */
  box-shadow: 
    0 8px 25px rgba(0,0,0,0.1), 
    inset 0 1px 0 rgba(255,255,255,1);
}

.caption-dot { 
  width: 10px; height: 10px; 
  border-radius: 50%; 
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.photo-bubble.is-hovered .bubble-caption { 
  opacity: 1; 
  transform: translateX(-50%) translateY(0); 
  transition-delay: 0.1s; /* Slight delay to let the card expand first */
}

/* ── Stats Strip ──────────────────────────────────────── */
.gallery-stats {
  display: flex; justify-content: center;
  gap: 4rem; padding: 3rem 2rem;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.gstat { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.gstat-num { font-size: 2.5rem; font-weight: 800; color: #0f172a; font-family: 'Poppins', sans-serif; line-height: 1; letter-spacing: -0.03em; }
.gstat-lbl { font-size: 0.85rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Fade-up ──────────────────────────────────────────── */
[data-fade-gallery] {
  opacity: 0; transform: translateY(28px);
  transition: opacity 0.65s ease, transform 0.65s ease;
}
[data-fade-gallery].is-visible { opacity: 1; transform: translateY(0); }

/* ── Responsive adjustments ───────────────────────────── */
@media (max-width: 1024px) {
  .bubble-tank { height: 550px; }
  .photo-bubble { transform: translate(-50%, -50%) scale(0.85) !important; }
}
@media (max-width: 640px) {
  .bubble-tank { height: 450px; }
  .photo-bubble { transform: translate(-50%, -50%) scale(0.6) !important; }
  .photo-bubble.is-hovered {
    width: 90vw !important;
    height: 250px !important;
  }
  .gallery-stats { gap: 2rem; }
  .gstat-num { font-size: 2rem; }
}
</style>
