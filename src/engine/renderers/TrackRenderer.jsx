import { useEffect, useState } from 'react'
import { computeKeyframesMotion, computeLinearMotion } from '../motion/interpolate.js'
import { evaluateLivingMotion } from '../motion/livingPresets.js'
import { getLineEnterStyle, getLineExitStyle } from '../registries/lineAnimations.js'
import { resolvePosition } from '../systems/positionResolver.js'

// Chroma key green (#00FF00) processor for overlays
const chromaKeyCache = new Map()

function useChromaKeyedImage(src, enabled = false) {
  const [keyedSrc, setKeyedSrc] = useState(() => (enabled && src ? chromaKeyCache.get(src) || null : src))

  useEffect(() => {
    if (!src || !enabled) {
      setKeyedSrc(src)
      return
    }

    if (chromaKeyCache.has(src)) {
      setKeyedSrc(chromaKeyCache.get(src))
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

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          if (g > 150 && r < 100 && b < 100) {
            data[i + 3] = 0
          }
        }
        ctx.putImageData(imgData, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        chromaKeyCache.set(src, dataUrl)
        if (!isCancelled) setKeyedSrc(dataUrl)
      } catch {
        if (!isCancelled) setKeyedSrc(src)
      }
    }

    return () => {
      isCancelled = true
    }
  }, [src, enabled])

  return keyedSrc
}

function OverlayTrackItem({ track, time, reduceMotion }) {
  const keyedSrc = useChromaKeyedImage(track.src, track.chromaKey === true)
  const duration = Math.max(0.1, track.end - track.start)
  const p = Math.max(0, Math.min(1, (time - track.start) / duration))

  const fadeIn = track.fadeIn ?? 0.5
  const fadeOut = track.fadeOut ?? 0.5
  const timeFromStart = time - track.start
  const timeFromEnd = track.end - time

  let opacity = 1
  if (fadeIn > 0 && timeFromStart < fadeIn) {
    opacity *= timeFromStart / fadeIn
  }
  if (fadeOut > 0 && timeFromEnd < fadeOut) {
    opacity *= timeFromEnd / fadeOut
  }

  const peak = track.opacity?.peak ?? (typeof track.opacity === 'number' ? track.opacity : 1.0)
  opacity *= peak

  const transforms = []
  if (!reduceMotion) {
    if (track.keyframes) {
      const kf = computeKeyframesMotion(track.keyframes, p)
      if (kf) {
        if (kf.x !== 0 || kf.y !== 0) transforms.push(`translate(${kf.x}px, ${kf.y}px)`)
        if (kf.scale !== 1.0) transforms.push(`scale(${kf.scale})`)
      }
    } else if (track.motion) {
      const lm = computeLinearMotion(track.motion, p)
      if (lm.x !== 0 || lm.y !== 0) transforms.push(`translate(${lm.x}px, ${lm.y}px)`)
      if (lm.scale !== 1.0) transforms.push(`scale(${lm.scale})`)
    }
  }

  if (!keyedSrc || opacity <= 0.005) return null

  return (
    <img
      src={keyedSrc}
      alt={track.id}
      className={`track-overlay ${track.className || ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: track.fit || 'cover',
        opacity: Math.max(0, Math.min(1, opacity)),
        mixBlendMode: track.blend || 'normal',
        transform: transforms.length > 0 ? transforms.join(' ') : undefined,
        pointerEvents: 'none',
        zIndex: track.zIndex ?? 3,
      }}
    />
  )
}

function TextTrackItem({ track, time, reduceMotion }) {
  const duration = Math.max(0.1, track.end - track.start)
  const p = Math.max(0, Math.min(1, (time - track.start) / duration))
  const timeFromStart = time - track.start
  const timeFromEnd = track.end - time

  const posStyle = resolvePosition(track.position, 'center')

  const enterConfig = track.enter || { type: 'fade-in', duration: 0.5 }
  const exitConfig = track.exit || { type: 'fade-out', duration: 0.4 }
  const enterDur = enterConfig.duration ?? 0.5
  const exitDur = exitConfig.duration ?? 0.4

  let enterStyle = {}
  if (enterDur > 0 && timeFromStart < enterDur) {
    enterStyle = getLineEnterStyle(enterConfig, timeFromStart / enterDur)
  }

  let exitStyle = {}
  if (exitDur > 0 && timeFromEnd < exitDur) {
    exitStyle = getLineExitStyle(exitConfig, timeFromEnd / exitDur)
  }

  const transforms = []
  if (!reduceMotion) {
    if (track.keyframes) {
      const kf = computeKeyframesMotion(track.keyframes, p)
      if (kf) {
        if (kf.x !== 0 || kf.y !== 0) transforms.push(`translate(${kf.x}px, ${kf.y}px)`)
        if (kf.scale !== 1.0) transforms.push(`scale(${kf.scale})`)
        if (kf.rotation !== 0) transforms.push(`rotate(${kf.rotation}deg)`)
      }
    } else if (track.motion) {
      const lm = computeLinearMotion(track.motion, p)
      if (lm.x !== 0 || lm.y !== 0) transforms.push(`translate(${lm.x}px, ${lm.y}px)`)
      if (lm.scale !== 1.0) transforms.push(`scale(${lm.scale})`)
      if (lm.rotation !== 0) transforms.push(`rotate(${lm.rotation}deg)`)
    }

    if (track.living) {
      const living = evaluateLivingMotion(timeFromStart, track.living)
      if (living.transforms.length > 0) transforms.push(...living.transforms)
    }
  }

  const style = track.style || {}

  return (
    <div
      className={`track-text-element ${track.className || ''}`}
      style={{
        ...posStyle,
        ...enterStyle,
        ...exitStyle,
        transform: [posStyle.transform, enterStyle.transform, exitStyle.transform, ...transforms].filter(Boolean).join(' '),
        zIndex: track.zIndex ?? 15,
        fontSize: style.fontSize,
        color: style.color,
        fontWeight: style.fontWeight,
        letterSpacing: style.letterSpacing,
        textShadow: style.textShadow,
        opacity: style.opacity ?? 1,
        pointerEvents: 'none',
      }}
    >
      {track.text}
    </div>
  )
}

export default function TrackRenderer({ tracks = [], time = 0, reduceMotion = false }) {
  if (!tracks || tracks.length === 0) return null

  return (
    <div className="tracks-container-layer">
      {tracks.map((track) => {
        if (track.type === 'overlay') {
          return <OverlayTrackItem key={track.id} track={track} time={time} reduceMotion={reduceMotion} />
        }
        if (track.type === 'text') {
          return <TextTrackItem key={track.id} track={track} time={time} reduceMotion={reduceMotion} />
        }
        return null
      })}
    </div>
  )
}
