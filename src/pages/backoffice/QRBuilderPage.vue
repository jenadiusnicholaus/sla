<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const code = route.params.code
  if (code) {
    router.replace({ path: '/backoffice/qr', query: { edit: String(code) } })
  } else {
    router.replace({ path: '/backoffice/qr', query: { new: '1' } })
  }
})
</script>

<template>
  <p class="redirect">Opening QR dialog…</p>
</template>

<style scoped>
.redirect { color: #5b6b82; padding: 2rem 0; }
</style>
