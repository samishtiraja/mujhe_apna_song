/**
 * Easing math and Keyframe evaluation engine
 */

export const EASING_FUNCTIONS = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  'ease-in-cubic': (t) => t * t * t,
  'ease-out-cubic': (t) => (--t) * t * t + 1,
}

export function applyEasing(t, easing = 'linear') {
  const fn = EASING_FUNCTIONS[easing] || EASING_FUNCTIONS.linear
  return fn(Math.max(0, Math.min(1, t)))
}

/**
 * Interpolates a value between start and end using normalized progress p [0, 1]
 */
export function lerp(start, end, p) {
  if (start == null && end == null) return undefined
  if (start == null) return end
  if (end == null) return start
  return start + (end - start) * p
}

/**
 * Calculates current values from linear motion config:
 * motion: { xStart, xEnd, yStart, yEnd, scaleStart, scaleEnd, rotStart, rotEnd, opacityStart, opacityEnd, easing }
 */
export function computeLinearMotion(motion = {}, progress = 0) {
  const p = applyEasing(progress, motion.easing || 'linear')
  return {
    x: lerp(motion.xStart ?? 0, motion.xEnd ?? 0, p),
    y: lerp(motion.yStart ?? 0, motion.yEnd ?? 0, p),
    scale: lerp(motion.scaleStart ?? 1.0, motion.scaleEnd ?? 1.0, p),
    rotation: lerp(motion.rotStart ?? 0, motion.rotEnd ?? 0, p),
    opacity: lerp(motion.opacityStart ?? 1.0, motion.opacityEnd ?? 1.0, p),
  }
}

/**
 * Evaluates a keyframes array:
 * keyframes: [ { at: 0.0, x: 0, y: 0, scale: 1, rot: 0, opacity: 1, easing: 'linear' }, ... ]
 * progress is [0, 1]
 */
export function computeKeyframesMotion(keyframes = [], progress = 0) {
  if (!keyframes || keyframes.length === 0) return null
  if (keyframes.length === 1) {
    const k = keyframes[0]
    return {
      x: k.x ?? 0,
      y: k.y ?? 0,
      scale: k.scale ?? 1.0,
      rotation: k.rot ?? k.rotation ?? 0,
      opacity: k.opacity ?? 1.0,
    }
  }

  const p = Math.max(0, Math.min(1, progress))

  // Find surrounding keyframe segments
  let prevIdx = 0
  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].at <= p) {
      prevIdx = i
    } else {
      break
    }
  }

  const nextIdx = Math.min(keyframes.length - 1, prevIdx + 1)
  const prevKf = keyframes[prevIdx]
  const nextKf = keyframes[nextIdx]

  if (prevIdx === nextIdx || prevKf.at === nextKf.at) {
    return {
      x: prevKf.x ?? 0,
      y: prevKf.y ?? 0,
      scale: prevKf.scale ?? 1.0,
      rotation: prevKf.rot ?? prevKf.rotation ?? 0,
      opacity: prevKf.opacity ?? 1.0,
    }
  }

  // Segment normalized progress
  const segProgress = (p - prevKf.at) / (nextKf.at - prevKf.at)
  const segP = applyEasing(segProgress, nextKf.easing || prevKf.easing || 'linear')

  return {
    x: lerp(prevKf.x ?? 0, nextKf.x ?? 0, segP),
    y: lerp(prevKf.y ?? 0, nextKf.y ?? 0, segP),
    scale: lerp(prevKf.scale ?? 1.0, nextKf.scale ?? 1.0, segP),
    rotation: lerp(prevKf.rot ?? prevKf.rotation ?? 0, nextKf.rot ?? nextKf.rotation ?? 0, segP),
    opacity: lerp(prevKf.opacity ?? 1.0, nextKf.opacity ?? 1.0, segP),
  }
}
