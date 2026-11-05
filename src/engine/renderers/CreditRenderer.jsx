import { computeKeyframesMotion, computeLinearMotion } from '../motion/interpolate.js'
import { evaluateLivingMotion } from '../motion/livingPresets.js'
import { getLineEnterStyle, getLineExitStyle } from '../registries/lineAnimations.js'
import { resolvePosition } from '../systems/positionResolver.js'

function CreditItem({ credit, time, reduceMotion }) {
  const duration = Math.max(0.1, credit.end - credit.start)
  const p = Math.max(0, Math.min(1, (time - credit.start) / duration))
  const timeFromStart = time - credit.start
  const timeFromEnd = credit.end - time

  const posStyle = resolvePosition(credit.position, credit.anchor || 'center')

  const enterConfig = credit.enter || { type: 'fade-in', duration: 0.6 }
  const exitConfig = credit.exit || { type: 'fade-out', duration: 0.5 }
  const enterDur = enterConfig.duration ?? 0.6
  const exitDur = exitConfig.duration ?? 0.5

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
    if (credit.keyframes) {
      const kf = computeKeyframesMotion(credit.keyframes, p)
      if (kf) {
        if (kf.x !== 0 || kf.y !== 0) transforms.push(`translate(${kf.x}px, ${kf.y}px)`)
        if (kf.scale !== 1.0) transforms.push(`scale(${kf.scale})`)
        if (kf.rotation !== 0) transforms.push(`rotate(${kf.rotation}deg)`)
      }
    } else if (credit.motion) {
      const lm = computeLinearMotion(credit.motion, p)
      if (lm.x !== 0 || lm.y !== 0) transforms.push(`translate(${lm.x}px, ${lm.y}px)`)
      if (lm.scale !== 1.0) transforms.push(`scale(${lm.scale})`)
      if (lm.rotation !== 0) transforms.push(`rotate(${lm.rotation}deg)`)
    }

    if (credit.living) {
      const living = evaluateLivingMotion(timeFromStart, credit.living)
      if (living.transforms.length > 0) transforms.push(...living.transforms)
    }
  }

  const style = credit.style || {}

  let creditTypeClass = 'credit-presentation'
  if (credit.isTitle || credit.type === 'title') creditTypeClass = 'credit-title'
  else if (credit.isSubtitle || credit.type === 'subtitle') creditTypeClass = 'credit-subtitle'
  else if (credit.isPoet || credit.type === 'poet') creditTypeClass = 'credit-poet'
  else if (credit.isShloka || credit.type === 'shloka') creditTypeClass = 'credit-shloka'

  return (
    <div
      className={`credit-item ${creditTypeClass} ${credit.className || ''}`}
      style={{
        ...posStyle,
        ...enterStyle,
        ...exitStyle,
        transform: [posStyle.transform, enterStyle.transform, exitStyle.transform, ...transforms].filter(Boolean).join(' '),
        fontSize: style.fontSize,
        color: style.color,
        letterSpacing: style.letterSpacing,
        textShadow: style.textShadow,
      }}
    >
      {credit.isPoet ? (
        <>
          <span>रचना</span>
          {credit.text}
        </>
      ) : credit.isShloka ? (
        <>
          <div className="shloka-text">
            {credit.text.split('\n').map((line, idx) => (
              <span key={idx} className="shloka-line">
                {line}
              </span>
            ))}
          </div>
          {credit.subtext && <div className="shloka-subtext">{credit.subtext}</div>}
        </>
      ) : (
        credit.text
      )}
    </div>
  )
}

export default function CreditRenderer({ activeCredits = [], time = 0, reduceMotion = false }) {
  if (!activeCredits || activeCredits.length === 0) return null

  return (
    <div className="credits-container-layer">
      {activeCredits.map((credit) => (
        <CreditItem key={credit.id} credit={credit} time={time} reduceMotion={reduceMotion} />
      ))}
    </div>
  )
}
