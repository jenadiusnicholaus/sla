import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/qr/:code',
    name: 'smart-hub',
    component: () => import('@/pages/SmartHubPage.vue'),
    meta: { public: true },
  },
  {
    path: '/profiles/:username',
    name: 'profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { public: true },
  },
  {
    path: '/projects/:slug',
    name: 'project',
    component: () => import('@/pages/ProjectPage.vue'),
    meta: { public: true },
  },
  {
    path: '/backoffice/login',
    name: 'backoffice-login',
    component: () => import('@/pages/backoffice/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/backoffice',
    component: () => import('@/pages/backoffice/BackofficeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'backoffice-dashboard',
        component: () => import('@/pages/backoffice/DashboardPage.vue'),
      },
      {
        path: 'qr',
        name: 'backoffice-qr',
        component: () => import('@/pages/backoffice/QRCodesPage.vue'),
      },
      {
        path: 'qr/new',
        name: 'backoffice-qr-new',
        component: () => import('@/pages/backoffice/QRBuilderPage.vue'),
      },
      {
        path: 'qr/:code',
        name: 'backoffice-qr-edit',
        component: () => import('@/pages/backoffice/QRBuilderPage.vue'),
      },
      {
        path: 'profiles',
        name: 'backoffice-profiles',
        component: () => import('@/pages/backoffice/ProfilesPage.vue'),
      },
      {
        path: 'cms',
        name: 'backoffice-cms',
        component: () => import('@/pages/backoffice/CMSPage.vue'),
      },
      {
        path: 'meetings',
        name: 'backoffice-meetings',
        component: () => import('@/pages/backoffice/MeetingsPage.vue'),
      },
      {
        path: 'messages',
        name: 'backoffice-messages',
        component: () => import('@/pages/backoffice/MessagesPage.vue'),
      },
      {
        path: 'analytics',
        name: 'backoffice-analytics',
        component: () => import('@/pages/backoffice/AnalyticsPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const { isAuthenticated, fetchMe, user } = useAuth()
  if (to.meta.requiresAuth) {
    if (!isAuthenticated.value) return { name: 'backoffice-login', query: { next: to.fullPath } }
    if (!user.value) await fetchMe()
  }
  if (to.meta.guest && isAuthenticated.value) {
    return { name: 'backoffice-dashboard' }
  }
  return true
})

export default router
