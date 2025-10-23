import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
          ui: ['bootstrap']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'react-router-dom'
    ],
    exclude: ['js-big-decimal']
  },
  server: {
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: false
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})