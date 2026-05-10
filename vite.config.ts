import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/animalia/',   // ← reemplaza si tu repo se llama distinto
})