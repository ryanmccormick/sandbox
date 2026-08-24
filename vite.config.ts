import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const menuRoot = fileURLToPath(new URL('./src/light-menu', import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'light-menu/styles.css': `${menuRoot}/styles.css`,
      'light-menu': `${menuRoot}/index.ts`,
    },
  },
})
