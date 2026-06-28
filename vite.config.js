import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Read .env file directly (Vite proxy needs this before Vite loads env vars)
const envVars = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8')
  .split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .reduce((acc, l) => { const [k, ...v] = l.split('='); acc[k.trim()] = v.join('=').trim(); return acc }, {})
const agnesKey = envVars.VITE_AGNES_KEY || envVars.AGNES_API_KEY

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: false })],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_VERCEL_URL || 'https://ai-campus-community-qu8lzkjjp-xy123.vercel.app',
        changeOrigin: true
      },
      '/agnes': {
        target: 'https://apihub.agnes-ai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agnes/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Read key from .env at request time (avoids timing issues)
            const key = agnesKey || process.env.VITE_AGNES_KEY
            if (key) proxyReq.setHeader('Authorization', 'Bearer ' + key)
          })
        }
      }
    }
  }
})