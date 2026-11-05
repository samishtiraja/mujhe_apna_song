/**
 * Living Micro-Animation Presets
 * Generates continuous organic transforms & filters based on time.
 */

export const LIVING_PRESETS = {
  // Sinusoidal vertical breathing/floating
  float: (elapsed, config = {}) => {
    const amp = config.amp ?? 6
    const period = config.period ?? 3.5
    const y = Math.sin((elapsed / period) * Math.PI * 2) * amp
    return { transform: `translateY(${y.toFixed(2)}px)` }
  },

  // Delicate pendulum sway / tilting
  sway: (elapsed, config = {}) => {
    const amp = config.amp ?? 3.5
    const period = config.period ?? 4.2
    const deg = Math.sin((elapsed / period) * Math.PI * 2) * amp
    return { transform: `rotate(${deg.toFixed(2)}deg)` }
  },

  // Luminescence / flicker for oil lamps, flames, reflections
  flicker: (elapsed, config = {}) => {
    const amp = config.amp ?? 0.05
    const val = 1 + (Math.sin(elapsed * 13) + Math.cos(elapsed * 23)) * amp
    return { filter: `brightness(${val.toFixed(3)})` }
  },

  // Ambient horizontal/diagonal drift
  drift: (elapsed, config = {}) => {
    const ampX = config.ampX ?? 8
    const ampY = config.ampY ?? 4
    const period = config.period ?? 6.0
    const x = Math.sin((elapsed / period) * Math.PI * 2) * ampX
    const y = Math.cos((elapsed / (period * 0.8)) * Math.PI * 2) * ampY
    return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` }
  },

  // Subtle rhythmic scale breathing
  pulse: (elapsed, config = {}) => {
    const amp = config.amp ?? 0.04
    const period = config.period ?? 3.0
    const s = 1 + Math.sin((elapsed / period) * Math.PI * 2) * amp
    return { transform: `scale(${s.toFixed(4)})` }
  },

  // High-frequency subtle tremor / vibration for emotional or tension scenes
  tremble: (elapsed, config = {}) => {
    const amp = config.amp ?? 1.5
    const x = (Math.sin(elapsed * 45) * 0.7 + Math.cos(elapsed * 67) * 0.3) * amp
    const y = (Math.cos(elapsed * 53) * 0.7 + Math.sin(elapsed * 39) * 0.3) * amp
    return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` }
  },

  // Orbital circular micro-path around anchor
  orbit: (elapsed, config = {}) => {
    const radius = config.radius ?? 5
    const period = config.period ?? 5.0
    const angle = (elapsed / period) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` }
  },

  // Wave ripple oscillation
  wave: (elapsed, config = {}) => {
    const amp = config.amp ?? 4
    const period = config.period ?? 3.8
    const x = Math.sin((elapsed / period) * Math.PI * 2) * amp
    const y = Math.sin((elapsed / (period * 0.5)) * Math.PI * 2) * (amp * 0.5)
    const rot = Math.cos((elapsed / period) * Math.PI * 2) * 1.5
    return { transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)` }
  },
}

export function evaluateLivingMotion(elapsed, config) {
  if (!config) return { transforms: [], filters: [] }
  const type = typeof config === 'string' ? config : config.type
  const fn = LIVING_PRESETS[type]
  if (!fn) return { transforms: [], filters: [] }

  const res = fn(elapsed, typeof config === 'object' ? config : {})
  return {
    transforms: res.transform ? [res.transform] : [],
    filters: res.filter ? [res.filter] : [],
  }
}
