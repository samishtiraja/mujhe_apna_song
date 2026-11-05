import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

// Find system Chrome executable
function getChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ]
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p
  }
  throw new Error('Could not find Google Chrome or Microsoft Edge. Please specify chrome path.')
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const config = {
    start: 0,
    duration: 12, // default 12 seconds
    fps: 60,
    width: 1920,
    height: 1080,
    crf: 14,
    output: 'output_12s.mp4',
    quality: '1080p',
    audio: path.resolve('song/aaye na sawariya.mp3'),
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--start') config.start = parseFloat(args[++i])
    else if (arg === '--duration') {
      const v = args[++i]
      config.duration = v === 'full' ? 289.0 : parseFloat(v)
    } else if (arg === '--fps') config.fps = parseInt(args[++i], 10)
    else if (arg === '--output' || arg === '-o') config.output = args[++i]
    else if (arg === '--4k') {
      config.width = 3840
      config.height = 2160
      config.quality = '4K'
    } else if (arg === '--crf') config.crf = parseInt(args[++i], 10)
  }

  return config
}

async function startViteServer() {
  // Check if server is already running on port 5173
  try {
    const res = await fetch('http://localhost:5173')
    if (res.ok) {
      console.log('Using already running Vite server at http://localhost:5173')
      return { serverProcess: null, url: 'http://localhost:5173' }
    }
  } catch {
    // Not running, launch it
  }

  console.log('Starting local Vite dev server...')
  const viteProc = spawn('npx', ['vite', '--port', '5173', '--no-open'], {
    shell: true,
    stdio: 'pipe',
  })

  // Wait for server to start
  await new Promise((resolve, reject) => {
    viteProc.stdout.on('data', (d) => {
      const msg = d.toString()
      if (msg.includes('Local:') || msg.includes('localhost:5173')) {
        resolve()
      }
    })
    viteProc.stderr.on('data', (d) => {
      // ignore warnings
    })
    setTimeout(() => resolve(), 4000)
  })

  return { serverProcess: viteProc, url: 'http://localhost:5173' }
}

async function main() {
  const config = parseArgs()
  console.log('=====================================================')
  console.log(`🎬 SongScript Headless Master Video Exporter`)
  console.log(`• Quality:     ${config.quality} (${config.width}x${config.height})`)
  console.log(`• Framerate:   ${config.fps} fps`)
  console.log(`• Segment:     ${config.start.toFixed(1)}s to ${(config.start + config.duration).toFixed(1)}s (${config.duration}s total)`)
  console.log(`• Quality CRF: ${config.crf} (Virtually lossless studio master)`)
  console.log(`• Output File: ${config.output}`)
  console.log('=====================================================')

  const totalFrames = Math.round(config.duration * config.fps)
  const dt = 1.0 / config.fps

  const { serverProcess, url } = await startViteServer()

  console.log('Launching Headless Chrome...')
  const chromePath = getChromePath()
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--hide-scrollbars',
      `--window-size=${config.width},${config.height}`,
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: config.width,
    height: config.height,
    deviceScaleFactor: 1,
  })

  // Open the page in export mode
  await page.goto(`${url}/?export=1`, { waitUntil: 'networkidle2' })

  // Wait for fonts & assets to settle
  await page.evaluate(() => document.fonts?.ready)
  await new Promise((r) => setTimeout(r, 1000))

  console.log(`Spawning FFmpeg encoder...`)

  // Spawn ffmpeg with image pipe input and synced audio
  const hasAudio = fs.existsSync(config.audio)
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(config.fps),
    '-i', '-', // stdin image pipe
  ]

  if (hasAudio) {
    ffmpegArgs.push(
      '-ss', String(config.start),
      '-t', String(config.duration),
      '-i', config.audio,
      '-c:a', 'aac',
      '-b:a', '320k',
      '-af', 'apad',
      '-shortest'
    )
  }

  ffmpegArgs.push(
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', String(config.crf),
    '-pix_fmt', 'yuv420p',
    config.output
  )

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, { stdio: ['pipe', 'inherit', 'inherit'] })

  console.log(`Rendering ${totalFrames} frames...`)
  const startTime = Date.now()

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentTime = config.start + frame * dt

    // Seek exact timeline time frame-accurately
    await page.evaluate((t) => {
      if (typeof window.__SET_TIMELINE_TIME__ === 'function') {
        window.__SET_TIMELINE_TIME__(t)
      }
    }, currentTime)

    // Capture lossless PNG buffer
    const screenshot = await page.screenshot({ type: 'png' })

    // Pipe directly to ffmpeg
    const canWrite = ffmpeg.stdin.write(screenshot)
    if (!canWrite) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve))
    }

    if (frame % 30 === 0 || frame === totalFrames - 1) {
      const pct = (((frame + 1) / totalFrames) * 100).toFixed(1)
      const elapsed = (Date.now() - startTime) / 1000
      const fpsRender = ((frame + 1) / elapsed).toFixed(1)
      const remainingSec = (((totalFrames - (frame + 1)) / fpsRender) || 0).toFixed(0)
      process.stdout.write(`\r▶ [${pct}%] Frame ${frame + 1}/${totalFrames} | ${currentTime.toFixed(2)}s | ${fpsRender} fps | ETA: ${remainingSec}s  `)
    }
  }

  console.log('\nFinalizing video encoding with FFmpeg...')
  ffmpeg.stdin.end()

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`FFmpeg exited with code ${code}`))
    })
  })

  await browser.close()
  if (serverProcess) {
    serverProcess.kill()
  }

  const stat = fs.statSync(config.output)
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2)

  console.log('=====================================================')
  console.log(`✅ Master Video Export Complete!`)
  console.log(`📁 File: ${path.resolve(config.output)}`)
  console.log(`📦 Size: ${sizeMb} MB`)
  console.log(`🎯 Quality: Studio Master (${config.width}x${config.height} @ ${config.fps}fps)`)
  console.log('=====================================================')
}

main().catch((err) => {
  console.error('Export failed:', err)
  process.exit(1)
})
