<script setup>
const aboutData = {
  title: "About Street Labs",
  description:
    "Street Digital Labs Africa (Street Labs) is a digital skills and innovation hub committed to empowering young people and communities across Africa through technology, training, and inclusive opportunities.",
  mission:
    "To empower Africans with digital skills, innovation, and opportunities for a better future.",
  vision: "An inclusive Africa where everyone thrives in the digital economy.",
  stats: [
    { number: "10K+", label: "Youth Trained" },
    { number: "36", label: "States Reached" },
    { number: "98%", label: "Success Rate" },
    { number: "50+", label: "Expert Trainers" },
  ],
};
</script>

<template>
  <section id="about" class="about">
    <div class="container">
      <div class="about-header">
        <h2 class="section-title">{{ aboutData.title }}</h2>
        <div class="title-bar"></div>
        <p class="section-description">{{ aboutData.description }}</p>
      </div>

      <div class="mission-vision-grid">
        <div class="mv-card mission-card">
          <div class="mv-icon">🎯</div>
          <h3 class="mv-heading">Mission</h3>
          <p class="mv-text">{{ aboutData.mission }}</p>
        </div>
        <div class="mv-card vision-card">
          <div class="mv-icon">🌍</div>
          <h3 class="mv-heading">Vision</h3>
          <p class="mv-text">{{ aboutData.vision }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div
          v-for="stat in aboutData.stats"
          :key="stat.label"
          class="stat-card"
        >
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  background: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.about-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.4rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}

.title-bar {
  width: 60px;
  height: 4px;
  background: #ff6a00;
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.section-description {
  font-size: 1.05rem;
  color: #555;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.75;
}

.mission-vision-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.mv-card {
  padding: 2rem;
  border-radius: 12px;
  border-left: 5px solid;
}

.mission-card {
  background: #fff8f3;
  border-color: #ff6a00;
}

.vision-card {
  background: #f0faf4;
  border-color: #0a7a3d;
}

.mv-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.mv-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 0.5rem;
  font-family: "Poppins", sans-serif;
}

.mv-text {
  color: #555;
  line-height: 1.7;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: #0a1f44;
  color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ff6a00;
  margin-bottom: 0.5rem;
  font-family: "Poppins", sans-serif;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .mission-vision-grid {
    grid-template-columns: 1fr;
  }
}
</style>
