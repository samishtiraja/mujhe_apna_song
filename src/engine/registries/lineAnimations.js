/**
 * Lyric Line Enter & Exit Animation Registry
 */

export const LINE_ENTER_REGISTRY = {
  none: () => ({}),

  'fade-in': (p) => ({
    opacity: p,
  }),

  'ink-reveal': (p) => ({
    opacity: Math.min(1, p * 1.5),
    filter: `contrast(${(100 + (1 - p) * 30).toFixed(0)}%)`,
  }),

  'blur-in': (p) => ({
    opacity: p,
    filter: `blur(${((1 - p) * 8).toFixed(1)}px)`,
  }),

  'slide-up': (p) => ({
    opacity: p,
    transform: `translateY(${((1 - p) * 35).toFixed(1)}px)`,
  }),

  'slide-down': (p) => ({
    opacity: p,
    transform: `translateY(${(-(1 - p) * 35).toFixed(1)}px)`,
  }),

  'scale-in': (p) => ({
    opacity: p,
    transform: `scale(${(0.8 + p * 0.2).toFixed(3)})`,
  }),

  'float-up': (p) => ({
    opacity: p,
    transform: `translateY(${((1 - p) * 20).toFixed(1)}px)`,
    filter: `blur(${((1 - p) * 3).toFixed(1)}px)`,
  }),

  'drop-in': (p) => {
    const y = p < 0.7 ? -(1 - p / 0.7) * 40 : Math.sin(((p - 0.7) / 0.3) * Math.PI) * 6
    return {
      opacity: Math.min(1, p * 2),
      transform: `translateY(${y.toFixed(1)}px)`,
    }
  },

  'ink-bleed': (p) => ({
    opacity: p,
    maskImage: `radial-gradient(ellipse at 50% 50%, black ${(p * 110).toFixed(1)}%, transparent ${(p * 110 + 20).toFixed(1)}%)`,
    WebkitMaskImage: `radial-gradient(ellipse at 50% 50%, black ${(p * 110).toFixed(1)}%, transparent ${(p * 110 + 20).toFixed(1)}%)`,
    filter: `blur(${((1 - p) * 2).toFixed(1)}px)`,
  }),

  'glow-in': (p) => ({
    opacity: p,
    filter: `drop-shadow(0 0 ${((1 - p) * 20).toFixed(1)}px rgba(220, 140, 60, 0.9))`,
  }),

  'wave-in': (p) => ({
    opacity: p,
    transform: `translateY(${((1 - p) * 25).toFixed(1)}px) rotate(${((1 - p) * -3).toFixed(1)}deg)`,
  }),
}

export const LINE_EXIT_REGISTRY = {
  none: () => ({}),

  'fade-out': (p) => ({
    opacity: p,
  }),

  'blur-out': (p) => ({
    opacity: p,
    filter: `blur(${((1 - p) * 8).toFixed(1)}px)`,
  }),

  'slide-up': (p) => ({
    opacity: p,
    transform: `translateY(${(-(1 - p) * 25).toFixed(1)}px)`,
  }),

  'scale-out': (p) => ({
    opacity: p,
    transform: `scale(${(0.8 + p * 0.2).toFixed(3)})`,
  }),

  'float-away': (p) => ({
    opacity: p,
    transform: `translateY(${(-(1 - p) * 20).toFixed(1)}px)`,
    filter: `blur(${((1 - p) * 4).toFixed(1)}px)`,
  }),

  'ink-dissolve': (p) => ({
    opacity: p,
    filter: `blur(${((1 - p) * 3).toFixed(1)}px) contrast(${(p * 100).toFixed(0)}%)`,
  }),

  'smoke-out': (p) => ({
    opacity: p,
    transform: `translateY(${(-(1 - p) * 20).toFixed(1)}px) scale(${(1 + (1 - p) * 0.05).toFixed(3)})`,
    filter: `blur(${((1 - p) * 6).toFixed(1)}px)`,
  }),
}

export function getLineEnterStyle(enterConfig = {}, progress = 1) {
  const type = typeof enterConfig === 'string' ? enterConfig : enterConfig.type || 'ink-reveal'
  const fn = LINE_ENTER_REGISTRY[type] || LINE_ENTER_REGISTRY['fade-in']
  return fn(progress)
}

export function getLineExitStyle(exitConfig = {}, progress = 1) {
  const type = typeof exitConfig === 'string' ? exitConfig : exitConfig.type || 'fade-out'
  const fn = LINE_EXIT_REGISTRY[type] || LINE_EXIT_REGISTRY['fade-out']
  return fn(progress)
}
