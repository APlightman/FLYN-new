/// <reference types="vitest" />
import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/

const plugins: PluginOption[] = [react()];

if (process.env.BUILD_TARGET === 'web') {
  plugins.push(VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    },
    manifest: {
      name: 'FinanceTracker',
      short_name: 'FLYN',
      description: 'Современное десктопное приложение для управления личными финансами',
      theme_color: '#2563eb',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }));
}

export default defineConfig({
  plugins,
  base: './',
  build: {
    outDir: process.env.BUILD_TARGET === 'web' ? 'build' : 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5179,
    strictPort: false
  },
  define: {
    __ELECTRON__: JSON.stringify(process.env.ELECTRON === 'true')
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
