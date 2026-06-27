import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/demo-2026-r3f-inspector/",
  plugins: [react()],
})
