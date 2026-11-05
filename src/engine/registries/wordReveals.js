/**
 * Word Reveal Animations Registry
 * 10 distinctive word reveal styles for kinetic vocal synchronization.
 */

export const WORD_REVEAL_REGISTRY = {
  // 1. Ink Draw (Standard calligraphy pen-nib stroke)
  'ink-draw': (drawProgress, isCurrent, isSung) => {
    const pct = (drawProgress * 100).toFixed(1)
    return {
      clipPath: isSung ? 'none' : isCurrent ? `polygon(0 0, ${pct}% 0, ${pct}% 100%, 0 100%)` : 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      showNib: isCurrent && drawProgress > 0.02 && drawProgress < 0.98,
      nibLeft: `${pct}%`,
      opacity: 1,
    }
  },

  // 2. Fade: Soft alpha appearance
  fade: (drawProgress, isCurrent, isSung) => {
    const op = isSung ? 1 : isCurrent ? Math.min(1, drawProgress * 1.5) : 0
    return {
      opacity: op,
      transform: isCurrent ? `scale(${0.95 + drawProgress * 0.05})` : 'none',
    }
  },

  // 3. Pop: Playful scale bounce
  pop: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, transform: 'scale(1)' }
    if (!isCurrent) return { opacity: 0, transform: 'scale(0.5)' }
    // Overshoot pop: 0.5 -> 1.15 -> 1.0
    const s = drawProgress < 0.7 ? 0.5 + (drawProgress / 0.7) * 0.65 : 1.15 - ((drawProgress - 0.7) / 0.3) * 0.15
    return {
      opacity: Math.min(1, drawProgress * 3),
      transform: `scale(${s.toFixed(3)})`,
    }
  },

  // 4. Glow Pulse: Radiant candlelight / golden halo
  'glow-pulse': (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, filter: 'none' }
    if (!isCurrent) return { opacity: 0.25 }
    const glow = Math.sin(drawProgress * Math.PI) * 12
    return {
      opacity: 1,
      filter: `drop-shadow(0 0 ${glow.toFixed(1)}px rgba(225, 140, 50, 0.9))`,
      transform: `scale(${1 + Math.sin(drawProgress * Math.PI) * 0.08})`,
    }
  },

  // 5. Stamp: Wooden block-print pressing onto paper
  stamp: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, transform: 'none' }
    if (!isCurrent) return { opacity: 0, transform: 'scale(2.2)' }
    const s = 1 + (1 - drawProgress) * 1.2
    return {
      opacity: Math.min(1, drawProgress * 2),
      transform: `scale(${s.toFixed(3)}) rotate(${((1 - drawProgress) * -4).toFixed(1)}deg)`,
      filter: drawProgress < 0.8 ? 'contrast(140%)' : 'none',
    }
  },

  // 6. Typewriter: Stepped character-like arrival
  typewriter: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, clipPath: 'none' }
    if (!isCurrent) return { opacity: 0 }
    // Stepped reveal
    const steps = 8
    const stepped = Math.floor(drawProgress * steps) / steps
    return {
      opacity: 1,
      clipPath: `inset(0 ${(100 - stepped * 100).toFixed(1)}% 0 0)`,
    }
  },

  // 7. Brush Stroke: Sweeping artistic calligraphy wash
  'brush-stroke': (drawProgress, isCurrent, isSung) => {
    const pct = (drawProgress * 100).toFixed(1)
    if (isSung) return { opacity: 1, clipPath: 'none' }
    if (!isCurrent) return { opacity: 0 }
    return {
      opacity: Math.min(1, drawProgress * 2),
      clipPath: `polygon(0 0, ${pct}% 0, ${Math.max(0, pct - 5)}% 100%, 0 100%)`,
      filter: `blur(${((1 - drawProgress) * 1.5).toFixed(1)}px)`,
    }
  },

  // 8. Ripple: Expanding circular fluid ripple
  ripple: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1 }
    if (!isCurrent) return { opacity: 0 }
    const r = (drawProgress * 150).toFixed(1)
    return {
      opacity: Math.min(1, drawProgress * 2),
      maskImage: `radial-gradient(circle, black ${r}%, transparent ${(drawProgress * 150 + 20).toFixed(1)}%)`,
      WebkitMaskImage: `radial-gradient(circle, black ${r}%, transparent ${(drawProgress * 150 + 20).toFixed(1)}%)`,
    }
  },

  // 9. Bloom: Organic expansion from center
  bloom: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, transform: 'scale(1)' }
    if (!isCurrent) return { opacity: 0, transform: 'scale(0.2)' }
    const s = 0.2 + drawProgress * 0.8
    return {
      opacity: Math.min(1, drawProgress * 1.8),
      transform: `scale(${s.toFixed(3)})`,
      filter: `blur(${((1 - drawProgress) * 4).toFixed(1)}px)`,
    }
  },

  // 10. Chisel: Deep stone-carved inscription
  chisel: (drawProgress, isCurrent, isSung) => {
    if (isSung) return { opacity: 1, textShadow: '1px 1px 1px rgba(0,0,0,0.4)' }
    if (!isCurrent) return { opacity: 0 }
    return {
      opacity: drawProgress,
      textShadow: `0 0 ${(4 * (1 - drawProgress)).toFixed(1)}px rgba(0,0,0,0.8), 1px 1px 2px rgba(255,255,255,0.6)`,
    }
  },
}

export function registerWordReveal(name, handler) {
  WORD_REVEAL_REGISTRY[name] = handler
}

export function getWordRevealStyle(type = 'ink-draw', drawProgress, isCurrent, isSung) {
  const fn = WORD_REVEAL_REGISTRY[type] || WORD_REVEAL_REGISTRY['ink-draw']
  return fn(drawProgress, isCurrent, isSung)
}
