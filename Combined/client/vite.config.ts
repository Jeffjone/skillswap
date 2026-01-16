import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // Base path for GitHub Pages
  // If your repo is named 'username.github.io', use base: '/'
  // If your repo has a different name (e.g., 'my-app'), use base: '/my-app/'
  base: '/skillswap/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
