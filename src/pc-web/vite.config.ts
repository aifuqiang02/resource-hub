import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-vue-inspector-ai'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Inspector(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 40250,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:40251',
        changeOrigin: true,
      },
    },
  },
})
