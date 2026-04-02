import type { Router } from 'vue-router'
import { APP_NAME } from '@/constants/app'
import { PUBLIC_ROUTE_NAMES } from '@/constants/auth'
import { useAuthStore } from '@/stores/auth'

export const setupRouterGuards = (router: Router) => {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    document.title = to.meta.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return authStore.redirectAfterLogin
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      authStore.redirectAfterLogin = to.fullPath
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (to.meta.requiresAuth && !authStore.hasAnyRole(to.meta.roles)) {
      return {
        name: 'forbidden',
      }
    }

    if (!PUBLIC_ROUTE_NAMES.includes(to.name as (typeof PUBLIC_ROUTE_NAMES)[number])) {
      authStore.redirectAfterLogin = to.fullPath
    }
  })
}
