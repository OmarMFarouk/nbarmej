import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
// التطوير: شغّل `php -S localhost:8000 -t public` بجانب `npm run dev` ليعمل /api و/uploads
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), admin: resolve(import.meta.dirname, 'admin/index.html') },
    },
  },
  server: { proxy: { '/api': 'http://localhost:8000', '/uploads': 'http://localhost:8000' } },
})
