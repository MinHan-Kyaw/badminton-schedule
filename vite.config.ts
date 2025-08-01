import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  define: {
    'import.meta.env': JSON.stringify(process.env)
  }
}) 
