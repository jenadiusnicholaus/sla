import { ref } from 'vue'

const IDLE_TIMEOUT_MS = 5 * 60 * 1000
const WARNING_COUNTDOWN_SEC = 30
const ACTIVITY_THROTTLE_MS = 1000

const ACTIVITY_EVENTS: string[] = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

const showWarning = ref(false)
const secondsLeft = ref(WARNING_COUNTDOWN_SEC)

let idleTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let listenersBound = false
let lastActivityAt = 0
let onExpireCallback: (() => void) | null = null

function clearIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

function clearCountdownTimer(): void {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function openWarning(): void {
  clearIdleTimer()
  showWarning.value = true
  secondsLeft.value = WARNING_COUNTDOWN_SEC
  clearCountdownTimer()

  countdownTimer = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) {
      clearCountdownTimer()
      expireSession()
    }
  }, 1000)
}

function resetIdleTimer(): void {
  if (showWarning.value) return
  clearIdleTimer()
  idleTimer = setTimeout(openWarning, IDLE_TIMEOUT_MS)
}

function onActivity(): void {
  if (showWarning.value) return
  const now = Date.now()
  if (now - lastActivityAt < ACTIVITY_THROTTLE_MS) return
  lastActivityAt = now
  resetIdleTimer()
}

function bindListeners(): void {
  if (listenersBound) return
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, onActivity, { passive: true })
  })
  listenersBound = true
}

function unbindListeners(): void {
  if (!listenersBound) return
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, onActivity)
  })
  listenersBound = false
}

function expireSession(): void {
  const callback = onExpireCallback
  stopIdleSession()
  callback?.()
}

export function stopIdleSession(): void {
  clearIdleTimer()
  clearCountdownTimer()
  unbindListeners()
  showWarning.value = false
  secondsLeft.value = WARNING_COUNTDOWN_SEC
  onExpireCallback = null
  lastActivityAt = 0
}

interface IdleSessionOptions {
  onExpire?: () => void
}

export function useIdleSession() {
  function start({ onExpire }: IdleSessionOptions = {}): void {
    stopIdleSession()
    onExpireCallback = onExpire ?? null
    bindListeners()
    lastActivityAt = Date.now()
    resetIdleTimer()
  }

  function stayLoggedIn(): void {
    showWarning.value = false
    clearCountdownTimer()
    secondsLeft.value = WARNING_COUNTDOWN_SEC
    lastActivityAt = Date.now()
    resetIdleTimer()
  }

  function confirmLogout(): void {
    expireSession()
  }

  return {
    showWarning,
    secondsLeft,
    start,
    stop: stopIdleSession,
    stayLoggedIn,
    confirmLogout,
  }
}
