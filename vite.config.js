import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set this to your GitHub repo name so asset paths resolve
// correctly on GitHub Pages (https://<user>.github.io/<repo>/).
// If you deploy elsewhere (Netlify, Vercel, a custom domain),
// change this back to '/'.
const REPO_NAME = '/matcap-league/'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || REPO_NAME,
})
