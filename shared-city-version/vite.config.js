import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'

// 兼容 ESM，定义 __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 是否启用内置 Mock，中短期改为 false 使用真实后端
const ENABLE_MOCK = false

// 简易 Mock 插件：模拟 /api/projects 及其子路由
function mockApiPlugin() {
  return {
    name: 'mock-api',
    configureServer(server) {
      // 列表
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (req.method !== 'GET' || url.pathname !== '/api/projects') return next()
        const filePath = path.join(__dirname, 'mock', 'projects.json')
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read mock data' }))
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        })
      })

      // 详情、阶段、评论、要素
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/projects/')) return next()
        const url = new URL(req.url, 'http://localhost')
        const parts = url.pathname.split('/') // ['', 'api', 'projects', ':id', ...]
        const id = parts[3]
        const sub = parts.slice(4).join('/') // phases | comments | features

        const filePath = path.join(__dirname, 'mock', 'projects.json')
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to read mock data' }))
            return
          }
          const list = JSON.parse(data)
          const proj = list.find(p => p.id === id) || {
            id,
            name: `项目${id}`,
            description: '',
            startDate: '2023-01-01',
            endDate: '2023-12-31',
            status: 'inProgress'
          }

          res.setHeader('Content-Type', 'application/json')

          if (!sub) {
            res.end(JSON.stringify(proj))
            return
          }

          if (sub.startsWith('phases')) {
            res.end(JSON.stringify([
              { id: 'p1', name: '规划', startDate: '2023-01-01', endDate: '2023-03-31', progress: 100 },
              { id: 'p2', name: '建设', startDate: '2023-04-01', endDate: '2023-09-30', progress: 60 },
              { id: 'p3', name: '验收', startDate: '2023-10-01', endDate: '2023-12-15', progress: 10 }
            ]))
            return
          }

          if (sub.startsWith('comments')) {
            if (req.method === 'GET') {
              res.end(JSON.stringify([]))
              return
            }
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => (body += chunk))
              req.on('end', () => {
                const payload = body ? JSON.parse(body) : {}
                const saved = {
                  id: Date.now().toString(),
                  content: payload.content || '',
                  authorName: '游客',
                  createdAt: new Date().toISOString()
                }
                res.end(JSON.stringify(saved))
              })
              return
            }
          }

          if (sub.startsWith('features')) {
            if (req.method === 'GET') {
              res.end(JSON.stringify({ type: 'FeatureCollection', features: [] }))
              return
            }
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => (body += chunk))
              req.on('end', () => {
                res.end(body || JSON.stringify({ type: 'FeatureCollection', features: [] }))
              })
              return
            }
          }

          next()
        })
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 仅当需要本地 Mock 时启用
    ...(ENABLE_MOCK ? [mockApiPlugin()] : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ['@arcgis/core']
  },
  server: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8085',
        changeOrigin: true
      }
    }
  }
})