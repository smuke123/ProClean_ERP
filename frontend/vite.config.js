import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/primeicons/fonts/*',
          dest: 'assets/fonts'
        }
      ]
    })
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Asegurar que los assets se copien correctamente
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Mantener las fuentes en la carpeta fonts
          if (assetInfo.name.endsWith('.woff') || 
              assetInfo.name.endsWith('.woff2') || 
              assetInfo.name.endsWith('.ttf') || 
              assetInfo.name.endsWith('.eot') || 
              assetInfo.name.endsWith('.svg')) {
            return 'assets/fonts/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  // Optimizar dependencias que contienen fuentes
  optimizeDeps: {
    include: ['primeicons', 'primereact']
  }
})
