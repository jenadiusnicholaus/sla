<script setup>
import { onMounted } from 'vue'
import { useHomepageCms } from '@/composables/useHomepageCms'
import './connect.css'

const { load } = useHomepageCms()
onMounted(() => {
  load()
})
</script>

<template>
  <div class="connect-root">
    <div class="connect-bg" aria-hidden="true" />
    <div class="connect-shell">
      <router-view />
    </div>
  </div>
</template>
