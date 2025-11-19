import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@wasm": path.resolve(__dirname, "public/wasm"),
      "@models": path.resolve(__dirname, "src/models")
    }
  }
})
