import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const configuredTarget = (env.VITE_API_TARGET || env.VITE_API_URL || '').trim()
  const apiTarget = configuredTarget || (mode === 'development' ? 'http://localhost:3000' : '')

  if (!apiTarget) {
    console.warn('[vite] API proxy disabled: set VITE_API_URL or VITE_API_TARGET to enable /api forwarding.')
  }

  return {
    plugins: [
      react(),
      tailwindcss() as any,
    ],
    server: apiTarget
      ? {
          proxy: {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
          },
        }
      : undefined,
  }
})
