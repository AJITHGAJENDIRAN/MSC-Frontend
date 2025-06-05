import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // You can specify the dev server port
    open: true,  // Opens the browser automatically
  },
  build: {
    outDir: 'dist', // Output folder for production build
  }
})
