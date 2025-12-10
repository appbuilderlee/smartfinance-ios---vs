import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Explicitly define public dir (default is 'public')
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    }
  }
})