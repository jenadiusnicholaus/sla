<template>
  <section id="home" class="hero">
    <div class="bg-shape bg-shape-1"></div>
    <div class="bg-shape bg-shape-2"></div>

    <div class="hero-inner">
      <div class="hero-left">
        <div class="eyebrow">
          <span class="eyebrow-dot"></span>
          Street Digital Labs Africa
        </div>
        <h1 class="hero-title">
          Empowering Africa<br />
          <span class="accent">One Skill at a Time.</span>
        </h1>
        <p class="hero-body">
          We are a digital skills and innovation hub committed to empowering
          young people across Africa through hands-on technology training,
          mentorship, and inclusive opportunities.
        </p>
        <div class="hero-cta">
          <a href="#services" class="btn-primary">Explore Programs</a>
          <a href="#about" class="btn-ghost">Our Story</a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">10K+</span>
            <span class="stat-desc">Youth Trained</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-num">36</span>
            <span class="stat-desc">States Reached</span>
          </div>
          <div class="stat-sep"></div>
          <div class="stat">
            <span class="stat-num">98%</span>
            <span class="stat-desc">Success Rate</span>
          </div>
        </div>
      </div>

      <div class="hero-right">
        <div class="impact-card">
          <p class="impact-label">Our Impact</p>
          <h2 class="impact-heading">Digital Skills<br />for Everyone</h2>
          <p class="impact-sub">Empowering communities. Building futures.</p>
          <div class="impact-tags">
            <span class="tag">Inclusion</span>
            <span class="tag">Innovation</span>
            <span class="tag">Empowerment</span>
            <span class="tag">Community</span>
          </div>
          <div class="impact-stripe">
            <div class="istripe orange"></div>
            <div class="istripe white"></div>
            <div class="istripe green"></div>
          </div>
        </div>
        <div class="side-card side-card-bottom">
          <span class="side-icon">🏆</span>
          <div>
            <strong>Award-Winning</strong>
            <p>Best EdTech Hub 2024</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-stripe">
      <div class="bstripe orange"></div>
      <div class="bstripe white"></div>
      <div class="bstripe green"></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: #0a1f44;
  color: #ffffff;
  min-height: 100vh;
  padding: 8rem 4rem 6rem;
  margin-top: 62px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.bg-shape-1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 106, 0, 0.07);
  top: -180px;
  right: -140px;
}

.bg-shape-2 {
  width: 380px;
  height: 380px;
  background: rgba(10, 122, 61, 0.06);
  bottom: -120px;
  left: -100px;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 5rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-left {
  animation: fadeUp 0.65s ease both;
}

.hero-right {
  animation: fadeUp 0.65s ease 0.15s both;
  position: relative;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff6a00;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff6a00;
  flex-shrink: 0;
}

.hero-title {
  font-size: 3.8rem;
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 1.5rem;
  font-family: "Poppins", sans-serif;
  letter-spacing: -0.02em;
}

.accent {
  color: #ff6a00;
}

.hero-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.62);
  margin-bottom: 2.5rem;
  max-width: 500px;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-block;
  text-decoration: none;
  background: #ff6a00;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  padding: 0.85rem 2rem;
  border-radius: 6px;
  transition:
    background 0.2s,
    transform 0.2s;
}

.btn-primary:hover {
  background: #e05e00;
  transform: translateY(-2px);
}

.btn-ghost {
  display: inline-block;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.95rem;
  font-weight: 500;
  font-family: "Poppins", sans-serif;
  padding: 0.85rem 2rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition:
    border-color 0.2s,
    color 0.2s,
    transform 0.2s;
}

.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-num {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
  line-height: 1;
}

.stat-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.42);
  letter-spacing: 0.02em;
}

.stat-sep {
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.12);
}

.impact-card {
  background: #0f2d5c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2.5rem;
  overflow: hidden;
}

.impact-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.38);
  margin-bottom: 0.9rem;
}

.impact-heading {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
  margin-bottom: 0.6rem;
}

.impact-sub {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.48);
  margin-bottom: 1.75rem;
}

.impact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tag {
  font-size: 0.78rem;
  font-weight: 500;
  font-family: "Poppins", sans-serif;
  padding: 0.28rem 0.85rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.65);
}

.impact-stripe {
  display: flex;
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  gap: 3px;
}

.istripe {
  flex: 1;
  border-radius: 3px;
}
.istripe.orange {
  background: #ff6a00;
}
.istripe.white {
  background: rgba(255, 255, 255, 0.35);
}
.istripe.green {
  background: #0a7a3d;
}

.side-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #0a1f44;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  min-width: 185px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
  transition: transform 0.22s ease;
}

.side-card:hover {
  transform: translateY(-4px);
}

.side-card-bottom {
  bottom: -18px;
  right: -20px;
}

.side-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.side-card strong {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  font-family: "Poppins", sans-serif;
  margin-bottom: 0.1rem;
}

.side-card p {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.42);
  margin: 0;
}

.bottom-stripe {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 4px;
  z-index: 2;
}

.bstripe {
  flex: 1;
}
.bstripe.orange {
  background: #ff6a00;
}
.bstripe.white {
  background: rgba(255, 255, 255, 0.45);
}
.bstripe.green {
  background: #0a7a3d;
}

@media (max-width: 1024px) {
  .hero {
    padding: 7rem 2rem 5rem;
  }

  .hero-inner {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .hero-body {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .hero-cta {
    justify-content: center;
  }
  .hero-stats {
    justify-content: center;
  }
  .side-card-bottom {
    display: none;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.4rem;
  }

  .hero-cta {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-ghost {
    text-align: center;
  }
  .hero-stats {
    gap: 1.25rem;
  }
  .stat-num {
    font-size: 1.4rem;
  }
}
</style>
