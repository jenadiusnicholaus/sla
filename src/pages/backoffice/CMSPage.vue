<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { cmsApi } from '@/api/client'
import { invalidateHomepageCms } from '@/composables/useHomepageCms'
import ImageCropModal from '@/components/ImageCropModal.vue'
import { FormDialog, DataTable, Input, Label, Separator, Textarea } from '@/components/ui'

const tabs = [
  'settings',
  'hero',
  'gallery',
  'programs',
  'team',
  'values',
]

const tab = ref('settings')
const settings = reactive({
  org_name: '',
  tagline: '',
  email: '',
  phone: '',
  address: '',
  website_url: '',
  primary_color: '#ff6a00',
  secondary_color: '#0a7a3d',
  navy_color: '#0a1f44',
})
const programs = ref([])
const team = ref([])
const values = ref([])
const galleryImages = ref([])
const status = ref('')
const error = ref('')
const saving = ref(false)

const cropOpen = ref(false)
const cropSrc = ref('')
const cropFileName = ref('photo.jpg')
const cropTarget = ref('gallery') // gallery | poster
const photoInput = ref(null)
const programDialogOpen = ref(false)
const teamDialogOpen = ref(false)
const valueDialogOpen = ref(false)
const imageDialogOpen = ref(false)
const cropShape = computed(() => 'rect')
const cropTitle = computed(() => {
  if (cropTarget.value === 'gallery') return 'Crop gallery image'
  return 'Crop poster image'
})

const colorFields = [
  { key: 'primary_color', label: 'Primary', fallback: '#ff6a00' },
  { key: 'secondary_color', label: 'Secondary', fallback: '#0a7a3d' },
  { key: 'navy_color', label: 'Navy', fallback: '#0a1f44' },
]

const heroForm = reactive({
  id: null,
  title_line_1: 'Empowering Africa',
  title_accent: 'One Skill at a Time.',
  description: '',
  primary_cta_label: 'Donate Now',
  secondary_cta_label: 'Explore Programs ↓',
  secondary_cta_href: '#services',
  impact_label: 'OUR IMPACT',
  impact_badge: 'Best EdTech 2024',
  impact_title: 'Digital Skills for Everyone',
  impact_subtitle: 'Empowering communities. Building futures.',
  background_video: null,
  video_poster: null,
  videoFile: null,
  posterFile: null,
  videoPreview: '',
  posterPreview: '',
  is_active: true,
})

const galleryForm = reactive({
  id: null,
  eyebrow: 'Our Community In Action',
  title: 'Hands On at SLA',
  description: '',
  is_active: true,
})

const imageForm = reactive({
  id: null,
  label: '',
  alt: '',
  accent_color: '#ff6a00',
  order: 0,
  is_active: true,
  image: null,
  imagePreview: '',
  imageFile: null,
})

const programForm = reactive({
  id: null,
  title: '',
  description: '',
  emoji: '💻',
  tag: '',
  tag_color: '#ff6a00',
  order: 0,
  is_active: true,
})

const teamForm = reactive({
  id: null,
  name: '',
  role: '',
  initials: '',
  email: '',
  bio: '',
  photo: null,
  photoPreview: '',
  photoFile: null,
  order: 0,
  is_published: true,
  accepts_meetings: true,
})

const valueForm = reactive({
  id: null,
  title: '',
  description: '',
  emoji: '💡',
  color: '#ff6a00',
  order: 0,
  is_active: true,
})

const sortedGalleryImages = computed(() =>
  [...galleryImages.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
)

const programColumns = [
  { key: 'emoji', label: '', width: '48px' },
  { key: 'title', label: 'Program', width: '1.5fr' },
  { key: 'tag', label: 'Tag', width: '0.9fr' },
  { key: 'order', label: 'Order', width: '72px' },
  { key: 'status', label: 'Status', width: '88px' },
]

const teamColumns = [
  { key: 'photo', label: '', width: '64px' },
  { key: 'name', label: 'Name', width: '1.2fr' },
  { key: 'role', label: 'Role', width: '1fr' },
  { key: 'meetings', label: 'Meetings', width: '100px' },
  { key: 'status', label: 'Status', width: '88px' },
]

const valueColumns = [
  { key: 'emoji', label: '', width: '48px' },
  { key: 'title', label: 'Value', width: '1.4fr' },
  { key: 'order', label: 'Order', width: '72px' },
  { key: 'status', label: 'Status', width: '88px' },
]

const galleryColumns = [
  { key: 'image', label: '', width: '72px' },
  { key: 'label', label: 'Label', width: '1.4fr' },
  { key: 'order', label: 'Order', width: '72px' },
  { key: 'status', label: 'Status', width: '88px' },
]

function isActiveStatus(item) {
  if (item.is_published != null) return item.is_published !== false
  return item.is_active !== false
}

function resetTeamForm() {
  Object.assign(teamForm, {
    id: null,
    name: '',
    role: '',
    initials: '',
    email: '',
    bio: '',
    photo: null,
    photoPreview: '',
    photoFile: null,
    order: 0,
    is_published: true,
    accepts_meetings: true,
  })
}

function resetProgramForm() {
  Object.assign(programForm, {
    id: null,
    title: '',
    description: '',
    emoji: '💻',
    tag: '',
    tag_color: '#ff6a00',
    order: 0,
    is_active: true,
  })
}

function resetValueForm() {
  Object.assign(valueForm, {
    id: null,
    title: '',
    description: '',
    emoji: '💡',
    color: '#ff6a00',
    order: 0,
    is_active: true,
  })
}

function openCreateProgram() {
  resetProgramForm()
  programDialogOpen.value = true
}

function openCreateTeam() {
  resetTeamForm()
  teamDialogOpen.value = true
}

function openCreateValue() {
  resetValueForm()
  valueDialogOpen.value = true
}

function openCreateImage() {
  resetImageForm()
  imageDialogOpen.value = true
}

function resetImageForm() {
  Object.assign(imageForm, {
    id: null,
    label: '',
    alt: '',
    accent_color: '#ff6a00',
    order: galleryImages.value.length,
    is_active: true,
    image: null,
    imagePreview: '',
    imageFile: null,
  })
}

function onTeamPhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (teamForm.photoPreview?.startsWith('blob:')) URL.revokeObjectURL(teamForm.photoPreview)
  teamForm.photoFile = file
  teamForm.photoPreview = URL.createObjectURL(file)
  event.target.value = ''
}

function onGalleryImageChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  openCropper(file, 'gallery')
  event.target.value = ''
}

function onHeroPosterChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (heroForm.posterPreview?.startsWith('blob:')) URL.revokeObjectURL(heroForm.posterPreview)
  openCropper(file, 'poster')
  event.target.value = ''
}

function openCropper(file, target) {
  if (cropSrc.value?.startsWith('blob:')) URL.revokeObjectURL(cropSrc.value)
  cropTarget.value = target
  cropFileName.value = file.name || 'photo.jpg'
  cropSrc.value = URL.createObjectURL(file)
  cropOpen.value = true
}

function closeCropper() {
  cropOpen.value = false
  if (cropSrc.value?.startsWith('blob:')) URL.revokeObjectURL(cropSrc.value)
  cropSrc.value = ''
}

function onCropConfirm({ file, previewUrl }) {
  if (cropTarget.value === 'gallery') {
    if (imageForm.imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imageForm.imagePreview)
    imageForm.imageFile = file
    imageForm.imagePreview = previewUrl
  } else if (cropTarget.value === 'poster') {
    if (heroForm.posterPreview?.startsWith('blob:')) URL.revokeObjectURL(heroForm.posterPreview)
    heroForm.posterFile = file
    heroForm.posterPreview = previewUrl
  }
  cropOpen.value = false
  if (cropSrc.value?.startsWith('blob:')) URL.revokeObjectURL(cropSrc.value)
  cropSrc.value = ''
}

function onHeroVideoChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (heroForm.videoPreview?.startsWith('blob:')) URL.revokeObjectURL(heroForm.videoPreview)
  heroForm.videoFile = file
  heroForm.videoPreview = URL.createObjectURL(file)
}

async function notifyLanding() {
  await invalidateHomepageCms()
}

function normalizeHex(value, fallback) {
  const raw = String(value || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase()
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`
  return fallback
}

function unwrapList(data) {
  return data?.results || data || []
}

async function ensureGallerySection() {
  if (galleryForm.id) return galleryForm.id
  const created = await cmsApi.saveGallery(null, {
    eyebrow: galleryForm.eyebrow,
    title: galleryForm.title,
    description: galleryForm.description,
    is_active: true,
  })
  Object.assign(galleryForm, created)
  return created.id
}

async function load() {
  error.value = ''
  try {
    const data = await cmsApi.settings()
    Object.assign(settings, data, {
      primary_color: normalizeHex(data.primary_color, '#ff6a00'),
      secondary_color: normalizeHex(data.secondary_color, '#0a7a3d'),
      navy_color: normalizeHex(data.navy_color, '#0a1f44'),
    })

    const [p, t, v, heroes, galleries, images] = await Promise.all([
      cmsApi.programs(),
      cmsApi.team(),
      cmsApi.values(),
      cmsApi.hero(),
      cmsApi.gallery(),
      cmsApi.galleryImages(),
    ])

    programs.value = unwrapList(p)
    team.value = unwrapList(t)
    values.value = unwrapList(v)
    galleryImages.value = unwrapList(images)

    const hero = unwrapList(heroes)[0]
    if (hero) {
      Object.assign(heroForm, {
        ...hero,
        videoFile: null,
        posterFile: null,
        videoPreview: hero.background_video || '',
        posterPreview: hero.video_poster || '',
      })
    }

    const gallery = unwrapList(galleries)[0]
    if (gallery) {
      Object.assign(galleryForm, gallery)
      if (gallery.images?.length && !galleryImages.value.length) {
        galleryImages.value = gallery.images
      }
    }

    if (!imageForm.id) {
      imageForm.order = galleryImages.value.length
    }
  } catch (e) {
    error.value = e.message
  }
}

async function saveSettings() {
  saving.value = true
  try {
    await cmsApi.updateSettings(settings)
    await notifyLanding()
    status.value = 'Settings saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function saveHero() {
  error.value = ''
  saving.value = true
  try {
    const body = new FormData()
    const fields = [
      'title_line_1',
      'title_accent',
      'description',
      'primary_cta_label',
      'secondary_cta_label',
      'secondary_cta_href',
      'impact_label',
      'impact_badge',
      'impact_title',
      'impact_subtitle',
    ]
    fields.forEach((key) => body.append(key, heroForm[key] ?? ''))
    body.append('is_active', heroForm.is_active ? 'true' : 'false')
    body.append('primary_cta_action', 'open_donate')
    if (heroForm.videoFile) body.append('background_video', heroForm.videoFile)
    if (heroForm.posterFile) body.append('video_poster', heroForm.posterFile)

    const saved = await cmsApi.saveHero(heroForm.id, body)
    Object.assign(heroForm, {
      ...saved,
      videoFile: null,
      posterFile: null,
      videoPreview: saved.background_video || '',
      posterPreview: saved.video_poster || '',
    })
    await notifyLanding()
    status.value = 'Hero media & copy saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function saveGallerySection() {
  error.value = ''
  saving.value = true
  try {
    const saved = await cmsApi.saveGallery(galleryForm.id, {
      eyebrow: galleryForm.eyebrow,
      title: galleryForm.title,
      description: galleryForm.description,
      is_active: galleryForm.is_active !== false,
    })
    Object.assign(galleryForm, saved)
    await notifyLanding()
    status.value = 'Gallery section saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

async function saveGalleryImage() {
  error.value = ''
  if (!imageForm.imageFile && !imageForm.id) {
    error.value = 'Choose an image to upload.'
    return
  }
  saving.value = true
  try {
    const sectionId = await ensureGallerySection()
    const body = new FormData()
    body.append('section', String(sectionId))
    body.append('label', imageForm.label || '')
    body.append('alt', imageForm.alt || imageForm.label || '')
    body.append('accent_color', normalizeHex(imageForm.accent_color, '#ff6a00'))
    body.append('order', String(imageForm.order ?? 0))
    body.append('is_active', imageForm.is_active ? 'true' : 'false')
    if (imageForm.imageFile) body.append('image', imageForm.imageFile)

    await cmsApi.saveGalleryImage(imageForm.id, body)
    resetImageForm()
    imageDialogOpen.value = false
    await load()
    await notifyLanding()
    status.value = 'Gallery image saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function editGalleryImage(item) {
  Object.assign(imageForm, {
    id: item.id,
    label: item.label || '',
    alt: item.alt || '',
    accent_color: normalizeHex(item.accent_color, '#ff6a00'),
    order: item.order ?? 0,
    is_active: item.is_active !== false,
    image: item.image || null,
    imagePreview: item.image || '',
    imageFile: null,
  })
  imageDialogOpen.value = true
}

async function deleteGalleryImage(id) {
  await cmsApi.deleteGalleryImage(id)
  if (imageForm.id === id) resetImageForm()
  await load()
  await notifyLanding()
  status.value = 'Gallery image deleted'
}

async function saveProgram() {
  saving.value = true
  try {
    await cmsApi.saveProgram(programForm.id, { ...programForm })
    resetProgramForm()
    programDialogOpen.value = false
    await load()
    await notifyLanding()
    status.value = 'Program saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function editProgram(item) {
  Object.assign(programForm, item)
  programDialogOpen.value = true
}

async function deleteProgram(id) {
  await cmsApi.deleteProgram(id)
  await load()
  await notifyLanding()
}

async function saveTeam() {
  error.value = ''
  saving.value = true
  try {
    const body = new FormData()
    body.append('name', teamForm.name)
    body.append('role', teamForm.role)
    body.append('initials', teamForm.initials || '')
    body.append('email', teamForm.email || '')
    body.append('bio', teamForm.bio || '')
    body.append('order', String(teamForm.order ?? 0))
    body.append('is_published', teamForm.is_published ? 'true' : 'false')
    body.append('accepts_meetings', teamForm.accepts_meetings ? 'true' : 'false')
    if (teamForm.photoFile) body.append('photo', teamForm.photoFile)

    await cmsApi.saveTeam(teamForm.id, body)
    resetTeamForm()
    teamDialogOpen.value = false
    await load()
    await notifyLanding()
    status.value = 'Team member saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function editTeam(item) {
  Object.assign(teamForm, {
    id: item.id,
    name: item.name || '',
    role: item.role || '',
    initials: item.initials || '',
    email: item.email || '',
    bio: item.bio || '',
    photo: item.photo || null,
    photoPreview: item.photo || '',
    photoFile: null,
    order: item.order ?? 0,
    is_published: item.is_published !== false,
    accepts_meetings: item.accepts_meetings !== false,
  })
  teamDialogOpen.value = true
}

async function deleteTeam(id) {
  await cmsApi.deleteTeam(id)
  await load()
  await notifyLanding()
}

async function saveValue() {
  saving.value = true
  try {
    await cmsApi.saveValue(valueForm.id, { ...valueForm })
    resetValueForm()
    valueDialogOpen.value = false
    await load()
    await notifyLanding()
    status.value = 'Value saved'
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function editValue(item) {
  Object.assign(valueForm, item)
  valueDialogOpen.value = true
}

async function deleteValue(id) {
  await cmsApi.deleteValue(id)
  await load()
  await notifyLanding()
}

onMounted(load)
</script>

<template>
  <div>
    <h1>Website CMS</h1>
    <p class="sub">Manage homepage content shown on streetlabsafrica.org</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="status" class="ok">{{ status }}</p>

    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t"
        type="button"
        :class="{ active: tab === t }"
        @click="tab = t"
      >
        {{ t }}
      </button>
    </div>

    <section v-if="tab === 'settings'" class="panel">
      <label>Org name<input v-model="settings.org_name" /></label>
      <label>Tagline<input v-model="settings.tagline" /></label>
      <label>Email<input v-model="settings.email" /></label>
      <label>Phone<input v-model="settings.phone" /></label>
      <label>Address<input v-model="settings.address" /></label>
      <label>Website URL<input v-model="settings.website_url" /></label>
      <div class="row3">
        <label v-for="field in colorFields" :key="field.key" class="color-field">
          {{ field.label }}
          <div class="color-control">
            <input
              v-model="settings[field.key]"
              type="color"
              class="color-swatch"
              :aria-label="`${field.label} color`"
            />
            <input
              v-model="settings[field.key]"
              type="text"
              class="color-hex"
              maxlength="7"
              spellcheck="false"
              :placeholder="field.fallback"
            />
          </div>
        </label>
      </div>
      <button class="cta" :disabled="saving" @click="saveSettings">Save settings</button>
    </section>

    <section v-else-if="tab === 'hero'" class="panel">
      <h2 class="section-title">Hero media</h2>
      <p class="hint">Background video and poster image for the landing hero.</p>

      <div class="media-grid">
        <label class="photo-field">
          Background video (MP4)
          <input type="file" accept="video/mp4,video/*" @change="onHeroVideoChange" />
        </label>
        <div v-if="heroForm.videoPreview" class="media-preview video">
          <video :src="heroForm.videoPreview" controls muted playsinline />
          <span class="chip">{{ heroForm.videoFile ? 'New video selected' : 'Current video' }}</span>
        </div>
        <div v-else class="empty-media">No hero video uploaded yet</div>
      </div>

      <div class="media-grid">
        <label class="photo-field">
          Poster image
          <input type="file" accept="image/*" @change="onHeroPosterChange" />
        </label>
        <div v-if="heroForm.posterPreview" class="media-preview">
          <img :src="heroForm.posterPreview" alt="Hero poster preview" />
          <span class="chip">{{ heroForm.posterFile ? 'New poster selected' : 'Current poster' }}</span>
        </div>
        <div v-else class="empty-media">No poster uploaded yet</div>
      </div>

      <h2 class="section-title">Hero copy</h2>
      <label>Title line<input v-model="heroForm.title_line_1" /></label>
      <label>Accent line<input v-model="heroForm.title_accent" /></label>
      <label>Description<textarea v-model="heroForm.description" rows="3" /></label>
      <div class="row2">
        <label>Primary CTA<input v-model="heroForm.primary_cta_label" /></label>
        <label>Secondary CTA<input v-model="heroForm.secondary_cta_label" /></label>
      </div>
      <label>Secondary link<input v-model="heroForm.secondary_cta_href" /></label>
      <div class="row2">
        <label>Impact label<input v-model="heroForm.impact_label" /></label>
        <label>Impact badge<input v-model="heroForm.impact_badge" /></label>
      </div>
      <label>Impact title<input v-model="heroForm.impact_title" /></label>
      <label>Impact subtitle<input v-model="heroForm.impact_subtitle" /></label>
      <button class="cta" :disabled="saving" @click="saveHero">Save hero</button>
    </section>

    <section v-else-if="tab === 'gallery'" class="panel">
      <h2 class="section-title">Our Community In Action</h2>
      <p class="hint">Section copy and scrolling gallery images on the landing page.</p>

      <label>Eyebrow<input v-model="galleryForm.eyebrow" /></label>
      <label>Title<input v-model="galleryForm.title" /></label>
      <label>Description<textarea v-model="galleryForm.description" rows="2" /></label>
      <button class="cta" :disabled="saving" @click="saveGallerySection">Save section copy</button>

      <h2 class="section-title">Gallery images</h2>
      <div class="list-toolbar">
        <p class="hint">Photos shown in the landing gallery strip.</p>
        <button type="button" class="cta" @click="openCreateImage">Add image</button>
      </div>

      <DataTable
        :columns="galleryColumns"
        :rows="sortedGalleryImages"
        empty-text="No gallery images yet — click Add image to upload."
      >
        <template #cell-image="{ row }">
          <img
            v-if="row.image"
            :src="row.image"
            :alt="row.alt || row.label"
            class="table-thumb"
          />
          <span v-else class="table-thumb placeholder">—</span>
        </template>
        <template #cell-label="{ row }">
          <strong class="table-title">{{ row.label || 'Untitled' }}</strong>
          <p v-if="row.alt" class="table-sub">{{ row.alt }}</p>
        </template>
        <template #cell-status="{ row }">
          <span class="status-pill" :class="isActiveStatus(row) ? 'on' : 'off'">
            {{ isActiveStatus(row) ? 'Active' : 'Hidden' }}
          </span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="table-btn" @click="editGalleryImage(row)">Edit</button>
          <button type="button" class="table-btn danger" @click="deleteGalleryImage(row.id)">
            Delete
          </button>
        </template>
      </DataTable>
    </section>

    <section v-else-if="tab === 'programs'" class="panel">
      <div class="list-toolbar">
        <h2 class="section-title">Programs</h2>
        <button type="button" class="cta" @click="openCreateProgram">Add program</button>
      </div>

      <DataTable
        :columns="programColumns"
        :rows="programs"
        empty-text="No programs yet — click Add program to create one."
      >
        <template #cell-emoji="{ value }">
          <span class="table-emoji">{{ value }}</span>
        </template>
        <template #cell-title="{ row }">
          <strong class="table-title">{{ row.title }}</strong>
          <p class="table-sub">{{ row.description }}</p>
        </template>
        <template #cell-tag="{ row }">
          <span
            v-if="row.tag"
            class="tag-pill"
            :style="{ backgroundColor: `${row.tag_color || '#ff6a00'}22`, color: row.tag_color || '#ff6a00' }"
          >
            {{ row.tag }}
          </span>
          <span v-else class="muted-dash">—</span>
        </template>
        <template #cell-status="{ row }">
          <span class="status-pill" :class="isActiveStatus(row) ? 'on' : 'off'">
            {{ isActiveStatus(row) ? 'Active' : 'Hidden' }}
          </span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="table-btn" @click="editProgram(row)">Edit</button>
          <button type="button" class="table-btn danger" @click="deleteProgram(row.id)">Delete</button>
        </template>
      </DataTable>
    </section>

    <section v-else-if="tab === 'team'" class="panel">
      <div class="list-toolbar">
        <h2 class="section-title">Team members</h2>
        <button type="button" class="cta" @click="openCreateTeam">Add member</button>
      </div>

      <DataTable
        :columns="teamColumns"
        :rows="team"
        empty-text="No team members yet — click Add member to create one."
      >
        <template #cell-photo="{ row }">
          <img v-if="row.photo" :src="row.photo" :alt="row.name" class="table-thumb portrait" />
          <span v-else class="table-thumb portrait placeholder">{{ row.initials || '?' }}</span>
        </template>
        <template #cell-name="{ row }">
          <strong class="table-title">{{ row.name }}</strong>
          <p v-if="row.initials" class="table-sub">{{ row.initials }}</p>
        </template>
        <template #cell-meetings="{ row }">
          <span class="status-pill" :class="row.accepts_meetings !== false ? 'on' : 'off'">
            {{ row.accepts_meetings !== false ? 'On' : 'Off' }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <span class="status-pill" :class="isActiveStatus(row) ? 'on' : 'off'">
            {{ isActiveStatus(row) ? 'Published' : 'Draft' }}
          </span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="table-btn" @click="editTeam(row)">Edit</button>
          <button type="button" class="table-btn danger" @click="deleteTeam(row.id)">Delete</button>
        </template>
      </DataTable>
    </section>

    <section v-else-if="tab === 'values'" class="panel">
      <div class="list-toolbar">
        <h2 class="section-title">Brand values</h2>
        <button type="button" class="cta" @click="openCreateValue">Add value</button>
      </div>

      <DataTable
        :columns="valueColumns"
        :rows="values"
        empty-text="No brand values yet — click Add value to create one."
      >
        <template #cell-emoji="{ value }">
          <span class="table-emoji">{{ value }}</span>
        </template>
        <template #cell-title="{ row }">
          <strong class="table-title">{{ row.title }}</strong>
          <p class="table-sub">{{ row.description }}</p>
        </template>
        <template #cell-status="{ row }">
          <span class="status-pill" :class="isActiveStatus(row) ? 'on' : 'off'">
            {{ isActiveStatus(row) ? 'Active' : 'Hidden' }}
          </span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="table-btn" @click="editValue(row)">Edit</button>
          <button type="button" class="table-btn danger" @click="deleteValue(row.id)">Delete</button>
        </template>
      </DataTable>
    </section>

    <FormDialog
      v-model:open="imageDialogOpen"
      :title="imageForm.id ? 'Edit gallery image' : 'Add gallery image'"
      description="Upload and label an image for the landing gallery."
      :submit-label="imageForm.id ? 'Update image' : 'Add image'"
      :loading="saving"
      size="lg"
      @submit="saveGalleryImage"
      @cancel="resetImageForm"
    >
      <div class="dialog-form">
        <section>
          <h3>Image details</h3>
          <div class="field">
            <Label for="gallery-label">Label</Label>
            <Input
              id="gallery-label"
              v-model="imageForm.label"
              placeholder="Digital Skills Training"
            />
          </div>
          <div class="field">
            <Label for="gallery-alt">Alt text</Label>
            <Input
              id="gallery-alt"
              v-model="imageForm.alt"
              placeholder="Describe the image for accessibility"
            />
          </div>
          <div class="row2">
            <label class="color-field field">
              Accent color
              <div class="color-control">
                <input v-model="imageForm.accent_color" type="color" class="color-swatch" />
                <input v-model="imageForm.accent_color" type="text" class="color-hex" maxlength="7" />
              </div>
            </label>
            <div class="field">
              <Label for="gallery-order">Order</Label>
              <Input id="gallery-order" v-model.number="imageForm.order" type="number" min="0" />
            </div>
          </div>
        </section>

        <Separator />

        <section>
          <h3>Upload</h3>
          <label class="photo-field field">
            Image file
            <input type="file" accept="image/*" @change="onGalleryImageChange" />
          </label>
          <div v-if="imageForm.imagePreview" class="media-preview wide">
            <img :src="imageForm.imagePreview" alt="Gallery preview" />
          </div>
        </section>
      </div>
    </FormDialog>

    <FormDialog
      v-model:open="programDialogOpen"
      :title="programForm.id ? 'Edit program' : 'Add program'"
      description="Programs shown on the landing page services section."
      :submit-label="programForm.id ? 'Update program' : 'Add program'"
      :loading="saving"
      size="lg"
      @submit="saveProgram"
      @cancel="resetProgramForm"
    >
      <div class="dialog-form">
        <section>
          <h3>Program</h3>
          <div class="row2">
            <div class="field">
              <Label for="program-emoji">Emoji</Label>
              <Input id="program-emoji" v-model="programForm.emoji" placeholder="💻" />
            </div>
            <div class="field">
              <Label for="program-order">Order</Label>
              <Input id="program-order" v-model.number="programForm.order" type="number" min="0" />
            </div>
          </div>
          <div class="field">
            <Label for="program-title">Title</Label>
            <Input id="program-title" v-model="programForm.title" placeholder="Digital Skills Training" />
          </div>
          <div class="field">
            <Label for="program-description">Description</Label>
            <Textarea
              id="program-description"
              v-model="programForm.description"
              rows="4"
              placeholder="Short summary shown on the homepage"
            />
          </div>
        </section>

        <Separator />

        <section>
          <h3>Tag</h3>
          <div class="row2">
            <div class="field">
              <Label for="program-tag">Tag label</Label>
              <Input id="program-tag" v-model="programForm.tag" placeholder="Popular" />
            </div>
            <label class="color-field field">
              Tag color
              <div class="color-control">
                <input v-model="programForm.tag_color" type="color" class="color-swatch" />
                <input v-model="programForm.tag_color" type="text" class="color-hex" maxlength="7" />
              </div>
            </label>
          </div>
          <label class="check">
            <input v-model="programForm.is_active" type="checkbox" />
            Show on homepage
          </label>
        </section>
      </div>
    </FormDialog>

    <FormDialog
      v-model:open="teamDialogOpen"
      :title="teamForm.id ? 'Edit team member' : 'Add team member'"
      description="People featured in Meet Our Team and available for meetings."
      :submit-label="teamForm.id ? 'Update member' : 'Add member'"
      :loading="saving"
      size="lg"
      @submit="saveTeam"
      @cancel="resetTeamForm"
    >
      <div class="dialog-form">
        <section>
          <h3>Profile</h3>
          <div class="row2">
            <div class="field">
              <Label for="team-name">Name</Label>
              <Input id="team-name" v-model="teamForm.name" placeholder="Full name" />
            </div>
            <div class="field">
              <Label for="team-role">Role</Label>
              <Input id="team-role" v-model="teamForm.role" placeholder="Job title" />
            </div>
          </div>
          <div class="row2">
            <div class="field">
              <Label for="team-initials">Initials</Label>
              <Input id="team-initials" v-model="teamForm.initials" placeholder="MM" maxlength="4" />
            </div>
            <div class="field">
              <Label for="team-email">Email (meeting notifications)</Label>
              <Input
                id="team-email"
                v-model="teamForm.email"
                type="email"
                placeholder="official@streetlabsafrica.org"
              />
            </div>
          </div>
          <div class="field">
            <Label for="team-order">Order</Label>
            <Input id="team-order" v-model.number="teamForm.order" type="number" min="0" />
          </div>
          <div class="field">
            <Label for="team-bio">Bio</Label>
            <Textarea id="team-bio" v-model="teamForm.bio" rows="4" placeholder="Short bio for the team section" />
          </div>
        </section>

        <Separator />

        <section>
          <h3>Photo</h3>
          <label class="photo-field field">
            Portrait
            <input ref="photoInput" type="file" accept="image/*" @change="onTeamPhotoChange" />
          </label>
          <div v-if="teamForm.photoPreview" class="photo-preview-wrap">
            <div class="photo-preview">
              <img :src="teamForm.photoPreview" alt="Team member photo preview" />
            </div>
          </div>
        </section>

        <Separator />

        <section>
          <h3>Visibility</h3>
          <label class="check">
            <input v-model="teamForm.is_published" type="checkbox" />
            Published on website
          </label>
          <label class="check">
            <input v-model="teamForm.accepts_meetings" type="checkbox" />
            Accepts meeting requests
          </label>
        </section>
      </div>
    </FormDialog>

    <FormDialog
      v-model:open="valueDialogOpen"
      :title="valueForm.id ? 'Edit value' : 'Add value'"
      description="Brand values shown on the landing page."
      :submit-label="valueForm.id ? 'Update value' : 'Add value'"
      :loading="saving"
      size="lg"
      @submit="saveValue"
      @cancel="resetValueForm"
    >
      <div class="dialog-form">
        <section>
          <h3>Value</h3>
          <div class="row2">
            <div class="field">
              <Label for="value-emoji">Emoji</Label>
              <Input id="value-emoji" v-model="valueForm.emoji" placeholder="💡" />
            </div>
            <div class="field">
              <Label for="value-order">Order</Label>
              <Input id="value-order" v-model.number="valueForm.order" type="number" min="0" />
            </div>
          </div>
          <div class="field">
            <Label for="value-title">Title</Label>
            <Input id="value-title" v-model="valueForm.title" placeholder="Innovation" />
          </div>
          <div class="field">
            <Label for="value-description">Description</Label>
            <Textarea
              id="value-description"
              v-model="valueForm.description"
              rows="4"
              placeholder="What this value means to SLA"
            />
          </div>
        </section>

        <Separator />

        <section>
          <h3>Style</h3>
          <label class="color-field field">
            Accent color
            <div class="color-control">
              <input v-model="valueForm.color" type="color" class="color-swatch" />
              <input v-model="valueForm.color" type="text" class="color-hex" maxlength="7" />
            </div>
          </label>
          <label class="check">
            <input v-model="valueForm.is_active" type="checkbox" />
            Show on homepage
          </label>
        </section>
      </div>
    </FormDialog>

    <ImageCropModal
      :open="cropOpen"
      :image-url="cropSrc"
      :file-name="cropFileName"
      :shape="cropShape"
      :title="cropTitle"
      @close="closeCropper"
      @confirm="onCropConfirm"
    />
  </div>
</template>

<style scoped>
h1 { margin-bottom: 0.2rem; }
.sub { color: #5b6b82; margin-bottom: 1rem; }
.section-title {
  margin: 0.4rem 0 0;
  font-size: 1.05rem;
  color: #0a1f44;
}
.hint {
  margin: 0;
  color: #5b6b82;
  font-size: 0.88rem;
}
.tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.tabs button {
  border: 0; background: #e8eef6; color: #0a1f44; padding: 0.55rem 0.9rem;
  border-radius: 999px; font: inherit; cursor: pointer; text-transform: capitalize;
}
.tabs button.active { background: #0a1f44; color: #fff; }
.panel, .editor { background: #fff; border-radius: 16px; padding: 1rem; display: grid; gap: 0.7rem; }
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.35rem;
}
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
.dialog-form input,
.dialog-form textarea,
.dialog-form select {
  width: 100%;
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
label { display: grid; gap: 0.5rem; color: #5b6b82; font-size: 0.9rem; }
.nested { display: contents; }
input, textarea {
  border: 1px solid #d8dee8; border-radius: 0.625rem; padding: 0.75rem 1rem; font: inherit; color: #0a1f44;
}
.photo-field input[type="file"] {
  padding: 0.45rem;
  background: #f7f9fc;
}
.photo-preview {
  width: 120px;
  height: 150px;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e8eef6;
  background:
    linear-gradient(45deg, #e8eef6 25%, transparent 25%),
    linear-gradient(-45deg, #e8eef6 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e8eef6 75%),
    linear-gradient(-45deg, transparent 75%, #e8eef6 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  background-color: #fff;
}
.photo-preview-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.linkish {
  border: 0;
  background: transparent;
  color: #ff6a00;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  padding: 0;
}
.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
.media-grid {
  display: grid;
  gap: 0.75rem;
}
.media-preview {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e8eef6;
  background: #0a1f44;
  max-width: 420px;
  position: relative;
}
.media-preview.wide { max-width: 100%; }
.media-preview img,
.media-preview video {
  display: block;
  width: 100%;
  max-height: 240px;
  object-fit: cover;
}
.media-preview.video video { max-height: 280px; background: #000; }
.chip {
  position: absolute;
  left: 0.6rem;
  bottom: 0.6rem;
  background: rgba(10, 31, 68, 0.85);
  color: #fff;
  font-size: 0.72rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}
.empty-media {
  color: #5b6b82;
  background: #f7f9fc;
  border: 1px dashed #d8dee8;
  border-radius: 12px;
  padding: 1rem;
  font-size: 0.88rem;
}
.table-thumb {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  display: block;
  background: #eef2f7;
  border: 1px solid #e8eef6;
}
.table-thumb.portrait {
  height: 64px;
  object-fit: contain;
  object-position: center;
  background: #fff;
}
.table-thumb.placeholder {
  display: grid;
  place-items: center;
  color: #9aa8bc;
  font-size: 0.8rem;
  font-weight: 700;
}
.table-thumb.portrait.placeholder {
  background: #0a1f44;
  color: #fff;
}
.table-title {
  display: block;
  font-size: 0.92rem;
  line-height: 1.35;
}
.table-sub {
  margin: 0.2rem 0 0;
  color: #5b6b82;
  font-size: 0.8rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.table-emoji {
  font-size: 1.35rem;
  line-height: 1;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}
.muted-dash {
  color: #9aa8bc;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.status-pill.on {
  background: #e8f8ee;
  color: #0a7a3d;
}
.status-pill.off {
  background: #f1f5f9;
  color: #5b6b82;
}
.table-btn {
  border: 0;
  border-radius: 8px;
  padding: 0.38rem 0.62rem;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  background: #eef2f7;
  color: #0a1f44;
}
.table-btn.danger {
  background: #ffe8e4;
  color: #b42318;
}
.row-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.row3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.7rem; }
.color-control {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.color-swatch {
  width: 48px;
  height: 40px;
  padding: 0 !important;
  border: 1px solid #d8dee8 !important;
  border-radius: 10px !important;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
}
.color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
.color-swatch::-webkit-color-swatch {
  border: none;
  border-radius: 8px;
}
.color-swatch::-moz-color-swatch {
  border: none;
  border-radius: 8px;
}
.color-hex {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  text-transform: lowercase;
}
.actions { display: flex; gap: 0.4rem; }
.actions button, .cta, .danger, .row-actions button {
  border: 0; border-radius: 999px; padding: 0.55rem 0.9rem; font: inherit; cursor: pointer;
}
.actions button, .row-actions button:not(.cta) { background: #eef2f7; }
.cta {
  background: #ff6a00; color: #fff; font-weight: 600; justify-self: start;
}
.cta:disabled { opacity: 0.6; cursor: not-allowed; }
.danger { background: #ffe8e4; color: #b42318; }
.badge { background: #eef2f7; padding: 0.3rem 0.6rem; border-radius: 999px; font-size: 0.8rem; }
.error { color: #b42318; }
.ok { color: #0a7a3d; }
.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0a1f44;
  font-size: 0.9rem;
}
.check input { width: auto; }

@media (max-width: 720px) {
  .row2, .row3 { grid-template-columns: 1fr; }
}
</style>
