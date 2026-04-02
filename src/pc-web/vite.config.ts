import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-vue-inspector-ai'

const requireEnv = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required env: ${key}`)
  }

  return value
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      Inspector(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: mode === 'development'
      ? {
          port: Number(requireEnv(env.VITE_DEV_SERVER_PORT, 'VITE_DEV_SERVER_PORT')),
          proxy: {
            '/api/v1': {
              target: requireEnv(env.VITE_DEV_PROXY_TARGET, 'VITE_DEV_PROXY_TARGET'),
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
