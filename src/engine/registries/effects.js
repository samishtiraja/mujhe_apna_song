/**
 * Visual Effects & Color Grading Registry
 */

export function buildColorGradeFilter(colorGrade = {}) {
  const parts = []
  if (colorGrade.brightness != null) parts.push(`brightness(${colorGrade.brightness})`)
  if (colorGrade.contrast != null) parts.push(`contrast(${colorGrade.contrast})`)
  if (colorGrade.saturate != null) parts.push(`saturate(${colorGrade.saturate})`)
  if (colorGrade.sepia != null) parts.push(`sepia(${colorGrade.sepia})`)
  if (colorGrade.hueRotate != null) parts.push(`hue-rotate(${colorGrade.hueRotate}deg)`)
  if (colorGrade.grayscale != null) parts.push(`grayscale(${colorGrade.grayscale})`)
  return parts.join(' ')
}

export function resolveEffectsStyle(effects = {}) {
  const filters = []

  if (effects.filter) {
    filters.push(effects.filter)
  }

  if (effects.colorGrade) {
    const cgFilter = buildColorGradeFilter(effects.colorGrade)
    if (cgFilter) filters.push(cgFilter)
  }

  const style = {
    mixBlendMode: effects.blend || 'normal',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
  }

  return style
}

export function buildVignetteStyle(vignette) {
  if (!vignette) return null
  const strength = vignette.strength ?? 0.3
  const size = vignette.size ?? 70
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 4,
    background: `radial-gradient(ellipse at 50% 50%, transparent ${size}%, rgba(0, 0, 0, ${strength}) 100%)`,
  }
}
