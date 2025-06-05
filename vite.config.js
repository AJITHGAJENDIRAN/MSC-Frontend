import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Base from 'antd/es/typography/Base'

export default defineConfig({
  plugins: [react()],
  Base:process.env.VITE_BASE_PATH || "/MSC-Frontend",
//   server: {
//     port: 3000,  // You can specify the dev server port
//     open: true,  // Opens the browser automatically
//   },
//   build: {
//     outDir: 'dist', // Output folder for production build
//   }
})
