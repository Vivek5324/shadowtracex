import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/abuseipdb-check': {
        target: 'https://api.abuseipdb.com',
        changeOrigin: true,
        rewrite: () => '/api/v2/check',
        secure: true
      }
    }
  }
})
