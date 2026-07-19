<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { profileApi } from '@/api/client'

const route = useRoute()
const profile = ref(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    profile.value = await profileApi.get(route.params.username)
  } catch (e) {
    error.value = e.message || 'Profile not found'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="profile-page" v-if="profile" :style="{ '--p': profile.theme_primary, '--n': profile.theme_secondary }">
    <div class="hero-plane" />
    <main class="cardless">
      <p class="brand">Street Labs Africa</p>
      <div class="avatar" :style="{ background: profile.theme_primary }">
        <img v-if="profile.photo" :src="profile.photo" :alt="profile.display_name" />
        <span v-else>{{ profile.display_name.slice(0, 1) }}</span>
      </div>
      <h1>{{ profile.display_name }}</h1>
      <p class="role">{{ profile.position }}</p>
      <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>

      <div class="links">
        <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener">Website</a>
        <a v-if="profile.meeting_url" :href="profile.meeting_url" target="_blank" rel="noopener">Book Meeting</a>
        <a v-if="profile.vcard_enabled" :href="profileApi.vcardUrl(profile.username)">Download Contact</a>
        <a
          v-for="link in profile.social_links.filter((l) => l.is_active)"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener"
        >{{ link.label || link.platform }}</a>
      </div>
    </main>
  </div>
  <div v-else class="state">{{ loading ? 'Loading profile…' : error }}</div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
  font-family: 'Poppins', system-ui, sans-serif;
  color: #fff;
}
.hero-plane {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 31, 68, 0.2), rgba(10, 31, 68, 0.85)),
    linear-gradient(135deg, var(--n), #071526 60%, color-mix(in srgb, var(--p) 40%, #071526));
}
.cardless {
  position: relative;
  width: min(520px, 100%);
  text-align: center;
}
.brand {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.75rem;
  color: color-mix(in srgb, var(--p) 70%, white);
  margin-bottom: 1.5rem;
}
.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: grid;
  place-items: center;
  font-size: 2.4rem;
  font-weight: 700;
  overflow: hidden;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
h1 { font-size: clamp(2rem, 5vw, 2.8rem); line-height: 1.1; }
.role { color: rgba(255,255,255,0.8); margin: 0.4rem 0 1rem; }
.bio { color: rgba(255,255,255,0.72); margin-bottom: 1.5rem; }
.links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.7rem;
}
.links a {
  color: #fff;
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.16);
}
.state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Poppins, sans-serif;
}
</style>
