<script setup>
const programs = [
  {
    emoji: "💻",
    title: "Digital Skills Training",
    description:
      "Hands-on training in coding, web development, graphic design, and digital marketing for young Africans.",
    tag: "Flagship Program",
  },
  {
    emoji: "🚀",
    title: "Innovation Lab",
    description:
      "A creative space where participants develop tech solutions to solve real community challenges across Africa.",
    tag: "Innovation",
  },
  {
    emoji: "🎓",
    title: "Mentorship & Coaching",
    description:
      "One-on-one mentorship from industry experts to guide participants on career paths and entrepreneurship.",
    tag: "Empowerment",
  },
  {
    emoji: "🤝",
    title: "Community Outreach",
    description:
      "Inclusive programs bringing digital skills to underserved communities, schools, and grassroots organizations.",
    tag: "Inclusion",
  },
];
</script>

<template>
  <section id="services" class="services">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Our Programs</h2>
        <div class="title-bar"></div>
        <p class="section-description">
          Comprehensive digital skills solutions tailored to empower African
          communities
        </p>
      </div>
      <div class="services-grid">
        <div
          v-for="program in programs"
          :key="program.title"
          class="service-card"
        >
          <div class="service-emoji">{{ program.emoji }}</div>
          <span class="service-tag">{{ program.tag }}</span>
          <h3 class="service-title">{{ program.title }}</h3>
          <p class="service-description">{{ program.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  background: #f4f6f9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.section-header {
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
  background: #0a7a3d;
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.section-description {
  font-size: 1.05rem;
  color: #555;
  max-width: 620px;
  margin: 0 auto;
  line-height: 1.7;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border-top: 4px solid #ff6a00;
}

.service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.service-emoji {
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.service-tag {
  display: inline-block;
  background: #fff0e6;
  color: #ff6a00;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}

.service-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0a1f44;
  margin-bottom: 0.75rem;
  font-family: "Poppins", sans-serif;
}

.service-description {
  color: #555;
  line-height: 1.7;
  font-size: 0.95rem;
}
</style>
