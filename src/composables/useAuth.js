import { computed, ref } from 'vue'
import { authApi, clearTokens, setTokens } from '@/api/client'
import { stopIdleSession } from '@/composables/useIdleSession'

const user = ref(JSON.parse(localStorage.getItem('sla_user') || 'null'))
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(localStorage.getItem('sla_access_token')))
  const isBackoffice = computed(() => Boolean(user.value?.is_backoffice_user || user.value?.role === 'super_admin' || user.value?.role === 'admin' || user.value?.role === 'editor'))

  async function login(username, password) {
    loading.value = true
    try {
      const tokens = await authApi.login(username, password)
      setTokens(tokens.access, tokens.refresh)
      const me = await authApi.me()
      user.value = me
      localStorage.setItem('sla_user', JSON.stringify(me))
      return me
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!localStorage.getItem('sla_access_token')) return null
    try {
      const me = await authApi.me()
      user.value = me
      localStorage.setItem('sla_user', JSON.stringify(me))
      return me
    } catch {
      logout()
      return null
    }
  }

  function logout() {
    stopIdleSession()
    clearTokens()
    user.value = null
  }

  return { user, loading, isAuthenticated, isBackoffice, login, logout, fetchMe }
}
