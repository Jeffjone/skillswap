import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // Base path for GitHub Pages - change this to your repository name if deploying to a subdirectory
  // For root domain (username.github.io), use base: '/'
  // For subdirectory (username.github.io/repo-name), use base: '/repo-name/'
  base: process.env.GITHUB_REPOSITORY 
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
