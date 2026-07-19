<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api/client'

const route = useRoute()
const project = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    project.value = await api(`/projects/${route.params.slug}/`)
  } catch (e) {
    error.value = e.message || 'Project not found'
  }
})
</script>

<template>
  <div class="project" v-if="project">
    <p class="brand">Street Labs Africa · Projects</p>
    <h1>{{ project.title }}</h1>
    <p>{{ project.summary || project.description }}</p>
    <a v-if="project.website_url" :href="project.website_url" target="_blank" rel="noopener">Visit project</a>
  </div>
  <div v-else class="state">{{ error || 'Loading…' }}</div>
</template>

<style scoped>
.project, .state {
  min-height: 100vh;
  display: grid;
  place-content: center;
  padding: 2rem;
  font-family: Poppins, sans-serif;
  background: linear-gradient(160deg, #0a1f44, #102a4f);
  color: #fff;
  text-align: center;
}
.brand { letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.75rem; color: #ff6a00; }
h1 { font-size: 2.4rem; margin: 0.8rem 0; }
a { color: #fff; }
</style>
