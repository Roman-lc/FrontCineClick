import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const CERT = 'certs/cineclick-dev.pem'
const CLAVE = 'certs/cineclick-dev-key.pem'
const https = existsSync(CERT) && existsSync(CLAVE) ? { cert: readFileSync(CERT), key: readFileSync(CLAVE) } : undefined

export default defineConfig({
  plugins: [react()],
  server: {
    https,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
