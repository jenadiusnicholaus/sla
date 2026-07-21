<script setup lang="ts">
import SectionKicker from './SectionKicker.vue'

withDefaults(
  defineProps<{
    index?: string
    kicker: string
    title: string
    description?: string
    align?: 'center' | 'left'
    accent?: 'orange' | 'green' | 'navy'
  }>(),
  {
    align: 'center',
    accent: 'orange',
  },
)
</script>

<template>
  <div class="landing-header" :class="[`align-${align}`]">
    <SectionKicker :index="index" :label="kicker" :align="align" :accent="accent" />
    <h2 class="landing-title">{{ title }}</h2>
    <p v-if="description" class="landing-lead">{{ description }}</p>
  </div>
</template>
