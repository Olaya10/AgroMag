import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
    },
  },

  build: {
    // Separar vendors pesados en chunks propios para mejor cache
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons':  ['lucide-react'],
          'vendor-pdf':    ['jspdf'],
        },
      },
    },
    // Umbral de advertencia de chunk (kB)
    chunkSizeWarningLimit: 600,
    // Minificación con esbuild (más rápida que terser)
    minify: 'esbuild',
    // Source maps solo en desarrollo
    sourcemap: false,
  },

  // Pre-bundling de dependencias para dev más rápido
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'axios'],
  },
})
