<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    submitLabel?: string
    cancelLabel?: string
    loading?: boolean
    size?: 'md' | 'lg' | 'xl'
    class?: HTMLAttributes['class']
  }>(),
  {
    submitLabel: 'Save',
    cancelLabel: 'Cancel',
    loading: false,
    size: 'md',
  },
)

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const sizeClass = computed(() => {
  if (props.size === 'xl') return 'max-w-3xl'
  if (props.size === 'lg') return 'max-w-2xl'
  return 'max-w-lg'
})

function setOpen(value: boolean) {
  emit('update:open', value)
}

function onCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <Dialog :open="open" @update:open="(value) => (value ? setOpen(true) : onCancel())">
    <DialogContent
      :class="
        cn(
          'form-dialog-shell gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:rounded-xl',
          sizeClass,
          props.class,
        )
      "
    >
      <Card class="w-full overflow-hidden rounded-xl border border-border/80 shadow-xl">
        <div class="form-dialog-header border-b border-border/70">
          <DialogHeader class="space-y-2 text-left">
            <DialogTitle class="text-xl font-semibold tracking-tight text-foreground">
              {{ title }}
            </DialogTitle>
            <DialogDescription
              v-if="description"
              class="text-sm leading-relaxed text-muted-foreground"
            >
              {{ description }}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div class="form-dialog-body">
          <slot />
        </div>

        <div class="form-dialog-footer border-t border-border/70 bg-muted/30">
          <slot name="footer">
            <Button type="button" variant="outline" :disabled="loading" @click="onCancel">
              {{ cancelLabel }}
            </Button>
            <Button type="button" :disabled="loading" @click="emit('submit')">
              {{ loading ? 'Saving…' : submitLabel }}
            </Button>
          </slot>
        </div>
      </Card>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.form-dialog-header {
  padding: 2rem 2rem 1.5rem;
  padding-right: 3.25rem;
}

.form-dialog-body {
  max-height: min(72vh, 640px);
  overflow-y: auto;
  padding: 2rem;
}

.form-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
}

:deep(.form-dialog-shell > button) {
  right: 1.25rem;
  top: 1.25rem;
}

:deep(.form-dialog-body > .dialog-form) {
  display: grid;
  gap: 2rem;
}

:deep(.form-dialog-body .dialog-form section) {
  display: grid;
  gap: 1.25rem;
}

:deep(.form-dialog-body .dialog-form .field),
:deep(.form-dialog-body .dialog-form label:not(.check)) {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

:deep(.form-dialog-body .dialog-form h3) {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--foreground);
}

:deep(.form-dialog-body .dialog-form .row2),
:deep(.form-dialog-body .dialog-form .row3) {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

:deep(.form-dialog-body .dialog-form .row3) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

:deep(.form-dialog-body .dialog-form input:not([type='checkbox']):not([type='color'])),
:deep(.form-dialog-body .dialog-form textarea),
:deep(.form-dialog-body .dialog-form select) {
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
}

:deep(.form-dialog-body .dialog-form textarea) {
  min-height: 6.5rem;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
}

@media (max-width: 720px) {
  .form-dialog-header,
  .form-dialog-body,
  .form-dialog-footer {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .form-dialog-header {
    padding-top: 1.5rem;
    padding-right: 2.75rem;
  }

  :deep(.form-dialog-body .dialog-form .row2),
  :deep(.form-dialog-body .dialog-form .row3) {
    grid-template-columns: 1fr;
  }
}
</style>
