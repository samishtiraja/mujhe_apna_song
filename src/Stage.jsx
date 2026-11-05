import { useCallback, useEffect, useRef, useState } from 'react'
import { songScript } from './timeline.js'
import { useClock, usePrefersReducedMotion } from './useClock.js'
import { resolveTimelineState } from './engine/systems/timelineResolver.js'
import ShotRenderer from './engine/renderers/ShotRenderer.jsx'
import TrackRenderer from './engine/renderers/TrackRenderer.jsx'
import ParticleCanvas from './engine/renderers/ParticleCanvas.jsx'
import LyricRenderer from './engine/renderers/LyricRenderer.jsx'
import CreditRenderer from './engine/renderers/CreditRenderer.jsx'
import SectionMarkers from './engine/renderers/SectionMarkers.jsx'
import './Stage.css'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Stage() {
  const audioRef = useRef(null)
  const frameRef = useRef(null)
  const totalDuration = songScript.meta?.duration || 289.0
  const { time, playing, play, pause, seek, replay } = useClock(totalDuration, audioRef)
  const reduceMotion = usePrefersReducedMotion()
  const [controlsVisible, setControlsVisible] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const hideTimerRef = useRef(null)

  // Initialize dynamic audio from songScript metadata and preload shots
  useEffect(() => {
    const audioSrc = songScript.meta?.audio || '/song/aaye%20na%20sawariya.mp3'
    const audio = new Audio(audioSrc)
    audio.preload = 'auto'
    audioRef.current = audio

    // Preload shots
    if (Array.isArray(songScript.shots)) {
      songScript.shots.forEach((shot) => {
        if (shot.src) {
          const img = new Image()
          img.src = shot.src
        }
      })
    }

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // Auto-hide playback controls
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

  const handlePlayToggle = useCallback(() => {
    setHasStarted(true)
    if (playing) {
      pause()
    } else {
      play()
    }
  }, [playing, pause, play])

  // Spacebar toggle
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

  // Resolve timeline state at current timestamp
  const { activeShots, activeLyric, activeCredits, activeTracks, currentSection } = resolveTimelineState(
    time,
    songScript
  )

  const isExportMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('export') === '1' ||
    window.__EXPORT_MODE__ === true
  )

  return (
    <div className={`stage-viewport ${isExportMode ? 'export-mode' : ''}`} onPointerMove={resetControlsTimeout}>
      <div
        ref={frameRef}
        className="stage-frame"
        onClick={(e) => {
          if (e.target.closest('.controls-bar')) return
          handlePlayToggle()
        }}
      >
        {/* Layer 1: Plates, Transitions, Camera, and Cast Elements */}
        <ShotRenderer activeShots={activeShots} time={time} reduceMotion={reduceMotion} />

        {/* Layer 2: Independent Overlays and Floating Text Tracks */}
        <TrackRenderer tracks={activeTracks} time={time} reduceMotion={reduceMotion} />

        {/* Layer 3: Dynamic 2D Canvas Particle Engine (Multi-Track) */}
        <ParticleCanvas tracks={activeTracks} time={time} />

        {/* Layer 4: Typography (Credits & Kinetic Lyrics with Universal Positioning) */}
        <div className="type-layer">
          <CreditRenderer activeCredits={activeCredits} time={time} reduceMotion={reduceMotion} />
          <LyricRenderer activeLine={activeLyric} time={time} reduceMotion={reduceMotion} />
        </div>

        {/* Play Prompt on First Load */}
        {!isExportMode && !hasStarted && !playing && (
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

        {/* Floating Active Section Badge */}
        {!isExportMode && currentSection && (
          <div className="current-section-badge" style={{ '--badge-color': currentSection.color || '#8c2f2f' }}>
            {currentSection.label}
          </div>
        )}

        {/* Scrubbing & Controls Bar */}
        {!isExportMode && (
          <div className={`controls-bar ${controlsVisible ? '' : 'hidden'}`}>
          <div className="progress-track-wrapper">
            {/* Interactive Section Markers on Progress Bar */}
            <SectionMarkers
              sections={songScript.sections}
              totalDuration={totalDuration}
              currentTime={time}
              onSeek={seek}
            />

            <input
              type="range"
              className="progress-slider"
              min={0}
              max={totalDuration}
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
                <span>{formatClock(totalDuration)}</span>
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
        )}
      </div>
    </div>
  )
}
