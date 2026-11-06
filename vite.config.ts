import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://pedrobernardina.github.io/rdr2-domino/
  base: '/rdr2-domino/',
  plugins: [react()],
})
