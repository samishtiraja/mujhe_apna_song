import { useEffect, useRef } from 'react'

/**
 * High-performance 2D Canvas Particle Engine
 * Supports multiple concurrent particle systems running at different depths & visual styles.
 */
export default function ParticleCanvas({ tracks = [], time = 0 }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef(new Map())
  const lastTimeRef = useRef(time)

  const particleTracks = tracks.filter((t) => t.type === 'particle')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = (canvas.width = canvas.offsetWidth || 1920)
    const height = (canvas.height = canvas.offsetHeight || 1080)

    const dt = Math.max(0.001, Math.min(0.1, time - lastTimeRef.current))
    lastTimeRef.current = time

    ctx.clearRect(0, 0, width, height)

    if (particleTracks.length === 0) {
      particlesRef.current.clear()
      return
    }

    // Process each active particle track
    particleTracks.forEach((track) => {
      const cfg = track.particle || {}
      const trackId = track.id || 'default'
      const targetCount = cfg.count ?? 20

      let pool = particlesRef.current.get(trackId)
      if (!pool) {
        pool = []
        particlesRef.current.set(trackId, pool)
      }

      // Spawn missing particles
      while (pool.length < targetCount) {
        const minSize = cfg.sizeRange ? cfg.sizeRange[0] : 2
        const maxSize = cfg.sizeRange ? cfg.sizeRange[1] : 5
        const minSpeed = cfg.speedRange ? cfg.speedRange[0] : 0.3
        const maxSpeed = cfg.speedRange ? cfg.speedRange[1] : 0.8

        pool.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: minSize + Math.random() * (maxSize - minSize),
          speedY: -(minSpeed + Math.random() * (maxSpeed - minSpeed)),
          speedX: (Math.random() - 0.5) * 0.4,
          opacity: 0.2 + Math.random() * 0.6,
          life: 0,
          maxLife: 3 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
        })
      }

      ctx.save()
      ctx.globalCompositeOperation = track.blend === 'screen' ? 'screen' : 'source-over'

      // Update & render particles
      for (let i = pool.length - 1; i >= 0; i--) {
        const p = pool[i]
        p.life += dt
        p.y += p.speedY * 60 * dt
        p.x += (p.speedX + Math.sin(p.phase + time * 2) * 0.3) * 60 * dt

        // Recycle particle if dead or offscreen
        if (p.life > p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
          p.x = Math.random() * width
          p.y = height + 10
          p.life = 0
        }

        // Alpha fade envelope
        let alpha = p.opacity
        const lifeP = p.life / p.maxLife
        if (lifeP < 0.2) alpha *= lifeP / 0.2
        else if (lifeP > 0.8) alpha *= (1 - lifeP) / 0.2

        ctx.fillStyle = cfg.color || 'rgba(235, 210, 175, 0.4)'
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })
  }, [time, particleTracks])

  if (particleTracks.length === 0) return null

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas-layer"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}
