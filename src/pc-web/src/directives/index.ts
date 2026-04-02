import type { App } from 'vue'
import { permissionDirective } from './permission'

export const registerDirectives = (app: App) => {
  app.directive('permission', permissionDirective)
}
