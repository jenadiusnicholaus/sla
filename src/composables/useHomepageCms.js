import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'
import { cmsApi } from '@/api/client'

const CHANNEL = 'sla-cms-updated'
const STORAGE_KEY = 'sla_cms_updated_at'
const POLL_MS = 30_000

const homepage = ref(null)
const loading = ref(false) // initial load only — never set during background sync
const refreshing = ref(false)
const error = ref(null)
const lastFetchedAt = ref(null)
let loadPromise = null
let channel = null

function getChannel() {
  if (typeof BroadcastChannel === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL)
  return channel
}

function bumpSyncSignal() {
  const stamp = String(Date.now())
  try {
    localStorage.setItem(STORAGE_KEY, stamp)
  } catch {
    /* private mode / blocked storage */
  }
  getChannel()?.postMessage({ type: 'cms-updated', at: stamp })
}

/**
 * Fetch homepage CMS.
 * Soft by default: keeps existing content on screen until new data arrives.
 */
async function fetchHomepage({ force = false, soft = true } = {}) {
  if (!force && homepage.value) return homepage.value
  if (loadPromise) {
    if (!force) return loadPromise
    await loadPromise.catch(() => null)
  }

  const isInitial = !homepage.value
  if (isInitial) loading.value = true
  else refreshing.value = true
  if (isInitial) error.value = null

  loadPromise = cmsApi
    .homepage()
    .then((data) => {
      homepage.value = data
      lastFetchedAt.value = Date.now()
      error.value = null
      return data
    })
    .catch((err) => {
      // Keep previous content if a soft refresh fails
      if (!homepage.value || !soft) {
        error.value = err instanceof Error ? err.message : 'Failed to load CMS'
      }
      if (!homepage.value) throw err
      return homepage.value
    })
    .finally(() => {
      loading.value = false
      refreshing.value = false
      loadPromise = null
    })

  return loadPromise
}

/** Notify other tabs and soft-refresh without blanking the landing page. */
export async function invalidateHomepageCms() {
  bumpSyncSignal()
  try {
    return await fetchHomepage({ force: true, soft: true })
  } catch {
    return homepage.value
  }
}

export function useHomepageCms() {
  async function load(force = false) {
    return fetchHomepage({ force, soft: true })
  }

  /** Background refresh — never clears current UI data. */
  async function refresh() {
    return fetchHomepage({ force: true, soft: true })
  }

  function startLiveSync(options = {}) {
    const pollMs = options.pollMs ?? POLL_MS
    let pollTimer = null
    let lastStorageStamp = null
    try {
      lastStorageStamp = localStorage.getItem(STORAGE_KEY)
    } catch {
      lastStorageStamp = null
    }

    const safeRefresh = () => {
      refresh().catch(() => {
        /* keep previous data / fallbacks */
      })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') safeRefresh()
    }

    const onFocus = () => safeRefresh()

    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      if (event.newValue === lastStorageStamp) return
      lastStorageStamp = event.newValue
      safeRefresh()
    }

    const onBroadcast = () => safeRefresh()

    const startPoll = () => {
      stopPoll()
      if (!pollMs) return
      pollTimer = window.setInterval(() => {
        if (document.visibilityState === 'visible') safeRefresh()
      }, pollMs)
    }

    const stopPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    // Initial load (or soft refresh if cache already warm)
    safeRefresh()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onStorage)
    getChannel()?.addEventListener('message', onBroadcast)
    startPoll()

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onStorage)
      getChannel()?.removeEventListener('message', onBroadcast)
      stopPoll()
    }
  }

  function useLiveHomepage(options) {
    let stop = null
    onMounted(() => {
      stop = startLiveSync(options)
    })
    onUnmounted(() => {
      stop?.()
    })
  }

  const settings = computed(() => homepage.value?.settings ?? null)
  const announcement = computed(() => homepage.value?.announcement ?? null)
  const nav = computed(() => homepage.value?.nav ?? [])
  const hero = computed(() => homepage.value?.hero ?? null)
  const stats = computed(() => homepage.value?.stats ?? [])
  const gallery = computed(() => homepage.value?.gallery ?? null)
  const about = computed(() => homepage.value?.about ?? null)
  const values = computed(() => homepage.value?.values ?? [])
  const programs = computed(() => homepage.value?.programs ?? [])
  const orgChart = computed(() => homepage.value?.org_chart ?? [])
  const team = computed(() => homepage.value?.team ?? [])
  const socialLinks = computed(() => homepage.value?.social_links ?? [])
  const donate = computed(() => homepage.value?.donate ?? null)

  function statsFor(placement) {
    return computed(() =>
      (homepage.value?.stats ?? [])
        .filter((s) => s.placement === placement)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    )
  }

  function navFor(placement) {
    return computed(() =>
      (homepage.value?.nav ?? [])
        .filter((n) => n.placement === placement || n.placement === 'both')
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    )
  }

  return {
    homepage: readonly(homepage),
    loading: readonly(loading),
    refreshing: readonly(refreshing),
    error: readonly(error),
    lastFetchedAt: readonly(lastFetchedAt),
    load,
    refresh,
    invalidate: invalidateHomepageCms,
    startLiveSync,
    useLiveHomepage,
    settings,
    announcement,
    nav,
    hero,
    stats,
    gallery,
    about,
    values,
    programs,
    orgChart,
    team,
    socialLinks,
    donate,
    statsFor,
    navFor,
  }
}
