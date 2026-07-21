<script setup>
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

defineProps({
  open: { type: Boolean, default: false },
  secondsLeft: { type: Number, default: 30 },
})

const emit = defineEmits(['stay', 'logout'])
</script>

<template>
  <DialogRoot :open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-[100] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        :class="
          cn(
            'session-timeout-dialog fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden border bg-background p-0 shadow-lg duration-200 sm:rounded-lg',
          )
        "
        @pointer-down-outside.prevent
        @escape-key-down.prevent
      >
        <div class="session-timeout-body">
          <DialogTitle class="text-lg font-semibold tracking-tight text-foreground">
            Session expiring
          </DialogTitle>
          <DialogDescription class="text-sm leading-relaxed text-muted-foreground">
            You have been inactive for 5 minutes. For your security, you will be signed out in
            <strong class="font-semibold text-foreground">{{ secondsLeft }}</strong>
            {{ secondsLeft === 1 ? 'second' : 'seconds' }}
            unless you choose to stay signed in.
          </DialogDescription>
        </div>

        <div class="session-timeout-footer">
          <Button type="button" variant="outline" @click="emit('logout')">Log out</Button>
          <Button type="button" @click="emit('stay')">Stay logged in</Button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.session-timeout-body {
  display: grid;
  gap: 0.5rem;
  padding: 1.75rem 1.75rem 1.25rem;
}

.session-timeout-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem 1.75rem;
  border-top: 1px solid rgba(10, 31, 68, 0.08);
  background: rgba(244, 246, 249, 0.65);
}
</style>
