import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  TOTAL_DURATION,
  credits,
  lyricLines,
  shots,
} from './timeline.js'
import { useClock, usePrefersReducedMotion } from './useClock.js'
import './Stage.css'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getPlateOpacity(time, shot, index, allShots) {
  if (time < shot.start || time > shot.end) return 0
  const fade = shot.fade ?? 0.5
  const fadeIn = index > 0 && allShots[index - 1].file === shot.file ? false : true
  const fadeOut = shot.fadeOut === false || (index < allShots.length - 1 && allShots[index + 1].file === shot.file) ? false : true
  let op = 1
  if (fadeIn && time < shot.start + fade) {
    op = Math.min(op, (time - shot.start) / fade)
  }
  if (fadeOut && time > shot.end - fade) {
    op = Math.min(op, (shot.end - time) / fade)
  }
  return Math.max(0, Math.min(1, op))
}

function getCameraTransform(time, shot, reduceMotion) {
  if (reduceMotion) {
    return { transform: 'scale(1)', transformOrigin: '50% 50%' }
  }
  const duration = shot.end - shot.start
  const p = duration > 0 ? Math.max(0, Math.min(1, (time - shot.start) / duration)) : 0
  const c = shot.camera || {}
  const scaleStart = c.scaleStart ?? 1.0
  const scaleEnd = c.scaleEnd ?? 1.0
  const scale = scaleStart + (scaleEnd - scaleStart) * p
  const oxStart = c.originStartX ?? 50
  const oxEnd = c.originEndX ?? 50
  const ox = oxStart + (oxEnd - oxStart) * p
  const oyStart = c.originStartY ?? 50
  const oyEnd = c.originEndY ?? 50
  const oy = oyStart + (oyEnd - oyStart) * p
  return {
    transform: `scale(${scale.toFixed(4)})`,
    transformOrigin: `${ox.toFixed(2)}% ${oy.toFixed(2)}%`,
  }
}

/**
 * Calculates dynamic styles (3-stage lifecycle: Enter, Living, Exit) for individual layers inside a shot
 */
function getLayerComputedStyle(time, layer, shotStart, shotEnd, reduceMotion) {
  const lStart = layer.start ?? shotStart
  const lEnd = layer.end ?? shotEnd
  if (time < lStart || time > lEnd) return null

  const lDuration = Math.max(0.1, lEnd - lStart)
  const p = Math.max(0, Math.min(1, (time - lStart) / lDuration))

  // 1. Determine Enter & Exit configurations
  const enterConfig = typeof layer.enter === 'string' ? { type: layer.enter } : layer.enter || {}
  const exitConfig = typeof layer.exit === 'string' ? { type: layer.exit } : layer.exit || {}
  const livingConfig = typeof layer.living === 'string' ? { type: layer.living } : layer.living || {}

  const enterDuration = enterConfig.duration ?? layer.fadeIn ?? 0.6
  const exitDuration = exitConfig.duration ?? layer.fadeOut ?? 0.6

  const timeFromStart = time - lStart
  const timeFromEnd = lEnd - time

  const isEntering = enterDuration > 0 && timeFromStart < enterDuration
  const isExiting = exitDuration > 0 && timeFromEnd < exitDuration

  const enterP = enterDuration > 0 ? Math.max(0, Math.min(1, timeFromStart / enterDuration)) : 1
  const exitP = exitDuration > 0 ? Math.max(0, Math.min(1, timeFromEnd / exitDuration)) : 1

  // Overall Base Opacity
  let opacity = 1
  if (isEntering) {
    opacity = Math.min(opacity, enterP)
  }
  if (isExiting) {
    opacity = Math.min(opacity, exitP)
  }
  if (layer.opacity != null) {
    opacity *= layer.opacity
  }

  // Visual filters & masks
  const filters = []
  let maskImage = undefined
  let webkitMaskImage = undefined

  // Transforms
  const transforms = []

  // Motion / Camera
  const motion = layer.motion || {}

  // 2. ENTRY TRANSITION EFFECTS
  const enterType = enterConfig.type || (layer.fadeIn != null ? 'fade' : 'none')
  if (isEntering && !reduceMotion) {
    if (enterType === 'ink-bleed' || enterType === 'watercolor') {
      // Liquid ink spreading outward on wet paper
      const spread = (enterP * 120).toFixed(1)
      const edge = (enterP * 120 + 20).toFixed(1)
      maskImage = `radial-gradient(circle at 50% 50%, black ${spread}%, transparent ${edge}%)`
      webkitMaskImage = maskImage
      filters.push(`blur(${((1 - enterP) * 1.5).toFixed(2)}px)`)
      filters.push(`contrast(${(100 + (1 - enterP) * 35).toFixed(0)}%)`)
    } else if (enterType === 'smoke-dissolve' || enterType === 'mist') {
      // Smudged smoky vapor dispersing into clarity
      filters.push(`blur(${((1 - enterP) * 10).toFixed(2)}px)`)
      filters.push(`brightness(${(0.92 + enterP * 0.08).toFixed(2)})`)
      transforms.push(`translateY(${((1 - enterP) * 14).toFixed(1)}px)`)
      transforms.push(`scale(${(0.96 + enterP * 0.04).toFixed(3)})`)
    } else if (enterType === 'sketch-to-ink' || enterType === 'sketch') {
      // Starts as faint pencil trace, then soaks in rich ink color
      const gray = ((1 - enterP) * 100).toFixed(0)
      filters.push(`grayscale(${gray}%)`)
      filters.push(`contrast(${(125 - enterP * 25).toFixed(0)}%)`)
    } else if (enterType === 'glow-reveal' || enterType === 'glow') {
      // Warm diya candlelight bloom
      const glowSize = (Math.sin(enterP * Math.PI) * 16).toFixed(1)
      filters.push(`drop-shadow(0 0 ${glowSize}px rgba(220, 150, 75, 0.85))`)
    } else if (enterType === 'float-up' || enterType === 'slide-up') {
      // Rises smoothly from below into place
      transforms.push(`translateY(${((1 - enterP) * 28).toFixed(1)}px)`)
    }
  }

  // 3. EXIT TRANSITION EFFECTS
  const exitType = exitConfig.type || (layer.fadeOut != null ? 'fade' : 'none')
  if (isExiting && !reduceMotion) {
    if (exitType === 'smoke-evaporate' || exitType === 'mist-fade') {
      // Vaporizes upwards into fine smoke
      filters.push(`blur(${((1 - exitP) * 8).toFixed(2)}px)`)
      transforms.push(`translateY(${(-(1 - exitP) * 16).toFixed(1)}px)`)
      transforms.push(`scale(${(1 + (1 - exitP) * 0.04).toFixed(3)})`)
    } else if (exitType === 'ink-dissolve') {
      // Melts into the paper texture
      filters.push(`blur(${((1 - exitP) * 2.5).toFixed(2)}px)`)
      filters.push(`contrast(${(100 - (1 - exitP) * 30).toFixed(0)}%)`)
    } else if (exitType === 'sink-fade' || exitType === 'float-away') {
      transforms.push(`translateY(${((1 - exitP) * 22).toFixed(1)}px)`)
    }
  }

  // 4. CONTINUOUS LIVING STATE & MOTION
  if (!reduceMotion) {
    // Continuous Scale
    const scaleStart = motion.scaleStart ?? 1.0
    const scaleEnd = motion.scaleEnd ?? 1.0
    const scale = scaleStart + (scaleEnd - scaleStart) * p
    if (scale !== 1.0 && (!isEntering || enterType !== 'smoke-dissolve')) {
      transforms.push(`scale(${scale.toFixed(4)})`)
    }

    // Continuous Translate X & Y
    const xStart = motion.xStart ?? 0
    const xEnd = motion.xEnd ?? 0
    const x = xStart + (xEnd - xStart) * p
    const yStart = motion.yStart ?? 0
    const yEnd = motion.yEnd ?? 0
    const y = yStart + (yEnd - yStart) * p
    if (x !== 0 || y !== 0) {
      transforms.push(`translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`)
    }

    // Living: Float / Breathe (sinusoidal vertical breathing)
    if (motion.float || livingConfig.type === 'float' || livingConfig.type === 'breathe') {
      const floatAmp = livingConfig.amp ?? motion.floatAmp ?? 6
      const floatPeriod = livingConfig.period ?? motion.floatPeriod ?? 4
      const floatY = Math.sin(((time - lStart) / floatPeriod) * Math.PI * 2) * floatAmp
      transforms.push(`translateY(${floatY.toFixed(2)}px)`)
    }

    // Living: Sway (delicate pendulum oscillation for branches, feathers, garments)
    if (livingConfig.type === 'sway' || motion.sway) {
      const swayAmp = livingConfig.amp ?? motion.swayAmp ?? 3.5
      const swayPeriod = livingConfig.period ?? motion.swayPeriod ?? 4.5
      const swayDeg = Math.sin(((time - lStart) / swayPeriod) * Math.PI * 2) * swayAmp
      transforms.push(`rotate(${swayDeg.toFixed(2)}deg)`)
    }

    // Living: Flicker (gentle light / flame luminescence variance for diya / reflections)
    if (livingConfig.type === 'flicker' || motion.flicker) {
      const flickerVal = (1 + (Math.sin(time * 14) + Math.cos(time * 22)) * 0.04).toFixed(3)
      filters.push(`brightness(${flickerVal})`)
    }

    // Continuous Rotation
    const rotStart = motion.rotStart ?? 0
    const rotEnd = motion.rotEnd ?? 0
    const rot = rotStart + (rotEnd - rotStart) * p
    if (rot !== 0 && livingConfig.type !== 'sway') {
      transforms.push(`rotate(${rot.toFixed(2)}deg)`)
    }
  }

  // Positioning
  const pos = layer.position || {}
  const style = {
    position: 'absolute',
    opacity: Math.max(0, Math.min(1, opacity)),
    zIndex: layer.zIndex ?? 2,
    mixBlendMode: layer.blend || 'normal',
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: motion.origin || '50% 50%',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    maskImage,
    WebkitMaskImage: webkitMaskImage,
    pointerEvents: 'none',
  }

  if (pos.left !== undefined) style.left = pos.left
  if (pos.right !== undefined) style.right = pos.right
  if (pos.top !== undefined) style.top = pos.top
  if (pos.bottom !== undefined) style.bottom = pos.bottom
  if (pos.width !== undefined) style.width = pos.width
  if (pos.height !== undefined) style.height = pos.height

  return style
}

// Chroma key green (#00FF00) processor for overlays
function useChromaKeyedImage(src) {
  const [keyedSrc, setKeyedSrc] = useState(null)

  useEffect(() => {
    if (!src) return
    let isCancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      if (isCancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.width, img.height)
      const data = imgData.data

      // Key out green: high green, low red & blue
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (g > 150 && r < 100 && b < 100) {
          data[i + 3] = 0 // transparent
        }
      }
      ctx.putImageData(imgData, 0, 0)
      if (!isCancelled) {
        setKeyedSrc(canvas.toDataURL('image/png'))
      }
    }

    return () => {
      isCancelled = true
    }
  }, [src])

  return keyedSrc
}

// In-memory cache for auto-isolated transparent images
const isolatedImageCache = new Map()

// Automatically detects paper background, strips it cleanly to 100% alpha transparency,
// and boosts ink pigment density so elements look crisp, deep, and without any rectangular bounding box.
function useAutoIsolatedImage(src, isElementLayer = false) {
  const [isolatedSrc, setIsolatedSrc] = useState(() => (src ? isolatedImageCache.get(src) || src : null))

  useEffect(() => {
    if (!src || !isElementLayer) {
      setIsolatedSrc(src)
      return
    }

    if (isolatedImageCache.has(src)) {
      setIsolatedSrc(isolatedImageCache.get(src))
      return
    }

    let isCancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      if (isCancelled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        const imgData = ctx.getImageData(0, 0, img.width, img.height)
        const data = imgData.data

        // Sample corner pixels to determine background paper tint
        let bgR = 245, bgG = 240, bgB = 230
        const corners = [
          0,
          (img.width - 1) * 4,
          (img.height - 1) * img.width * 4,
          ((img.height - 1) * img.width + img.width - 1) * 4,
        ]
        let crSum = 0, cgSum = 0, cbSum = 0
        corners.forEach((idx) => {
          crSum += data[idx]
          cgSum += data[idx + 1]
          cbSum += data[idx + 2]
        })
        bgR = crSum / 4
        bgG = cgSum / 4
        bgB = cbSum / 4

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const lum = 0.299 * r + 0.587 * g + 0.114 * b

          // Distance from sampled background paper color
          const dr = Math.abs(r - bgR)
          const dg = Math.abs(g - bgG)
          const db = Math.abs(b - bgB)
          const bgDist = Math.max(dr, dg, db)

          // If pixel is background paper or very light parchment tint
          if (lum > 220 || (lum > 200 && bgDist < 30)) {
            // Feather edge transparency
            if (lum > 238 || bgDist < 18) {
              data[i + 3] = 0 // completely transparent
            } else {
              const alphaRatio = (238 - lum) / 38
              data[i + 3] = Math.max(0, Math.min(255, alphaRatio * 255))
            }
          } else {
            // Boost pigment richness for ink and colors so element looks deep and rich
            const darken = 0.88
            data[i] = Math.max(0, Math.min(255, r * darken))
            data[i + 1] = Math.max(0, Math.min(255, g * darken))
            data[i + 2] = Math.max(0, Math.min(255, b * darken))
          }
        }

        ctx.putImageData(imgData, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        isolatedImageCache.set(src, dataUrl)
        if (!isCancelled) {
          setIsolatedSrc(dataUrl)
        }
      } catch {
        // Fallback to original
        if (!isCancelled) setIsolatedSrc(src)
      }
    }

    return () => {
      isCancelled = true
    }
  }, [src, isElementLayer])

  return isolatedSrc
}

function ElementLayerImage({ layer }) {
  // Isolate image if it has removeBg or by default for element/cast layers
  const isElement = layer.removeBg !== false
  const imgSrc = useAutoIsolatedImage(layer.src, isElement)

  return (
    <img
      src={imgSrc || layer.src}
      alt={layer.id || ''}
      style={{
        width: '100%',
        height: '100%',
        objectFit: layer.fit || 'contain',
        display: 'block',
      }}
      onError={(e) => {
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

export default function Stage() {
  const audioRef = useRef(null)
  const frameRef = useRef(null)
  const { time, playing, play, pause, seek, replay } = useClock(TOTAL_DURATION, audioRef)
  const reduceMotion = usePrefersReducedMotion()
  const [controlsVisible, setControlsVisible] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const hideTimerRef = useRef(null)

  // Chroma keyed overlays
  const rainKeyedSrc = useChromaKeyedImage('/assets/paper/ov_rain.png')
  const tearKeyedSrc = useChromaKeyedImage('/assets/paper/ov_tear.png')

  // Initialize audio and preload images
  useEffect(() => {
    const audio = new Audio('/song/aaye%20na%20sawariya.mp3')
    audio.preload = 'auto'
    audioRef.current = audio

    // Preload paper images
    shots.forEach((shot) => {
      const img = new Image()
      img.src = shot.src
    })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // Auto-hide controls during playback
  const resetControlsTimeout = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (playing) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false)
      }, 2400)
    }
  }, [playing])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      resetControlsTimeout()
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [playing, resetControlsTimeout])

  // Handle play gesture
  const handlePlayToggle = useCallback(() => {
    setHasStarted(true)
    if (playing) {
      pause()
    } else {
      play()
    }
  }, [playing, pause, play])

  // Spacebar toggle (ignore if button/input is focused)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        const tag = e.target.tagName.toLowerCase()
        if (tag === 'button' || tag === 'input' || tag === 'textarea') return
        e.preventDefault()
        handlePlayToggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlePlayToggle])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (frameRef.current?.requestFullscreen) {
        frameRef.current.requestFullscreen().catch(() => {})
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  // Currently active shots (plates that have opacity > 0)
  // For the first ~9.8s, the Goverdhan intro & cinematic titles take center stage,
  // then smoothly hands over to shot s03 (Radha Krishna separation & Sanskrit shloka)
  const activeShots = useMemo(() => {
    return shots
      .map((shot, index) => {
        let opacity = getPlateOpacity(time, shot, index, shots)
        if (time < 10.5 && shot.id !== 's03') {
          // Keep other initial shots hidden during intro
          opacity = 0
        } else if (shot.id === 's03') {
          // s03 smoothly emerges around 9.6s - 10.0s as Goverdhan dissolves
          if (time < 9.6) opacity = 0
          else if (time < 10.2) opacity *= (time - 9.6) / 0.6
        }
        return { shot, index, opacity }
      })
      .filter((item) => item.opacity > 0.005)
  }, [time])

  // Currently active lyric line
  const activeLine = useMemo(() => {
    return lyricLines.find((line) => time >= line.start && time < line.end) || null
  }, [time])

  // Currently active intro credit
  const activeCredits = useMemo(() => {
    return credits.filter((c) => time >= c.start && time < c.end)
  }, [time])

  // Rain overlay opacity (183.8 to 224.0)
  const rainOpacity = useMemo(() => {
    if (time < 183.8 || time > 224.0) return 0
    let op = 0.52 // max opacity <= 0.55
    if (time < 185.0) {
      op = op * ((time - 183.8) / 1.2)
    } else if (time > 222.5) {
      op = op * ((224.0 - time) / 1.5)
    }
    return Math.max(0, Math.min(0.55, op))
  }, [time])

  // Tear overlay progress (250.0 to 254.0)
  const tearState = useMemo(() => {
    if (time < 250.0 || time > 254.0) return null
    const p = (time - 250.0) / 4.0
    const translateY = p * 120 // falls down
    const opacity = p < 0.1 ? p / 0.1 : p > 0.85 ? (1 - p) / 0.15 : 1
    return { translateY, opacity }
  }, [time])

  // Goverdhan Parvat Sunrise Intro Scene & Cinematic Title Sequence (0.0s to 10.2s)
  const introScene = useMemo(() => {
    if (time > 10.2) return null

    // Overall intro container opacity (smooth fade out between 9.2s and 10.0s into Radha Krishna scene)
    let containerOpacity = 1.0
    if (time > 9.2) {
      containerOpacity = Math.max(0, (10.0 - time) / 0.8)
    }

    // 1. Goverdhan Parvat: visible right from 0s, gently pans/settles
    // 2. Sun: starts rising from 3.0s onwards till 6.5s from behind the Parvat
    let sunProgress = 0
    let sunOpacity = 0
    if (time >= 3.0) {
      sunProgress = Math.min(1.0, (time - 3.0) / 3.5) // 0 to 1 between 3s and 6.5s
      sunOpacity = Math.min(1.0, (time - 3.0) / 0.8) // fades in smoothly over 0.8s
    }
    // Sun position: rises from behind the ridge (from 60% down to 18% from top)
    const sunTopPercent = 60 - sunProgress * 42

    // 3. Birds: timing increased! Start soaring at 5.0s and fly gracefully through 9.8s
    let birdsProgress = 0
    let birdsOpacity = 0
    if (time >= 5.0) {
      birdsProgress = Math.min(1.0, (time - 5.0) / 4.5) // 5.0s to 9.5s
      birdsOpacity = Math.min(1.0, (time - 5.0) / 0.8) // smooth fade in
      if (time > 9.0) {
        birdsOpacity = Math.max(0, (9.8 - time) / 0.8)
      }
    }
    // Birds glide gracefully across from left to right and upward across the whole sky
    const birdsTranslateX = (birdsProgress - 0.25) * 65 // wide cinematic traverse
    const birdsTranslateY = -(birdsProgress * 22)

    // 4. Cinematic Title Animation: "Goverdhan Divine Scape" & "Presents"
    // Starts right from 0.0s with elegant zoom, golden glow, and letter-spacing expansion
    let titleOpacity = 0
    let titleScale = 1.0
    let titleLetterSpacing = 0.12 // in em
    let presentsOpacity = 0
    let presentsTranslateY = 10 // in px

    if (time < 5.8) {
      // Goverdhan Divine Scape appears smoothly from 0.2s to 5.2s
      if (time < 0.3) {
        titleOpacity = time / 0.3
      } else if (time < 4.4) {
        titleOpacity = 1.0
      } else {
        titleOpacity = Math.max(0, (5.4 - time) / 1.0) // smooth dissolve
      }
      // Slow cinematic zoom & expansion
      titleScale = 0.94 + Math.min(1, time / 5.0) * 0.09
      titleLetterSpacing = 0.08 + Math.min(1, time / 5.0) * 0.08
    }

    if (time >= 3.2 && time < 7.8) {
      // "Presents" text emerges underneath with subtle upward float & elegance
      if (time < 4.2) {
        const p = (time - 3.2) / 1.0
        presentsOpacity = p
        presentsTranslateY = (1 - p) * 12
      } else if (time < 6.8) {
        presentsOpacity = 1.0
        presentsTranslateY = 0
      } else {
        presentsOpacity = Math.max(0, (7.8 - time) / 1.0)
      }
    }

    return {
      containerOpacity,
      sunTopPercent,
      sunOpacity,
      sunProgress,
      birdsOpacity,
      birdsTranslateX,
      birdsTranslateY,
      titleOpacity,
      titleScale,
      titleLetterSpacing,
      presentsOpacity,
      presentsTranslateY,
    }
  }, [time])

  return (
    <div
      className="stage-viewport"
      onPointerMove={resetControlsTimeout}
    >
      <div
        ref={frameRef}
        className="stage-frame"
        onClick={(e) => {
          // Frame click toggles play if not clicking controls
          if (e.target.closest('.controls-bar')) return
          handlePlayToggle()
        }}
      >
        {/* Layer 0 / Intro Scene: Goverdhan Parvat, Rising Sun, and Birds (0s to 10s) */}
        {introScene && introScene.containerOpacity > 0 && (
          <div
            className="intro-goverdhan-scene"
            style={{ opacity: introScene.containerOpacity }}
          >
            {/* 1. Dawn Sky Background */}
            <img
              className="intro-sky-bg"
              src="/assets/paper/bg_dawn_paper_sky.png"
              alt="Dawn sky"
            />

            {/* 2. Rising Sun (behind Goverdhan Parvat) */}
            {introScene.sunOpacity > 0 && (
              <div
                className="intro-sun-wrapper"
                style={{
                  top: `${introScene.sunTopPercent}%`,
                  opacity: introScene.sunOpacity,
                  transform: `translateX(-50%) scale(${1 + introScene.sunProgress * 0.1})`,
                }}
              >
                <img
                  className="intro-sun-img"
                  src="/assets/paper/el_rising_sun.png"
                  alt="Rising sun"
                />
              </div>
            )}

            {/* 3. Goverdhan Parvat (in front of Sun, masking its base) */}
            <div className="intro-parvat-wrapper">
              <img
                className="intro-parvat-img"
                src="/assets/paper/el_goverdhan_parvat.png"
                alt="Goverdhan Parvat"
              />
            </div>

            {/* 4. Flying Birds (in front of sky & mountain, soaring across from 5s to 12s) */}
            {introScene.birdsOpacity > 0 && (
              <div
                className="intro-birds-wrapper"
                style={{
                  opacity: introScene.birdsOpacity,
                  transform: `translate(${introScene.birdsTranslateX}%, ${introScene.birdsTranslateY}%)`,
                }}
              >
                <img
                  className="intro-birds-img"
                  src="/assets/paper/el_flying_birds.png"
                  alt="Flying birds"
                />
              </div>
            )}

            {/* 5. Cinematic Intro Typography: "Goverdhan Divine Scape" & "Presents" */}
            <div className="intro-cinematic-titles">
              {introScene.titleOpacity > 0 && (
                <div
                  className="cinematic-title-goverdhan"
                  style={{
                    opacity: introScene.titleOpacity,
                    transform: `translate(-50%, -50%) scale(${introScene.titleScale})`,
                    letterSpacing: `${introScene.titleLetterSpacing}em`,
                  }}
                >
                  Goverdhan Divine Scape
                </div>
              )}

              {introScene.presentsOpacity > 0 && (
                <div
                  className="cinematic-subtitle-presents"
                  style={{
                    opacity: introScene.presentsOpacity,
                    transform: `translate(-50%, ${introScene.presentsTranslateY}px)`,
                  }}
                >
                  Presents
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layer 1: Plates (Paint in DOM order, z-index: 1) */}
        <div className="plates-container">
          {activeShots.map(({ shot, opacity }) => {
            const cameraStyle = getCameraTransform(time, shot, reduceMotion)
            const bgSrc = shot.background?.src || shot.src
            const bgFile = shot.background?.file || shot.file

            return (
              <div
                key={shot.id}
                className="plate-layer"
                style={{
                  opacity,
                  transform: cameraStyle.transform,
                  transformOrigin: cameraStyle.transformOrigin,
                }}
              >
                {/* Main Plate / Background Image */}
                {bgSrc && (
                  <img
                    className="plate-img"
                    src={bgSrc}
                    alt={bgFile}
                    onError={(e) => {
                      // Missing images hide gracefully, showing paper background
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}

                {/* Additional Cast & Element Layers configured in timeline.js */}
                {Array.isArray(shot.layers) &&
                  shot.layers.map((layer, lIdx) => {
                    const layerStyle = getLayerComputedStyle(
                      time,
                      layer,
                      shot.start,
                      shot.end,
                      reduceMotion,
                    )
                    if (!layerStyle) return null

                    return (
                      <div
                        key={layer.id || `layer-${shot.id}-${lIdx}`}
                        className={`scene-cast-element ${layer.className || ''}`}
                        style={layerStyle}
                      >
                        <ElementLayerImage layer={layer} />
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </div>

        {/* Layer 2: Overlays (Rain & Tear, z-index: 2) */}
        <div className="overlay-layer">
          {rainOpacity > 0 && rainKeyedSrc && (
            <img
              className="rain-overlay"
              src={rainKeyedSrc}
              alt="rain"
              style={{ opacity: rainOpacity }}
            />
          )}

          {tearState && tearKeyedSrc && (
            <img
              className="tear-overlay"
              src={tearKeyedSrc}
              alt="tear"
              style={{
                opacity: tearState.opacity,
                transform: `translateY(${tearState.translateY}%)`,
              }}
            />
          )}
        </div>

        {/* Layer 3: Type & Credits (z-index: 3) */}
        <div className="type-layer">
          {/* Intro credits */}
          {activeCredits.map((c) => {
            if (c.isCredit) {
              return (
                <div key={c.id} className="credit-item credit-presentation">
                  {c.text}
                </div>
              )
            }
            if (c.isTitle) {
              return (
                <div key={c.id} className="credit-item credit-title">
                  {c.text}
                </div>
              )
            }
            if (c.isSubtitle) {
              return (
                <div key={c.id} className="credit-item credit-subtitle">
                  {c.text}
                </div>
              )
            }
            if (c.isPoet) {
              return (
                <div key={c.id} className="credit-item credit-poet">
                  <span>रचना</span>
                  {c.text}
                </div>
              )
            }
            if (c.isShloka) {
              return (
                <div key={c.id} className="credit-item credit-shloka">
                  <div className="shloka-text">
                    {c.text.split('\n').map((line, idx) => (
                      <span key={idx} className="shloka-line">
                        {line}
                      </span>
                    ))}
                  </div>
                  {c.subtext && <div className="shloka-subtext">{c.subtext}</div>}
                </div>
              )
            }
            return null
          })}

          {/* Active sung lyric line with hand-drawn ink reveal */}
          {activeLine && (
            <div className={`lyric-line-wrapper anchor-${activeLine.anchor}`}>
              {activeLine.words.map((w, idx) => {
                const nextWord = activeLine.words[idx + 1]
                const wordStart = w.time
                const wordEnd = nextWord ? nextWord.time : activeLine.end
                const wordDuration = Math.max(0.3, wordEnd - wordStart)

                const isCurrent = time >= wordStart && time < wordEnd
                const isSung = time >= wordEnd
                const isUnsung = time < wordStart

                // Dynamic handwriting draw progress from 0% to 100%
                let drawProgress = 0
                if (isSung) {
                  drawProgress = 1
                } else if (isCurrent) {
                  drawProgress = Math.min(1, Math.max(0, (time - wordStart) / wordDuration))
                }

                const statusClass = isCurrent ? 'current' : isSung ? 'sung' : 'unsung'
                const pct = (drawProgress * 100).toFixed(1)

                return (
                  <span
                    key={`${activeLine.id}-${idx}-${w.text}`}
                    className={`lyric-word-container ${statusClass}`}
                    style={{
                      '--draw-pct': `${pct}%`,
                    }}
                  >
                    {/* Faint pencil guideline before ink is drawn */}
                    <span className="lyric-word-faint">{w.text}</span>

                    {/* Freshly penned ink layer revealed left-to-right as sung */}
                    <span
                      className="lyric-word-ink"
                      style={{
                        clipPath: isSung ? 'none' : isCurrent ? `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)` : 'polygon(0 0, 0 0, 0 100%, 0 100%)',
                      }}
                    >
                      {w.text}
                    </span>

                    {/* Active pen nib / ink droplet glint at the writing edge */}
                    {isCurrent && drawProgress > 0.02 && drawProgress < 0.98 && (
                      <span
                        className="pen-nib-nib"
                        style={{
                          left: `${pct}%`,
                        }}
                      />
                    )}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Initial First-Gesture Play Prompt */}
        {!hasStarted && !playing && (
          <div className="play-prompt-backdrop" onClick={handlePlayToggle}>
            <button className="play-prompt-button" type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>चलाएँ</span>
            </button>
            <div className="play-prompt-sub">क्लिक करें या स्पेस दबाएँ</div>
          </div>
        )}

        {/* Controls Bar */}
        <div className={`controls-bar ${controlsVisible ? '' : 'hidden'}`}>
          <div className="progress-track-wrapper">
            <input
              type="range"
              className="progress-slider"
              min={0}
              max={TOTAL_DURATION}
              step={0.1}
              value={time}
              onChange={(e) => {
                seek(parseFloat(e.target.value))
              }}
            />
          </div>

          <div className="controls-row">
            <div className="controls-left">
              <button
                className="control-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayToggle()
                }}
              >
                {playing ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>रोकें</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>चलाएँ</span>
                  </>
                )}
              </button>

              <button
                className="control-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  replay()
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 4v6h6" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                <span>फिर से</span>
              </button>

              <div className="time-display">
                <span>{formatClock(time)}</span>
                <span className="time-sep">/</span>
                <span>{formatClock(TOTAL_DURATION)}</span>
              </div>
            </div>

            <div className="controls-right">
              <button
                className="control-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                title="पूर्ण स्क्रीन"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
