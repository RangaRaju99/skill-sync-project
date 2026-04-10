import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['@stomp/stompjs', 'sockjs-client', 'react-is', 'recharts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react-is': path.resolve(__dirname, './node_modules/react-is'),
    },
  },
  define: {
    global: 'window',
  },
  server: {
    port: 4200,
  },
})

