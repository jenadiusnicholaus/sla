<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { cmsApi } from '@/api/client'

export interface Official {
  id?: number
  name: string
  role: string
  bio?: string
  initials?: string
  photo?: string | null
  email?: string
  linkedin_url?: string
  avatar_color?: string
  color?: string
  accepts_meetings?: boolean
}

const props = defineProps<{
  official: Official | null
  open: boolean
  startOnBook?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const step = ref<'preview' | 'book'>('preview')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  organization: '',
  preferred_at: '',
  topic: '',
  message: '',
})

const accent = computed(
  () => props.official?.avatar_color || props.official?.color || '#ff6a00',
)

const canBook = computed(
  () => props.official?.accepts_meetings !== false && Boolean(props.official?.id),
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      step.value = props.startOnBook && canBook.value ? 'book' : 'preview'
      sent.value = false
      error.value = ''
      Object.assign(form, {
        name: '',
        email: '',
        phone: '',
        organization: '',
        preferred_at: '',
        topic: '',
        message: '',
      })
    }
  },
)

function close() {
  emit('close')
}

function toIsoLocal(value: string) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toISOString()
}

async function submit() {
  error.value = ''
  if (!props.official?.id) {
    error.value = 'This official cannot take meeting requests yet.'
    return
  }
  if (!form.name || !form.email || !form.preferred_at) {
    error.value = 'Name, email, and preferred time are required.'
    return
  }
  sending.value = true
  try {
    await cmsApi.postMeetingRequest({
      official: props.official.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      organization: form.organization,
      preferred_at: toIsoLocal(form.preferred_at),
      topic: form.topic,
      message: form.message,
    })
    sent.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Could not submit request.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open && official"
        class="overlay"
        @click.self="close"
        role="dialog"
        aria-modal="true"
        :aria-label="`Official: ${official.name}`"
      >
        <div class="sheet">
          <button type="button" class="close" aria-label="Close" @click="close">✕</button>

          <template v-if="step === 'preview' && !sent">
            <div class="hero" :style="{ background: accent }">
              <img
                v-if="official.photo"
                :src="official.photo"
                :alt="official.name"
                class="photo"
              />
              <div v-else class="photo placeholder">{{ official.initials || official.name.slice(0, 1) }}</div>
            </div>
            <div class="body">
              <p class="role">{{ official.role }}</p>
              <h2>{{ official.name }}</h2>
              <p class="bio">
                {{ official.bio || 'Leadership at Street Digital Labs Africa — open to conversations that advance digital skills and inclusion.' }}
              </p>
              <div class="meta" v-if="official.email || official.linkedin_url">
                <a v-if="official.email" :href="`mailto:${official.email}`">{{ official.email }}</a>
                <a
                  v-if="official.linkedin_url"
                  :href="official.linkedin_url"
                  target="_blank"
                  rel="noopener"
                >LinkedIn</a>
              </div>
              <div class="actions">
                <button type="button" class="ghost" @click="close">Close</button>
                <button
                  v-if="canBook"
                  type="button"
                  class="primary"
                  @click="step = 'book'"
                >
                  Book a meeting
                </button>
                <p v-else class="unavailable">Meetings unavailable for this official</p>
              </div>
            </div>
          </template>

          <template v-else-if="step === 'book' && !sent">
            <div class="body book">
              <button type="button" class="back" @click="step = 'preview'">← Back</button>
              <h2>Book with {{ official.name }}</h2>
              <p class="sub">Share your details and a preferred time. Our team will confirm shortly.</p>

              <label>Full name<input v-model="form.name" required /></label>
              <label>Email<input v-model="form.email" type="email" required /></label>
              <label>Phone<input v-model="form.phone" type="tel" /></label>
              <label>Organization<input v-model="form.organization" /></label>
              <label>Preferred date & time<input v-model="form.preferred_at" type="datetime-local" required /></label>
              <label>Topic<input v-model="form.topic" placeholder="What would you like to discuss?" /></label>
              <label>Message<textarea v-model="form.message" rows="3" placeholder="Optional notes" /></label>

              <p v-if="error" class="error">{{ error }}</p>
              <button type="button" class="primary full" :disabled="sending" @click="submit">
                {{ sending ? 'Sending…' : 'Submit request' }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="body success">
              <div class="check">✓</div>
              <h2>Request sent</h2>
              <p>
                Thanks — your meeting request with <strong>{{ official.name }}</strong> is pending review.
                We’ll follow up by email.
              </p>
              <button type="button" class="primary" @click="close">Done</button>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(6, 21, 46, 0.55);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.sheet {
  width: min(440px, 100%);
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.28);
  max-height: min(92vh, 820px);
  overflow-y: auto;
}
.close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  border: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font: inherit;
}
.hero {
  height: 160px;
  display: grid;
  place-items: center;
}
.photo {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
.photo.placeholder {
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
}
.body {
  padding: 1.25rem 1.35rem 1.5rem;
}
.body.book,
.body.success {
  padding-top: 2.5rem;
}
.role {
  margin: 0;
  color: #ff6a00;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
h2 {
  margin: 0.25rem 0 0.65rem;
  color: #0a1f44;
  font-size: 1.35rem;
}
.bio {
  margin: 0 0 1rem;
  color: #5b6b82;
  line-height: 1.65;
  font-size: 0.92rem;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}
.meta a {
  color: #0a1f44;
  font-size: 0.85rem;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-wrap: wrap;
}
.primary,
.ghost,
.back {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1.15rem;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.primary {
  background: #ff6a00;
  color: #fff;
}
.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.primary.full {
  width: 100%;
  margin-top: 0.35rem;
}
.ghost {
  background: #eef2f7;
  color: #0a1f44;
}
.back {
  background: transparent;
  color: #5b6b82;
  padding: 0;
  margin-bottom: 0.5rem;
}
.sub {
  margin: 0 0 1rem;
  color: #5b6b82;
  font-size: 0.9rem;
}
label {
  display: grid;
  gap: 0.3rem;
  color: #5b6b82;
  font-size: 0.85rem;
  margin-bottom: 0.65rem;
}
input,
textarea {
  border: 1px solid #d8dee8;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font: inherit;
  color: #0a1f44;
}
.error {
  color: #b42318;
  font-size: 0.88rem;
}
.unavailable {
  margin: 0;
  color: #5b6b82;
  font-size: 0.85rem;
}
.success {
  text-align: center;
}
.check {
  width: 56px;
  height: 56px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: rgba(10, 122, 61, 0.12);
  color: #0a7a3d;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  font-weight: 700;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
