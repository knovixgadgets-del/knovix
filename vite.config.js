import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploying to public_html root (your own domain / subdomain root) -> leave as '/'.
// Deploying into a subfolder e.g. public_html/shop/ -> build with:
//   VITE_BASE_PATH=/shop/ npm run build
// (Do NOT hardcode '/shop/' here unless you always deploy to that exact subfolder —
// a mismatch between this value and where dist/ is actually uploaded is what causes
// blank pages / broken images / 404s on all assets.)
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: { port: 5173 }
})
