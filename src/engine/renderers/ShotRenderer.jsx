import { useEffect, useState } from 'react'
import { computeKeyframesMotion, computeLinearMotion } from '../motion/interpolate.js'
import { evaluateLivingMotion } from '../motion/livingPresets.js'
import { getTransitionStyle } from '../registries/transitions.js'
import { buildVignetteStyle, resolveEffectsStyle } from '../registries/effects.js'

// In-memory cache for auto-isolated transparent images
const isolatedImageCache = new Map()

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
        const bgR = crSum / 4
        const bgG = cgSum / 4
        const bgB = cbSum / 4

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const lum = 0.299 * r + 0.587 * g + 0.114 * b

          const dr = Math.abs(r - bgR)
          const dg = Math.abs(g - bgG)
          const db = Math.abs(b - bgB)
          const bgDist = Math.max(dr, dg, db)

          if (lum > 220 || (lum > 200 && bgDist < 30)) {
            if (lum > 238 || bgDist < 18) {
              data[i + 3] = 0
            } else {
              const alphaRatio = (238 - lum) / 38
              data[i + 3] = Math.max(0, Math.min(255, alphaRatio * 255))
            }
          } else {
            const darken = 0.88
            data[i] = Math.max(0, Math.min(255, r * darken))
            data[i + 1] = Math.max(0, Math.min(255, g * darken))
            data[i + 2] = Math.max(0, Math.min(255, b * darken))
          }
        }

        ctx.putImageData(imgData, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        isolatedImageCache.set(src, dataUrl)
        if (!isCancelled) setIsolatedSrc(dataUrl)
      } catch {
        if (!isCancelled) setIsolatedSrc(src)
      }
    }

    return () => {
      isCancelled = true
    }
  }, [src, isElementLayer])

  return isolatedSrc
}

function ElementImage({ layer }) {
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

function computeLayerStyle(time, layer, shotStart, shotEnd, reduceMotion) {
  const lStart = layer.start ?? shotStart
  const lEnd = layer.end ?? shotEnd
  if (time < lStart || time > lEnd) return null

  const lDuration = Math.max(0.1, lEnd - lStart)
  const p = Math.max(0, Math.min(1, (time - lStart) / lDuration))

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

  let opacity = 1
  if (isEntering) opacity = Math.min(opacity, enterP)
  if (isExiting) opacity = Math.min(opacity, exitP)
  if (layer.opacity != null) opacity *= layer.opacity

  const filters = []
  const transforms = []
  let maskImage = undefined

  // Enter effects
  const enterType = enterConfig.type || (layer.fadeIn != null ? 'fade' : 'none')
  if (isEntering && !reduceMotion) {
    if (enterType === 'ink-bleed' || enterType === 'watercolor') {
      const spread = (enterP * 120).toFixed(1)
      maskImage = `radial-gradient(circle at 50% 50%, black ${spread}%, transparent ${(enterP * 120 + 20).toFixed(1)}%)`
      filters.push(`blur(${((1 - enterP) * 1.5).toFixed(2)}px)`)
    } else if (enterType === 'smoke-dissolve' || enterType === 'mist') {
      filters.push(`blur(${((1 - enterP) * 10).toFixed(2)}px)`)
      transforms.push(`translateY(${((1 - enterP) * 14).toFixed(1)}px)`)
    } else if (enterType === 'float-up') {
      transforms.push(`translateY(${((1 - enterP) * 28).toFixed(1)}px)`)
    }
  }

  // Exit effects
  const exitType = exitConfig.type || (layer.fadeOut != null ? 'fade' : 'none')
  if (isExiting && !reduceMotion) {
    if (exitType === 'smoke-evaporate' || exitType === 'mist-fade') {
      filters.push(`blur(${((1 - exitP) * 8).toFixed(2)}px)`)
      transforms.push(`translateY(${(-(1 - exitP) * 16).toFixed(1)}px)`)
    } else if (exitType === 'ink-dissolve') {
      filters.push(`blur(${((1 - exitP) * 2.5).toFixed(2)}px)`)
    }
  }

  // Continuous motion: Keyframes OR Linear Motion
  if (!reduceMotion) {
    if (Array.isArray(layer.keyframes) && layer.keyframes.length > 0) {
      const kf = computeKeyframesMotion(layer.keyframes, p)
      if (kf) {
        if (kf.x !== 0 || kf.y !== 0) transforms.push(`translate(${kf.x.toFixed(2)}px, ${kf.y.toFixed(2)}px)`)
        if (kf.scale !== 1.0) transforms.push(`scale(${kf.scale.toFixed(4)})`)
        if (kf.rotation !== 0) transforms.push(`rotate(${kf.rotation.toFixed(2)}deg)`)
        if (kf.opacity != null) opacity *= kf.opacity
      }
    } else if (layer.motion) {
      const lm = computeLinearMotion(layer.motion, p)
      if (lm.x !== 0 || lm.y !== 0) transforms.push(`translate(${lm.x.toFixed(2)}px, ${lm.y.toFixed(2)}px)`)
      if (lm.scale !== 1.0) transforms.push(`scale(${lm.scale.toFixed(4)})`)
      if (lm.rotation !== 0) transforms.push(`rotate(${lm.rotation.toFixed(2)}deg)`)
      if (lm.opacity != null) opacity *= lm.opacity
    }

    // Living micro-motion
    const living = evaluateLivingMotion(time - lStart, livingConfig)
    if (living.transforms.length > 0) transforms.push(...living.transforms)
    if (living.filters.length > 0) filters.push(...living.filters)
  }

  const pos = layer.position || {}
  const style = {
    position: 'absolute',
    opacity: Math.max(0, Math.min(1, opacity)),
    zIndex: layer.zIndex ?? 2,
    mixBlendMode: layer.blend || 'normal',
    transform: transforms.length > 0 ? transforms.join(' ') : undefined,
    transformOrigin: layer.motion?.origin || '50% 50%',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    maskImage,
    WebkitMaskImage: maskImage,
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

export default function ShotRenderer({ activeShots = [], time = 0, reduceMotion = false }) {
  return (
    <div className="plates-container">
      {activeShots.map(({ shot, opacity }) => {
        const cameraStyle = getCameraTransform(time, shot, reduceMotion)
        const transitionStyle = getTransitionStyle(shot, time)
        const effectsStyle = resolveEffectsStyle(shot.effects)
        const vignetteStyle = buildVignetteStyle(shot.effects?.vignette)

        const bgSrc = shot.src || shot.file ? (shot.src || `/assets/paper/${shot.file}`) : null

        return (
          <div
            key={shot.id}
            className="plate-layer"
            style={{
              opacity,
              transform: cameraStyle.transform,
              transformOrigin: cameraStyle.transformOrigin,
              ...transitionStyle,
              ...effectsStyle,
            }}
          >
            {/* Background Plate */}
            {bgSrc && (
              <img
                className="plate-img"
                src={bgSrc}
                alt={shot.file || shot.id}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}

            {/* Vignette Overlay */}
            {vignetteStyle && <div className="shot-vignette-overlay" style={vignetteStyle} />}

            {/* Multi-Layer Cast Elements */}
            {Array.isArray(shot.layers) &&
              shot.layers.map((layer, lIdx) => {
                const layerStyle = computeLayerStyle(time, layer, shot.start, shot.end, reduceMotion)
                if (!layerStyle) return null
                return (
                  <div
                    key={layer.id || `layer-${shot.id}-${lIdx}`}
                    className={`scene-cast-element ${layer.className || ''}`}
                    style={layerStyle}
                  >
                    <ElementImage layer={layer} />
                  </div>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}
