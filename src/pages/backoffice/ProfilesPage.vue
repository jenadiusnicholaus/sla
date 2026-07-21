<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { profileApi } from '@/api/client'
import { Button, FormDialog, Input, Label, Separator, Textarea } from '@/components/ui'

const router = useRouter()
const profiles = ref([])
const error = ref('')
const saving = ref(false)
const dialogOpen = ref(false)
const editing = ref(null)
const openingQrFor = ref('')
const form = reactive({
  username: '',
  display_name: '',
  position: '',
  bio: '',
  email: '',
  phone: '',
  website: '',
  is_public: true,
  social_links: [],
})

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
]

function resetForm() {
  editing.value = null
  Object.assign(form, {
    username: '',
    display_name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    is_public: true,
    social_links: [],
  })
}

async function load() {
  try {
    const data = await profileApi.list()
    profiles.value = data.results || data
  } catch (e) {
    error.value = e.message
  }
}

function openCreate() {
  resetForm()
  dialogOpen.value = true
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
    is_public: profile.is_public,
    social_links: [...(profile.social_links || [])],
  })
  dialogOpen.value = true
}

function addSocial() {
  form.social_links.push({
    platform: 'linkedin',
    label: 'LinkedIn',
    url: '',
    order: form.social_links.length + 1,
    is_active: true,
  })
}

function removeSocial(index) {
  form.social_links.splice(index, 1)
}

function onPlatformChange(link) {
  const match = platformOptions.find((p) => p.value === link.platform)
  if (match && (!link.label || platformOptions.some((p) => p.label === link.label))) {
    link.label = match.label
  }
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function prepareSocialLinks() {
  const prepared = []

  for (const [index, link] of form.social_links.entries()) {
    const url = normalizeUrl(link.url)
    if (!url) continue

    if (!isValidUrl(url)) {
      throw new Error(`Social link "${link.label || link.platform}" needs a valid URL.`)
    }

    prepared.push({
      platform: link.platform,
      label: link.label?.trim() || '',
      url,
      order: link.order ?? index + 1,
      is_active: link.is_active !== false,
    })
  }

  return prepared
}

function formatError(err) {
  const data = err.data
  if (!data || typeof data !== 'object') return err.message

  if (typeof data.detail === 'string') return data.detail

  const parts = []
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      parts.push(`${key}: ${value.join(', ')}`)
      continue
    }
    if (value && typeof value === 'object') {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        const message = Array.isArray(nestedValue) ? nestedValue.join(', ') : String(nestedValue)
        parts.push(`${key} ${nestedKey}: ${message}`)
      }
    }
  }

  return parts.join(' · ') || err.message
}

async function save() {
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form,
      social_links: prepareSocialLinks(),
    }
    await profileApi.save(editing.value, payload)
    dialogOpen.value = false
    resetForm()
    await load()
  } catch (e) {
    error.value = formatError(e)
  } finally {
    saving.value = false
  }
}

async function openProfileQr(profile) {
  openingQrFor.value = profile.username
  error.value = ''
  try {
    const qr = await profileApi.ensureQr(profile.username)
    await router.push({ name: 'backoffice-qr', query: { edit: qr.code } })
  } catch (e) {
    error.value = formatError(e)
  } finally {
    openingQrFor.value = ''
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1>Employee Profiles</h1>
        <p class="sub">Public identity pages at /profiles/{username}</p>
      </div>
      <button type="button" class="cta" @click="openCreate">New profile</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-for="p in profiles" :key="p.id" class="list-item">
      <div>
        <strong>{{ p.display_name }}</strong>
        <p>@{{ p.username }} · {{ p.position }}</p>
      </div>
      <div class="actions">
        <router-link :to="`/profiles/${p.username}`" target="_blank">View</router-link>
        <button
          type="button"
          :disabled="openingQrFor === p.username"
          @click="openProfileQr(p)"
        >
          {{ openingQrFor === p.username ? 'Opening QR…' : 'QR Hub' }}
        </button>
        <button type="button" @click="edit(p)">Edit</button>
      </div>
    </div>
    <p v-if="!profiles.length" class="empty">No profiles yet.</p>

    <FormDialog
      v-model:open="dialogOpen"
      :title="editing ? 'Edit profile' : 'Create profile'"
      description="Employee public identity used by Smart Hub and profile pages."
      :submit-label="editing ? 'Update profile' : 'Create profile'"
      :loading="saving"
      size="xl"
      @submit="save"
      @cancel="resetForm"
    >
      <div class="dialog-form">
        <section>
          <h3>Identity</h3>
          <div class="row2">
            <div class="field">
              <Label for="profile-username">Username</Label>
              <Input
                id="profile-username"
                v-model="form.username"
                placeholder="hamood"
                autocomplete="off"
                spellcheck="false"
              />
              <p class="hint">Profile URL: /profiles/{{ form.username || 'username' }}</p>
            </div>
            <div class="field">
              <Label for="profile-display-name">Display name</Label>
              <Input
                id="profile-display-name"
                v-model="form.display_name"
                placeholder="Mahmoud Mohamed"
              />
            </div>
          </div>
          <div class="field">
            <Label for="profile-position">Position</Label>
            <Input
              id="profile-position"
              v-model="form.position"
              placeholder="Chief Executive Officer"
            />
          </div>
        </section>

        <Separator />

        <section>
          <h3>Contact</h3>
          <div class="row2">
            <div class="field">
              <Label for="profile-email">Email</Label>
              <Input
                id="profile-email"
                v-model="form.email"
                type="email"
                placeholder="name@streetlabsafrica.org"
              />
            </div>
            <div class="field">
              <Label for="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                v-model="form.phone"
                type="tel"
                placeholder="+256 700 000 000"
              />
            </div>
          </div>
          <div class="field">
            <Label for="profile-website">Website</Label>
            <Input
              id="profile-website"
              v-model="form.website"
              type="url"
              placeholder="https://streetlabsafrica.org"
            />
          </div>
        </section>

        <Separator />

        <section>
          <h3>About</h3>
          <div class="field">
            <Label for="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              v-model="form.bio"
              rows="4"
              placeholder="Short introduction shown on the public profile page."
            />
          </div>
        </section>

        <Separator />

        <section>
          <div class="section-head">
            <h3>Social links</h3>
            <Button type="button" variant="outline" size="sm" @click="addSocial">
              Add link
            </Button>
          </div>
          <p v-if="!form.social_links.length" class="empty-links">
            No social links yet. Add LinkedIn, GitHub, or other profiles.
          </p>
          <div
            v-for="(s, i) in form.social_links"
            :key="i"
            class="social-row"
          >
            <div class="field">
              <Label :for="`social-platform-${i}`">Platform</Label>
              <select
                :id="`social-platform-${i}`"
                v-model="s.platform"
                class="select"
                @change="onPlatformChange(s)"
              >
                <option
                  v-for="option in platformOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="field">
              <Label :for="`social-label-${i}`">Label</Label>
              <Input :id="`social-label-${i}`" v-model="s.label" placeholder="LinkedIn" />
            </div>
            <div class="field social-url">
              <Label :for="`social-url-${i}`">URL</Label>
              <Input
                :id="`social-url-${i}`"
                v-model="s.url"
                type="url"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="remove-btn"
              @click="removeSocial(i)"
            >
              Remove
            </Button>
          </div>
        </section>

        <Separator />

        <section>
          <label class="check">
            <input v-model="form.is_public" type="checkbox" />
            <span>Public profile (visible on /profiles/{username})</span>
          </label>
        </section>
      </div>
    </FormDialog>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}
h1 { margin-bottom: 0.2rem; }
.sub, p { color: #5b6b82; margin: 0; }
.dialog-form {
  display: grid;
  gap: 2rem;
}
.dialog-form section {
  display: grid;
  gap: 1.25rem;
}
.dialog-form h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0a1f44;
}
.field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}
.hint {
  margin: 0.15rem 0 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #5b6b82;
}
.row2 {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.15rem;
}
.section-head h3 {
  margin: 0;
}
.empty-links {
  margin: 0;
  padding: 1rem 1.15rem;
  border-radius: 12px;
  background: #f8fafc;
  color: #5b6b82;
  font-size: 0.88rem;
  line-height: 1.5;
}
.social-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: 140px 1fr 1.6fr auto;
  align-items: end;
  padding: 1.15rem 1.25rem;
  border: 1px solid #e8eef6;
  border-radius: 14px;
  background: #fafbfd;
}
.social-url {
  min-width: 0;
}
.select {
  height: 2.75rem;
  width: 100%;
  border: 1px solid #d8dee8;
  border-radius: 0.625rem;
  background: #fff;
  padding: 0 1rem;
  font: inherit;
  font-size: 0.875rem;
  color: #0a1f44;
}
.remove-btn {
  color: #b42318;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  color: #0a1f44;
  font-size: 0.9rem;
  cursor: pointer;
}
.check input {
  width: 1rem;
  height: 1rem;
  accent-color: #ff6a00;
}
.cta, .actions button, .actions a {
  border: 0;
  border-radius: 999px;
  padding: 0.55rem 0.9rem;
  font: inherit;
  cursor: pointer;
  text-decoration: none;
  color: #0a1f44;
}
.cta { background: #ff6a00; color: #fff; font-weight: 600; }
.actions button, .actions a { background: #eef2f7; }
.list-item {
  background: #fff;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  margin-top: 0.6rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}
.actions { display: flex; gap: 0.4rem; }
.error { color: #b42318; }
.empty { color: #5b6b82; padding: 1rem 0; }

@media (max-width: 720px) {
  .row2,
  .social-row {
    grid-template-columns: 1fr;
  }
  .remove-btn {
    justify-self: start;
  }
}
</style>
