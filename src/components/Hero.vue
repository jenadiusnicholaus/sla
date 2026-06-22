<template>
  <section id="home" class="hero">
    <div class="hero-stripe top-stripe"></div>
    <div class="hero-content">
      <p class="hero-eyebrow">Street Digital Labs Africa</p>
      <h2 class="hero-title">Inclusion for All!</h2>
      <p class="hero-subtitle">
        A digital skills and innovation hub committed to empowering young people
        and communities across Africa through technology, training, and
        inclusive opportunities.
      </p>
      <div class="hero-buttons">
        <button class="btn btn-primary">Join Us Today</button>
        <button class="btn btn-secondary">Learn More</button>
      </div>
    </div>
    <div class="hero-stripes">
      <div class="stripe stripe-orange"></div>
      <div class="stripe stripe-white"></div>
      <div class="stripe stripe-green"></div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: #0a1f44;
  color: white;
  padding: 7rem 2rem 5rem;
  text-align: center;
  margin-top: 62px;
  position: relative;
  overflow: hidden;
}

.hero-stripes {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 6px;
}

.stripe {
  flex: 1;
}

.stripe-orange {
  background: #ff6a00;
}
.stripe-white {
  background: #ffffff;
}
.stripe-green {
  background: #0a7a3d;
}

.hero-content {
  max-width: 820px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  font-size: 0.95rem;
  font-weight: 500;
  color: #ff6a00;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.15;
  font-family: "Poppins", sans-serif;
}

.hero-subtitle {
  font-size: 1.15rem;
  margin-bottom: 2.5rem;
  opacity: 0.88;
  line-height: 1.7;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 2.2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Poppins", sans-serif;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: #ff6a00;
  color: white;
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.7);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>
