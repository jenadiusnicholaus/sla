<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Cropper, CircleStencil, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  open: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' },
  fileName: { type: String, default: 'photo.jpg' },
  /** 'circle' for avatars, 'rect' for banners/gallery */
  shape: { type: String, default: 'circle' },
  title: { type: String, default: 'Crop image' },
  outputSize: { type: Number, default: 512 },
})

const emit = defineEmits(['close', 'confirm'])

const cropper = ref(null)
const stencilComponent = computed(() =>
  props.shape === 'circle' ? CircleStencil : RectangleStencil,
)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) await nextTick()
  },
)

function onClose() {
  emit('close')
}

function onConfirm() {
  const result = cropper.value?.getResult()
  if (!result?.canvas) return

  const source = result.canvas
  const out = document.createElement('canvas')

  if (props.shape === 'circle') {
    // Square export — circular display is handled by CSS on the site
    const size = props.outputSize
    out.width = size
    out.height = size
    const ctx = out.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(source, 0, 0, size, size)
  } else {
    const maxW = 1280
    const scale = Math.min(1, maxW / source.width)
    out.width = Math.round(source.width * scale)
    out.height = Math.round(source.height * scale)
    const ctx = out.getContext('2d')
    ctx.drawImage(source, 0, 0, out.width, out.height)
  }

  out.toBlob(
    (blob) => {
      if (!blob) return
      const name = props.fileName.replace(/\.\w+$/, '') + '-cropped.jpg'
      const file = new File([blob], name, { type: 'image/jpeg' })
      const previewUrl = URL.createObjectURL(blob)
      emit('confirm', { file, previewUrl })
    },
    'image/jpeg',
    0.92,
  )
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="crop-overlay" @click.self="onClose">
      <div class="crop-sheet" role="dialog" aria-modal="true" :aria-label="title">
        <header>
          <h2>{{ title }}</h2>
          <p>Drag to reposition. Scroll or pinch to zoom.</p>
        </header>

        <div class="crop-stage" :class="shape">
          <Cropper
            v-if="imageUrl"
            ref="cropper"
            class="cropper"
            :src="imageUrl"
            :stencil-component="stencilComponent"
            :stencil-props="shape === 'circle' ? { aspectRatio: 1 } : { aspectRatio: 16 / 10 }"
            :canvas="{ maxWidth: 1600, maxHeight: 1600 }"
          />
        </div>

        <footer>
          <button type="button" class="ghost" @click="onClose">Cancel</button>
          <button type="button" class="primary" @click="onConfirm">Apply crop</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.crop-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(6, 21, 46, 0.6);
  display: grid;
  place-items: center;
  padding: 1rem;
}
.crop-sheet {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(10, 31, 68, 0.3);
}
header {
  padding: 1rem 1.2rem 0.5rem;
}
header h2 {
  margin: 0;
  font-size: 1.15rem;
  color: #0a1f44;
}
header p {
  margin: 0.25rem 0 0;
  color: #5b6b82;
  font-size: 0.88rem;
}
.crop-stage {
  height: min(52vh, 420px);
  background: #0a1f44;
}
.cropper {
  height: 100%;
  background: #0a1f44;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  padding: 0.9rem 1.1rem 1.1rem;
}
.ghost,
.primary {
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 1.15rem;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}
.ghost {
  background: #eef2f7;
  color: #0a1f44;
}
.primary {
  background: #ff6a00;
  color: #fff;
}
</style>
