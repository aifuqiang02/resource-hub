import type { UserRole } from '@/types/auth'

export const hasPermission = (currentRoles: UserRole[], requiredRoles?: UserRole[]) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }

  return requiredRoles.some((role) => currentRoles.includes(role))
}
