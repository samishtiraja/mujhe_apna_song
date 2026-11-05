import { useCallback, useEffect, useRef, useState } from 'react'

function placeMedia(media, seconds) {
  if (!media) return
  const apply = () => {
    try {
      if (Math.abs(media.currentTime - seconds) > 0.03) {
        media.currentTime = seconds
      }
    } catch {
      // ignore seek errors before ready
    }
  }
  if (media.readyState >= 1) apply()
  else media.addEventListener('loadedmetadata', apply, { once: true })
}

export function useClock(duration, mediaRef) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timeRef = useRef(0)
  const playingRef = useRef(false)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const durationRef = useRef(duration)
  const frameRef = useRef(null)
  const seekLockRef = useRef(false)

  useEffect(() => {
    durationRef.current = duration

    function frame(now) {
      if (!playingRef.current) return
      const media = mediaRef?.current

      if (seekLockRef.current) {
        if (!media || Math.abs(media.currentTime - timeRef.current) < 0.08) {
          seekLockRef.current = false
        } else {
          rafRef.current = requestAnimationFrame(frame)
          return
        }
      }

      let next
      if (media && !media.error && media.readyState >= 1 && !media.paused && !media.seeking) {
        next = media.currentTime
      } else if (!media || media.error || media.paused) {
        if (!lastRef.current) lastRef.current = now
        next = timeRef.current + (now - lastRef.current) / 1000
      } else {
        next = timeRef.current
      }

      lastRef.current = now
      next = Math.min(durationRef.current, Math.max(0, next))
      timeRef.current = next
      setTime(next)

      if (next >= durationRef.current - 0.001) {
        playingRef.current = false
        setPlaying(false)
        if (media && !media.paused) media.pause()
        return
      }
      rafRef.current = requestAnimationFrame(frame)
    }

    frameRef.current = frame
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration, mediaRef])

  // Headless frame-by-frame export hook
  useEffect(() => {
    window.__SET_TIMELINE_TIME__ = (t) => {
      timeRef.current = t
      setTime(t)
    }
    return () => {
      delete window.__SET_TIMELINE_TIME__
    }
  }, [])

  const play = useCallback(() => {
    const media = mediaRef?.current
    if (timeRef.current >= durationRef.current - 0.001) {
      timeRef.current = 0
      setTime(0)
      seekLockRef.current = true
      placeMedia(media, 0)
    } else {
      placeMedia(media, timeRef.current)
    }
    playingRef.current = true
    setPlaying(true)
    lastRef.current = 0
    cancelAnimationFrame(rafRef.current)
    if (frameRef.current) {
      rafRef.current = requestAnimationFrame(frameRef.current)
    }
    if (media) {
      const pending = media.play()
      if (pending && typeof pending.catch === 'function') {
        pending.catch(() => {})
      }
    }
  }, [mediaRef])

  const pause = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    cancelAnimationFrame(rafRef.current)
    const media = mediaRef?.current
    if (media && !media.paused) media.pause()
  }, [mediaRef])

  const seek = useCallback((value) => {
    const next = Math.min(durationRef.current, Math.max(0, value))
    timeRef.current = next
    setTime(next)
    lastRef.current = 0
    const media = mediaRef?.current
    seekLockRef.current = Boolean(media && media.readyState >= 1)
    placeMedia(media, next)
  }, [mediaRef])

  const replay = useCallback(() => {
    seek(0)
    play()
  }, [seek, play])

  return { time, playing, play, pause, seek, replay }
}

export function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = (e) => setReduceMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduceMotion
}
