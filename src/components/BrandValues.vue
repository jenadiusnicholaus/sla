<script setup>
const values = [
  {
    emoji: '🤲',
    title: 'Inclusion',
    description: 'We believe in equal opportunities for all.',
    color: '#FF6A00'
  },
  {
    emoji: '💡',
    title: 'Innovation',
    description: 'We foster creativity and digital solutions.',
    color: '#0A7A3D'
  },
  {
    emoji: '🎓',
    title: 'Empowerment',
    description: 'We equip individuals with skills for success.',
    color: '#FF6A00'
  },
  {
    emoji: '🤝',
    title: 'Integrity',
    description: 'We act with honesty, transparency and respect.',
    color: '#0A7A3D'
  },
  {
    emoji: '🌐',
    title: 'Community',
    description: 'We build networks that create impact.',
    color: '#FF6A00'
  }
]
</script>

<template>
  <section id="values" class="brand-values">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Our Brand Values</h2>
        <div class="title-bar"></div>
        <p class="section-description">The principles that guide everything we do at Street Digital Labs Africa</p>
      </div>
      <div class="values-grid">
        <div v-for="value in values" :key="value.title" class="value-card">
          <div class="value-emoji" :style="{ background: value.color + '1a', borderColor: value.color }">
            {{ value.emoji }}
          </div>
          <h3 class="value-title" :style="{ color: value.color }">{{ value.title }}</h3>
          <p class="value-description">{{ value.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.brand-values {
  background: #0A1F44;
  color: white;
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
  color: #ffffff;
  margin-bottom: 0.75rem;
  font-family: 'Poppins', sans-serif;
}

.title-bar {
  width: 60px;
  height: 4px;
  background: #FF6A00;
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.section-description {
  font-size: 1.05rem;
  color: rgba(255,255,255,0.7);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1.5rem;
}

.value-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1.75rem 1.5rem;
  border-radius: 14px;
  text-align: center;
  transition: background 0.3s, transform 0.3s;
}

.value-card:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-4px);
}

.value-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: 1.75rem;
  border-radius: 50%;
  border: 2px solid;
  margin-bottom: 1rem;
}

.value-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Poppins', sans-serif;
}

.value-description {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  line-height: 1.6;
}
</style>
