import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // app will be served at /app/ so we can keep
  // existing root, lifestyle, and portfolio static sites unchanged
  base: '/app/',
})
