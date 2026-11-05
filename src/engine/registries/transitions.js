/**
 * Shot Transitions Registry
 * 11 Transition types generating dynamic CSS styles (clip-paths, transforms, filters, masks)
 */

export const TRANSITION_REGISTRY = {
  // 1. Cut: Instant switch
  cut: () => ({}),

  // 2. Dissolve: Standard crossfade
  dissolve: (p) => ({
    opacity: p,
  }),

  // 3. Wipe Left: reveal from right to left
  'wipe-left': (p) => ({
    clipPath: `inset(0 0 0 ${(100 - p * 100).toFixed(1)}%)`,
    WebkitClipPath: `inset(0 0 0 ${(100 - p * 100).toFixed(1)}%)`,
  }),

  // 4. Wipe Right: reveal from left to right
  'wipe-right': (p) => ({
    clipPath: `inset(0 ${(100 - p * 100).toFixed(1)}% 0 0)`,
    WebkitClipPath: `inset(0 ${(100 - p * 100).toFixed(1)}% 0 0)`,
  }),

  // 5. Wipe Up: reveal from bottom to top
  'wipe-up': (p) => ({
    clipPath: `inset(${(100 - p * 100).toFixed(1)}% 0 0 0)`,
    WebkitClipPath: `inset(${(100 - p * 100).toFixed(1)}% 0 0 0)`,
  }),

  // 6. Wipe Down: reveal from top to bottom
  'wipe-down': (p) => ({
    clipPath: `inset(0 0 ${(100 - p * 100).toFixed(1)}% 0)`,
    WebkitClipPath: `inset(0 0 ${(100 - p * 100).toFixed(1)}% 0)`,
  }),

  // 7. Iris In: Circular aperture opening from center outward
  'iris-in': (p) => ({
    clipPath: `circle(${(p * 75).toFixed(1)}% at 50% 50%)`,
    WebkitClipPath: `circle(${(p * 75).toFixed(1)}% at 50% 50%)`,
  }),

  // 8. Iris Out: Circular aperture closing inward
  'iris-out': (p) => ({
    clipPath: `circle(${((1 - p) * 75).toFixed(1)}% at 50% 50%)`,
    WebkitClipPath: `circle(${((1 - p) * 75).toFixed(1)}% at 50% 50%)`,
  }),

  // 9. Slide Left: New shot enters sliding from right
  'slide-left': (p) => ({
    transform: `translateX(${((1 - p) * 100).toFixed(1)}%)`,
  }),

  // 10. Slide Right: New shot enters sliding from left
  'slide-right': (p) => ({
    transform: `translateX(${(-(1 - p) * 100).toFixed(1)}%)`,
  }),

  // 11. Blur Through: Blurs in from heavy camera out-of-focus
  'blur-through': (p) => ({
    opacity: Math.min(1, p * 1.2),
    filter: `blur(${((1 - p) * 16).toFixed(1)}px)`,
  }),

  // 12. Ink Wash: Watercolor wash expanding across vintage paper
  'ink-wash': (p) => ({
    maskImage: `radial-gradient(ellipse at 50% 50%, black ${(p * 100).toFixed(1)}%, transparent ${(p * 100 + 25).toFixed(1)}%)`,
    WebkitMaskImage: `radial-gradient(ellipse at 50% 50%, black ${(p * 100).toFixed(1)}%, transparent ${(p * 100 + 25).toFixed(1)}%)`,
    filter: `blur(${((1 - p) * 3).toFixed(2)}px) contrast(${(100 + (1 - p) * 40).toFixed(0)}%)`,
  }),
}

export function registerTransition(name, handler) {
  TRANSITION_REGISTRY[name] = handler
}

/**
 * Calculates transition style for a shot entering or exiting.
 */
export function getTransitionStyle(shot, time) {
  if (!shot.transition) return {}
  const duration = shot.transition.duration ?? shot.fade ?? 0.6
  const type = shot.transition.type || 'dissolve'
  const fn = TRANSITION_REGISTRY[type] || TRANSITION_REGISTRY.dissolve

  const elapsed = time - shot.start
  if (elapsed < duration && duration > 0) {
    const p = Math.max(0, Math.min(1, elapsed / duration))
    return fn(p)
  }
  return {}
}
