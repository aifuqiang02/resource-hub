import type { Directive } from 'vue'
import { createPinia, getActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'
import { hasPermission } from '@/permissions/has-permission'

const resolveAuthStore = () => {
  const pinia = getActivePinia() ?? createPinia()

  return useAuthStore(pinia)
}

const applyPermission = (el: HTMLElement, roles?: UserRole[]) => {
  const authStore = resolveAuthStore()
  const visible = hasPermission(authStore.roles, roles)

  el.style.display = visible ? '' : 'none'
}

export const permissionDirective: Directive<HTMLElement, UserRole[] | undefined> = {
  mounted(el, binding) {
    applyPermission(el, binding.value)
  },
  updated(el, binding) {
    applyPermission(el, binding.value)
  },
}
