import { computeKeyframesMotion, computeLinearMotion } from '../motion/interpolate.js'
import { evaluateLivingMotion } from '../motion/livingPresets.js'
import { getLineEnterStyle, getLineExitStyle } from '../registries/lineAnimations.js'
import { getWordRevealStyle } from '../registries/wordReveals.js'
import { resolvePosition } from '../systems/positionResolver.js'

export default function LyricRenderer({ activeLine, time = 0, reduceMotion = false }) {
  if (!activeLine) return null

  const lDuration = Math.max(0.1, activeLine.end - activeLine.start)
  const lineProgress = Math.max(0, Math.min(1, (time - activeLine.start) / lDuration))

  // 1. Position Resolution
  const posStyle = resolvePosition(activeLine.position, activeLine.anchor || 'left')

  // 2. Line Enter / Exit Animations
  const enterConfig = activeLine.enter || { type: 'ink-reveal', duration: 0.4 }
  const exitConfig = activeLine.exit || { type: 'fade-out', duration: 0.3 }
  const enterDur = enterConfig.duration ?? 0.4
  const exitDur = exitConfig.duration ?? 0.3

  const timeFromStart = time - activeLine.start
  const timeFromEnd = activeLine.end - time

  let enterStyle = {}
  if (enterDur > 0 && timeFromStart < enterDur) {
    const enterP = Math.max(0, Math.min(1, timeFromStart / enterDur))
    enterStyle = getLineEnterStyle(enterConfig, enterP)
  }

  let exitStyle = {}
  if (exitDur > 0 && timeFromEnd < exitDur) {
    const exitP = Math.max(0, Math.min(1, timeFromEnd / exitDur))
    exitStyle = getLineExitStyle(exitConfig, exitP)
  }

  // 3. Line Motion & Living Dynamics
  const transforms = []
  if (!reduceMotion) {
    if (Array.isArray(activeLine.keyframes) && activeLine.keyframes.length > 0) {
      const kf = computeKeyframesMotion(activeLine.keyframes, lineProgress)
      if (kf) {
        if (kf.x !== 0 || kf.y !== 0) transforms.push(`translate(${kf.x}px, ${kf.y}px)`)
        if (kf.scale !== 1.0) transforms.push(`scale(${kf.scale})`)
        if (kf.rotation !== 0) transforms.push(`rotate(${kf.rotation}deg)`)
      }
    } else if (activeLine.motion) {
      const lm = computeLinearMotion(activeLine.motion, lineProgress)
      if (lm.x !== 0 || lm.y !== 0) transforms.push(`translate(${lm.x}px, ${lm.y}px)`)
      if (lm.scale !== 1.0) transforms.push(`scale(${lm.scale})`)
      if (lm.rotation !== 0) transforms.push(`rotate(${lm.rotation}deg)`)
    }

    if (activeLine.living) {
      const living = evaluateLivingMotion(timeFromStart, activeLine.living)
      if (living.transforms.length > 0) transforms.push(...living.transforms)
    }
  }

  // 4. Per-line Custom Typography Styles
  const lineStyle = activeLine.style || {}
  const wordRevealType = activeLine.wordReveal?.type || 'ink-draw'

  const containerStyle = {
    ...posStyle,
    ...enterStyle,
    ...exitStyle,
    transform: [posStyle.transform, enterStyle.transform, exitStyle.transform, ...transforms].filter(Boolean).join(' '),
    fontSize: lineStyle.fontSize || undefined,
    color: lineStyle.color || undefined,
    fontWeight: lineStyle.fontWeight || undefined,
    letterSpacing: lineStyle.letterSpacing || undefined,
    textShadow: lineStyle.textShadow || undefined,
  }

  return (
    <div className={`lyric-line-wrapper dynamic-lyric-line`} style={containerStyle}>
      {activeLine.words.map((w, idx) => {
        const nextWord = activeLine.words[idx + 1]
        const wordStart = w.time
        const wordEnd = nextWord ? nextWord.time : activeLine.end
        const wordDuration = Math.max(0.2, wordEnd - wordStart)

        const isCurrent = time >= wordStart && time < wordEnd
        const isSung = time >= wordEnd
        const isUnsung = time < wordStart

        let drawProgress = 0
        if (isSung) drawProgress = 1
        else if (isCurrent) drawProgress = Math.min(1, Math.max(0, (time - wordStart) / wordDuration))

        const revealStyle = getWordRevealStyle(wordRevealType, drawProgress, isCurrent, isSung)
        const pct = (drawProgress * 100).toFixed(1)
        const statusClass = isCurrent ? 'current' : isSung ? 'sung' : 'unsung'

        return (
          <span
            key={`${activeLine.id}-${idx}-${w.text}`}
            className={`lyric-word-container ${statusClass} word-style-${wordRevealType}`}
            style={{
              '--draw-pct': `${pct}%`,
              ...revealStyle,
            }}
          >
            {/* Faint Guide text */}
            <span className="lyric-word-faint" style={{ color: lineStyle.guideColor }}>
              {w.text}
            </span>

            {/* Revealed Ink Layer */}
            <span
              className="lyric-word-ink"
              style={{
                color: isCurrent ? (lineStyle.activeColor || '#8c2f2f') : isSung ? (lineStyle.sungColor || '#4d3728') : undefined,
                clipPath: revealStyle.clipPath,
                WebkitClipPath: revealStyle.clipPath,
              }}
            >
              {w.text}
            </span>

            {/* Optional Calligraphy Pen Nib */}
            {revealStyle.showNib && (
              <span
                className="pen-nib-nib"
                style={{
                  left: revealStyle.nibLeft,
                }}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}
