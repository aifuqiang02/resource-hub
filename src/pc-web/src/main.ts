import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@material-symbols/font-400/outlined.css'

import App from './App.vue'
import { registerDirectives } from './directives'
import router from './router'
import { useAppStore } from './stores/app'
import './assets/styles/global.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
registerDirectives(app)

useAppStore(pinia).initialize()
app.mount('#app')
