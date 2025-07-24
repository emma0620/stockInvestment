import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://rate.bot.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/xrt/flcsv/0/day'),
        headers: {
          Referer: 'https://rate.bot.com.tw/xrt/flcsv/0/day',
          Origin: 'https://rate.bot.com.tw',
        },
      },
    },
  },
})
