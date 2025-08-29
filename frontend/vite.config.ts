import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Force refresh on all files
      fastRefresh: true,
      // Include JSX in all files
      include: "**/*.{jsx,tsx}",
    })
  ],
  server: {
    port: 5173,
    host: true,
    // Force reload on changes
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Clear cache on restart
  clearScreen: false,
}) 