import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        // Point proxy to the backend dev server
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})
