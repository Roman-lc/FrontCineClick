import { existsSync, readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// HTTPS opcional en desarrollo, para usar la camara desde un celular de la red local (la camara solo
// funciona en HTTPS o en localhost). Se activa solo si existen los certificados de certs/ (ver README).
const CERT = 'certs/cineclick-dev.pem'
const CLAVE = 'certs/cineclick-dev-key.pem'
const https = existsSync(CERT) && existsSync(CLAVE) ? { cert: readFileSync(CERT), key: readFileSync(CLAVE) } : undefined

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https,
    // Con VITE_API_URL=/ los pedidos van a /api/... y este proxy los manda al backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
