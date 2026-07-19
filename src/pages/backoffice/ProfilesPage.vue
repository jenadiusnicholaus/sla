<script setup>
import { onMounted, reactive, ref } from 'vue'
import { profileApi } from '@/api/client'

const profiles = ref([])
const error = ref('')
const form = reactive({
  username: '',
  display_name: '',
  position: '',
  bio: '',
  email: '',
  phone: '',
  website: '',
  meeting_url: '',
  is_public: true,
  social_links: [],
})
const editing = ref(null)

async function load() {
  try {
    const data = await profileApi.list()
    profiles.value = data.results || data
  } catch (e) {
    error.value = e.message
  }
}

function edit(profile) {
  editing.value = profile.username
  Object.assign(form, {
    username: profile.username,
    display_name: profile.display_name,
    position: profile.position || '',
    bio: profile.bio || '',
    email: profile.email || '',
    phone: profile.phone || '',
    website: profile.website || '',
    meeting_url: profile.meeting_url || '',
    is_public: profile.is_public,
    social_links: profile.social_links || [],
  })
}

function addSocial() {
  form.social_links.push({ platform: 'linkedin', label: 'LinkedIn', url: '', order: form.social_links.length + 1, is_active: true })
}

async function save() {
  await profileApi.save(editing.value, { ...form })
  editing.value = null
  Object.assign(form, {
    username: '', display_name: '', position: '', bio: '', email: '', phone: '', website: '', meeting_url: '', is_public: true, social_links: [],
  })
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <h1>Employee Profiles</h1>
    <p class="sub">Public identity pages at /profiles/{username}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="panel">
      <h2>{{ editing ? 'Edit profile' : 'Create profile' }}</h2>
      <div class="grid">
        <input v-model="form.username" placeholder="username" :disabled="Boolean(editing)" />
        <input v-model="form.display_name" placeholder="Display name" />
        <input v-model="form.position" placeholder="Position" />
        <input v-model="form.email" placeholder="Email" />
        <input v-model="form.phone" placeholder="Phone" />
        <input v-model="form.website" placeholder="Website" />
        <input v-model="form.meeting_url" placeholder="Meeting URL" />
      </div>
      <textarea v-model="form.bio" rows="3" placeholder="Bio" />
      <button type="button" class="ghost" @click="addSocial">Add social link</button>
      <div v-for="(s, i) in form.social_links" :key="i" class="social">
        <input v-model="s.platform" placeholder="platform" />
        <input v-model="s.label" placeholder="label" />
        <input v-model="s.url" placeholder="url" />
      </div>
      <button class="cta" @click="save">Save profile</button>
    </section>

    <div v-for="p in profiles" :key="p.id" class="list-item">
      <div>
        <strong>{{ p.display_name }}</strong>
        <p>@{{ p.username }} · {{ p.position }}</p>
      </div>
      <div class="actions">
        <router-link :to="`/profiles/${p.username}`" target="_blank">View</router-link>
        <button @click="edit(p)">Edit</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 { margin-bottom: 0.2rem; }
.sub, p { color: #5b6b82; }
.panel { background: #fff; border-radius: 16px; padding: 1rem; display: grid; gap: 0.7rem; margin: 1rem 0; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.6rem; }
input, textarea { border: 1px solid #d8dee8; border-radius: 10px; padding: 0.7rem 0.8rem; font: inherit; }
.social { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 0.5rem; }
.cta, .ghost, .actions button, .actions a {
  border: 0; border-radius: 999px; padding: 0.55rem 0.9rem; font: inherit; cursor: pointer; text-decoration: none; color: #0a1f44;
}
.cta { background: #ff6a00; color: #fff; font-weight: 600; justify-self: start; }
.ghost, .actions button, .actions a { background: #eef2f7; }
.list-item {
  background: #fff; border-radius: 14px; padding: 0.9rem 1rem; margin-top: 0.6rem;
  display: flex; justify-content: space-between; gap: 1rem; align-items: center;
}
.actions { display: flex; gap: 0.4rem; }
.error { color: #b42318; }
</style>
