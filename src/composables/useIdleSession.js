import { ref } from 'vue'

const IDLE_TIMEOUT_MS = 5 * 60 * 1000
const WARNING_COUNTDOWN_SEC = 30
const ACTIVITY_THROTTLE_MS = 1000

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

const showWarning = ref(false)
const secondsLeft = ref(WARNING_COUNTDOWN_SEC)

let idleTimer = null
let countdownTimer = null
let listenersBound = false
let lastActivityAt = 0
let onExpireCallback = null

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

function clearCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function openWarning() {
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

function resetIdleTimer() {
  if (showWarning.value) return
  clearIdleTimer()
  idleTimer = setTimeout(openWarning, IDLE_TIMEOUT_MS)
}

function onActivity() {
  if (showWarning.value) return
  const now = Date.now()
  if (now - lastActivityAt < ACTIVITY_THROTTLE_MS) return
  lastActivityAt = now
  resetIdleTimer()
}

function bindListeners() {
  if (listenersBound) return
  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, onActivity, { passive: true })
  })
  listenersBound = true
}

function unbindListeners() {
  if (!listenersBound) return
  ACTIVITY_EVENTS.forEach((event) => {
    window.removeEventListener(event, onActivity)
  })
  listenersBound = false
}

function expireSession() {
  const callback = onExpireCallback
  stopIdleSession()
  callback?.()
}

export function stopIdleSession() {
  clearIdleTimer()
  clearCountdownTimer()
  unbindListeners()
  showWarning.value = false
  secondsLeft.value = WARNING_COUNTDOWN_SEC
  onExpireCallback = null
  lastActivityAt = 0
}

export function useIdleSession() {
  function start({ onExpire } = {}) {
    stopIdleSession()
    onExpireCallback = onExpire
    bindListeners()
    lastActivityAt = Date.now()
    resetIdleTimer()
  }

  function stayLoggedIn() {
    showWarning.value = false
    clearCountdownTimer()
    secondsLeft.value = WARNING_COUNTDOWN_SEC
    lastActivityAt = Date.now()
    resetIdleTimer()
  }

  function confirmLogout() {
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
