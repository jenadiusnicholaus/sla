<script setup lang="ts">
interface Stat {
  value: string
  label: string
}

const emit = defineEmits<{
  (e: 'open-donate'): void
}>()

const stats: Stat[] = [
  { value: '10K+', label: 'Youth Trained' },
  { value: '36',   label: 'States Reached' },
  { value: '98%',  label: 'Success Rate' },
  { value: '50+',  label: 'Expert Trainers' },
]
</script>

<template>
  <section id="home" class="hero">
    <!-- Background video -->
    <video
      class="hero-video"
      autoplay muted loop playsinline
      poster="/images/STREET_DIGITAL_LABS_AFRICA.png"
    >
      <source src="/video/IMG_9125.MP4" type="video/mp4" />
    </video>
    <div class="hero-overlay" aria-hidden="true"></div>



    <!-- Main content grid -->
    <div class="hero-content">
      <!-- Left column -->
      <div class="hero-left">
        <h1 class="hero-title">
          Empowering Africa<br />
          <span class="hero-accent">One Skill at a Time.</span>
        </h1>
        <p class="hero-desc">
          We are a digital skills &amp; innovation hub — training, mentoring, and
          uplifting young Africans to thrive in the digital economy.
        </p>
        <div class="hero-actions">
          <button class="btn-primary" @click="emit('open-donate')" id="hero-donate-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" class="btn-icon" aria-hidden="true">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            Donate Now
          </button>
          <a href="#services" class="btn-outline" id="hero-explore-btn">Explore Programs ↓</a>
        </div>

        <!-- Stats row -->
        <div class="hero-stats" role="list" aria-label="Impact statistics">
          <div
            v-for="s in stats"
            :key="s.label"
            class="stat-item"
            role="listitem"
          >
            <span class="stat-val">{{ s.value }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Right column — impact card -->
      <div class="hero-right">
        <div class="impact-card">
          <div class="impact-top">
            <span class="impact-label">OUR IMPACT</span>
            <span class="impact-badge">🏆 Best EdTech 2024</span>
          </div>
          <h2 class="impact-title">Digital Skills<br />for Everyone</h2>
          <p class="impact-sub">Empowering communities. Building futures.</p>

          <div class="impact-tags">
            <span
              class="tag"
              v-for="t in ['Inclusion', 'Innovation', 'Empowerment', 'Community']"
              :key="t"
            >{{ t }}</span>
          </div>

          <div class="impact-progress">
            <div class="prog-row">
              <span>Youth Trained</span>
              <span class="prog-val">10,000+</span>
            </div>
            <div class="prog-bar-bg">
              <div class="prog-bar" style="width: 78%"></div>
            </div>
            <div class="prog-row" style="margin-top: 1rem">
              <span>States Reached</span>
              <span class="prog-val">36 / 36</span>
            </div>
            <div class="prog-bar-bg">
              <div class="prog-bar prog-bar-green" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom stripe -->
    <div class="bottom-stripe" aria-hidden="true">
      <div class="bs green"></div>
      <div class="bs white"></div>
      <div class="bs orange"></div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-hint" aria-hidden="true">
      <div class="scroll-mouse">
        <div class="scroll-wheel"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ── Hero shell ──────────────────────────────────────── */
.hero {
  position: relative; overflow: hidden;
  min-height: 100vh;
  display: flex; align-items: center;
  padding: 0 2rem;
  color: #fff;
}

.hero-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 0;
}
.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(
    135deg,
    rgba(4, 12, 32, 0.6) 0%,
    rgba(6, 18, 48, 0.5) 50%,
    rgba(10, 26, 60, 0.4) 100%
  );
}

/* ── Floating badge ──────────────────────────────────── */
.hero-badge {
  position: absolute;
  top: calc(100px + 2rem); left: 50%;
  transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.4rem 1.2rem; border-radius: 50px;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 0.08em; color: rgba(255, 255, 255, 0.85);
  font-family: 'Poppins', sans-serif;
  text-transform: uppercase; z-index: 3;
  animation: fadeDown 0.7s ease both;
}
.badge-dot {
  width: 8px; height: 8px;
  border-radius: 50%; background: #ff6a00;
  animation: pulse 1.8s infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.6);opacity:0.5;} }
@keyframes fadeDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Content grid ────────────────────────────────────── */
.hero-content {
  position: relative; z-index: 2;
  max-width: 1280px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 1.15fr 0.85fr;
  gap: 5rem; align-items: center;
  padding-top: 8rem; padding-bottom: 5rem;
}
.hero-left  { animation: fadeUp 0.8s ease 0.1s both; }
.hero-right { animation: fadeUp 0.8s ease 0.3s both; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Typography ──────────────────────────────────────── */
.hero-title {
  font-size: clamp(2.6rem, 5vw, 4.4rem);
  font-weight: 800; line-height: 1.1;
  font-family: 'Poppins', sans-serif;
  letter-spacing: -0.03em; margin-bottom: 1.5rem;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}
.hero-accent { color: #ff6a00; }

.hero-desc {
  font-size: 1.05rem; line-height: 1.85;
  color: rgba(255, 255, 255, 0.75);
  max-width: 520px; margin-bottom: 2.5rem;
}

/* ── CTAs ────────────────────────────────────────────── */
.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 3.5rem; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 0.55rem;
  background: linear-gradient(135deg, #ff6a00, #e04500);
  color: #fff; font-size: 1rem; font-weight: 700;
  font-family: 'Poppins', sans-serif;
  padding: 1rem 2.4rem; border-radius: 50px;
  border: none; cursor: pointer;
  box-shadow: 0 8px 30px rgba(255, 106, 0, 0.5);
  transition: transform 0.25s, box-shadow 0.25s;
}
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(255, 106, 0, 0.6); }
.btn-icon { width: 18px; height: 18px; }

.btn-outline {
  display: inline-flex; align-items: center;
  color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; font-weight: 600;
  font-family: 'Poppins', sans-serif;
  padding: 1rem 2rem; border-radius: 50px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  text-decoration: none;
  transition: border-color 0.25s, color 0.25s, background 0.25s;
}
.btn-outline:hover { border-color: #ff6a00; color: #ff6a00; background: rgba(255, 106, 0, 0.07); }

/* ── Stats ───────────────────────────────────────────── */
.hero-stats { display: flex; gap: 2.5rem; }
.stat-item  { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-val   { font-size: 2rem; font-weight: 800; color: #fff; font-family: 'Poppins', sans-serif; line-height: 1; }
.stat-lbl   { font-size: 0.72rem; color: rgba(255, 255, 255, 0.45); letter-spacing: 0.04em; }

/* ── Impact card ─────────────────────────────────────── */
.impact-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px; padding: 2.5rem;
  transition: transform 0.3s;
}
.impact-card:hover { transform: translateY(-4px); }

.impact-top  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.impact-label { font-size: 0.68rem; letter-spacing: 0.14em; color: rgba(255,255,255,0.38); font-weight: 700; text-transform: uppercase; }
.impact-badge {
  font-size: 0.72rem; font-weight: 600; color: #ff6a00;
  background: rgba(255, 106, 0, 0.12);
  padding: 0.2rem 0.7rem; border-radius: 20px;
  border: 1px solid rgba(255, 106, 0, 0.25);
}
.impact-title { font-size: 2.1rem; font-weight: 800; line-height: 1.2; font-family: 'Poppins', sans-serif; margin-bottom: 0.5rem; }
.impact-sub   { font-size: 0.88rem; color: rgba(255,255,255,0.45); margin-bottom: 1.5rem; }

.impact-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem; }
.tag {
  font-size: 0.78rem; font-weight: 500; font-family: 'Poppins', sans-serif;
  padding: 0.28rem 0.9rem; border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.65);
}

/* Progress bars */
.prog-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: rgba(255,255,255,0.6); margin-bottom: 0.5rem; }
.prog-val { font-weight: 700; color: #fff; }
.prog-bar-bg { height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden; }
.prog-bar { height: 100%; background: linear-gradient(90deg, #ff6a00, #ffad70); border-radius: 10px; transition: width 1.2s ease; }
.prog-bar-green { background: linear-gradient(90deg, #0a7a3d, #2dd47a); }

/* ── Bottom stripe ───────────────────────────────────── */
.bottom-stripe { position: absolute; bottom: 0; left: 0; right: 0; display: flex; height: 5px; z-index: 3; }
.bs { flex: 1; }
.bs.green  { background: #0a7a3d; }
.bs.white  { background: rgba(255, 255, 255, 0.6); }
.bs.orange { background: #ff6a00; }

/* ── Scroll indicator ────────────────────────────────── */
.scroll-hint {
  position: absolute; bottom: 2.5rem; left: 50%;
  transform: translateX(-50%);
  z-index: 3; display: flex; flex-direction: column; align-items: center;
  animation: scrollBounce 2s ease-in-out infinite;
}
.scroll-mouse {
  width: 24px; height: 38px; border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex; justify-content: center; padding-top: 6px;
}
.scroll-wheel {
  width: 4px; height: 8px; border-radius: 2px;
  background: rgba(255, 255, 255, 0.5);
  animation: scrollWheel 2s ease-in-out infinite;
}
@keyframes scrollWheel { 0%,100%{transform:translateY(0);opacity:1;} 50%{transform:translateY(8px);opacity:0;} }
@keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(6px);} }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .hero-content { grid-template-columns: 1fr; gap: 3rem; text-align: center; padding-top: 9rem; }
  .hero-desc   { max-width: 100%; margin-left: auto; margin-right: auto; }
  .hero-actions { justify-content: center; }
  .hero-stats  { justify-content: center; }
  .hero-badge  { top: 90px; }
}
@media (max-width: 600px) {
  .hero-actions { flex-direction: column; align-items: stretch; }
  .btn-primary, .btn-outline { text-align: center; justify-content: center; }
  .hero-stats  { gap: 1.5rem; flex-wrap: wrap; }
}
</style>
