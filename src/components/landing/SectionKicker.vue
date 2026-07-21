<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    index?: string
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
  <div
    class="section-kicker"
    :class="[`align-${align}`, `accent-${accent}`]"
  >
    <span v-if="index" class="kicker-index">{{ index }}</span>
    <span class="kicker-rule" aria-hidden="true" />
    <span class="kicker-text">{{ label }}</span>
    <span v-if="align === 'center'" class="kicker-rule" aria-hidden="true" />
  </div>
</template>
