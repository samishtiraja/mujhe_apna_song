import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.join(rootDir, 'assets')
const songDir = path.join(rootDir, 'song')

const types = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
}

function serveStaticFolder(mountPath, folderDir) {
  return (req, res, next) => {
    try {
      const raw = decodeURIComponent((req.url || '/').split('?')[0])
      const rel = raw.replace(/^\/+/, '')
      if (!rel || rel.endsWith('/')) return next()

      const filePath = path.resolve(folderDir, rel)
      const relative = path.relative(folderDir, filePath)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        res.statusCode = 403
        res.end()
        return
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end('Not Found')
        return
      }

      res.setHeader(
        'Content-Type',
        types[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      )
      res.setHeader('Cache-Control', 'no-cache')
      if (req.method === 'HEAD') {
        res.end()
        return
      }
      fs.createReadStream(filePath).pipe(res)
    } catch {
      next()
    }
  }
}

function customAssetsPlugin() {
  return {
    name: 'custom-assets-plugin',
    configureServer(server) {
      server.middlewares.use('/assets', serveStaticFolder('/assets', assetsDir))
      server.middlewares.use('/song', serveStaticFolder('/song', songDir))
    },
    closeBundle() {
      if (fs.existsSync(assetsDir)) {
        fs.cpSync(assetsDir, path.join(rootDir, 'dist', 'assets'), { recursive: true })
      }
      if (fs.existsSync(songDir)) {
        fs.cpSync(songDir, path.join(rootDir, 'dist', 'song'), { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), customAssetsPlugin()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'coleman-impennate-verdie.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      '.ngrok.app',
    ],
  },
})
