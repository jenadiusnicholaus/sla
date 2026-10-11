<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cmsApi } from '@/api/client'
import { useHomepageCms } from '@/composables/useHomepageCms'

const router = useRouter()
const { load, settings } = useHomepageCms()

onMounted(() => {
  load()
})

const phones = ['+255 68 203 0111', '+255 68 937 7952']

function telHref(phone) {
  return `tel:${phone.replace(/\s/g, '')}`
}

function waHref(phone) {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`
}

const emails = computed(() => {
  const primary = (settings.value?.email || 'info@streetlabsafrica.org').trim()
  const extras = ['partnership@streetlabsafrica.org']
  return [primary, ...extras.filter((e) => e.toLowerCase() !== primary.toLowerCase())]
})

const address = computed(
  () => settings.value?.address || 'Morocco Square, Kinondoni, Dar Es Salaam, Tanzania.',
)

const mapsUrl = computed(
  () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.value)}`,
)

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
})
const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    error.value = 'Please fill in name, email, and message.'
    return
  }
  sending.value = true
  try {
    await cmsApi.postContact({ ...form })
    sent.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not send message.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="contact-page">
    <p class="watermark" aria-hidden="true">AFRICA</p>

    <button type="button" class="connect-back" @click="router.push('/connect')">
      ← Back
    </button>

    <header class="contact-head connect-rise">
      <h1>
        <span class="t-navy">Contact Streetlabs</span>
        <span class="t-green"> Africa</span>
      </h1>
      <p>
        We're always excited to connect with innovators, partners, communities and changemakers.
        Reach out to us through any of the channels below.
      </p>
      <div class="connect-bars center" aria-hidden="true">
        <span class="navy" /><span class="orange" /><span class="green" />
      </div>
    </header>

    <div class="contact-layout">
      <div class="info-grid">
        <article class="info-card green connect-rise d1">
          <div class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.2.34 2 .57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <h2>Phone</h2>
          <div v-for="p in phones" :key="`tel-${p}`" class="line-action">
            <p>{{ p }}</p>
            <a class="btn green" :href="telHref(p)">Call</a>
          </div>
        </article>

        <article class="info-card green connect-rise d2">
          <div class="icon whatsapp" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 3.5A11.5 11.5 0 0 0 3.1 17.8L2 22l4.3-1.1A11.5 11.5 0 1 0 20.5 3.5Zm-8.4 17.7a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.9.8.8-2.8-.2-.3a9.5 9.5 0 1 1 7.4 3.8Zm5.5-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a7.8 7.8 0 0 1-2.3-1.4 8.5 8.5 0 0 1-1.6-2c-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3 .2.3 2 3.1 3.3 2.5 3.8 2.8c.4.2.7.2 1 .2s.9-.4 1-7c.1-.3.1-.6 0-.8 0-.1-.3-.2-.6-.3Z" />
            </svg>
          </div>
          <h2>WhatsApp</h2>
          <div v-for="p in phones" :key="`wa-${p}`" class="line-action">
            <p>{{ p }}</p>
            <a
              class="btn green"
              :href="waHref(p)"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat
            </a>
          </div>
        </article>

        <article class="info-card navy connect-rise d3">
          <div class="icon navy" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2>Email</h2>
          <p v-for="e in emails" :key="e">{{ e }}</p>
          <a class="btn green" :href="`mailto:${emails[0]}`">Send Email</a>
        </article>

        <article class="info-card orange connect-rise d4">
          <div class="icon orange" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2>Our location</h2>
          <p>{{ address }}</p>
          <a class="btn orange" :href="mapsUrl" target="_blank" rel="noopener noreferrer">
            View on map
          </a>
        </article>

        <article class="info-card navy connect-rise d5">
          <div class="icon clock" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h2>Working Hours</h2>
          <p>Monday – Friday, 08:00AM – 05:00PM (EAT)</p>
        </article>
      </div>

      <section class="form-card connect-rise d2">
        <template v-if="!sent">
          <h2>Send Us a Message</h2>
          <p class="form-sub">
            Fill out the form below and our team will get back to you as soon as possible.
          </p>

          <label class="field">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input v-model="form.name" type="text" placeholder="Your Name" autocomplete="name" />
          </label>
          <label class="field">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <input v-model="form.email" type="email" placeholder="Your Email" autocomplete="email" />
          </label>
          <label class="field">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
            </span>
            <input v-model="form.subject" type="text" placeholder="Subject" />
          </label>
          <label class="field tall">
            <span class="field-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <textarea v-model="form.message" rows="5" placeholder="Your Message" />
          </label>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <button type="button" class="submit" :disabled="sending" @click="submit">
            {{ sending ? 'Sending…' : 'Send Message' }}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </template>

        <div v-else class="success" role="status">
          <div class="success-check" aria-hidden="true">✓</div>
          <h2>Message received</h2>
          <p>Thanks for writing in. Our team will reply soon.</p>
          <button type="button" class="submit" @click="sent = false">Send another</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  position: relative;
}

.watermark {
  display: none;
}

.contact-head {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 46rem;
  margin: 0 auto 2rem;
}

.contact-head h1 {
  margin: 0 0 0.85rem;
  font-size: clamp(1.7rem, 4.5vw, 2.55rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.t-navy { color: var(--navy); }
.t-green { color: var(--green); }

.contact-head p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.contact-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  gap: 1.25rem;
  align-items: start;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.info-card {
  border-radius: 16px;
  padding: 1.1rem 1.05rem 1.15rem;
  border: 1px solid transparent;
  display: grid;
  gap: 0.35rem;
  align-content: start;
}

.info-card.green {
  background: #eef8f1;
  border-color: rgba(10, 122, 61, 0.16);
}
.info-card.navy {
  background: #eef3f9;
  border-color: rgba(10, 31, 68, 0.12);
}
.info-card.orange {
  background: #fff4ec;
  border-color: rgba(255, 106, 0, 0.16);
}

.icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 0.35rem;
  color: #fff;
  background: var(--green);
}
.icon.navy { background: var(--navy); }
.icon.orange { background: var(--orange); }
.icon.clock { background: #1d6fd8; }
.icon.whatsapp { background: #25d366; }
.icon svg { width: 20px; height: 20px; }

.info-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--navy);
}

.info-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.line-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.line-action .btn {
  margin-top: 0;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
}

.btn {
  margin-top: 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  width: fit-content;
}
.btn.green { background: var(--green); }
.btn.orange { background: var(--orange); }

.form-card {
  background: #fff;
  border: 1px solid rgba(10, 31, 68, 0.1);
  border-radius: 18px;
  padding: 1.4rem 1.3rem 1.5rem;
  box-shadow: 0 14px 34px rgba(10, 31, 68, 0.07);
}

.form-card h2 {
  margin: 0 0 0.35rem;
  color: var(--navy);
  font-size: 1.35rem;
  font-weight: 800;
}

.form-sub {
  margin: 0 0 1.15rem;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.field {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  border: 1.5px solid rgba(10, 31, 68, 0.12);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  background: #fbfcfe;
  overflow: hidden;
}

.field:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(10, 122, 61, 0.12);
}

.field.tall {
  align-items: start;
}

.field-icon {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 48px;
  color: var(--muted);
  padding-top: 0.15rem;
}
.field-icon svg {
  width: 18px;
  height: 18px;
}

.field input,
.field textarea {
  border: 0;
  background: transparent;
  padding: 0.85rem 0.85rem 0.85rem 0;
  font: inherit;
  color: var(--navy);
  outline: none;
  width: 100%;
  resize: vertical;
}

.error {
  color: #b42318;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.65rem;
}

.submit {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
  background: var(--green);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-top: 0.25rem;
}
.submit:hover:not(:disabled) {
  filter: brightness(1.05);
}
.submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.submit svg {
  width: 18px;
  height: 18px;
}

.success {
  text-align: center;
  padding: 1.5rem 0.5rem;
}
.success-check {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: var(--green);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  font-weight: 800;
}
.success h2 {
  margin-bottom: 0.4rem;
}
.success p {
  color: var(--muted);
  margin: 0 0 1.25rem;
}

@media (max-width: 960px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
