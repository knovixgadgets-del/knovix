import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploy path. Defaults to "/" (site at the domain root). If the build is uploaded
// into a sub-folder such as public_html/shop/, build with:
//   VITE_BASE_PATH=/shop/ npm run build
// A mismatch between this and where dist/ is uploaded causes blank pages and
// 404s for the JS/CSS bundles.
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5173 }
})
