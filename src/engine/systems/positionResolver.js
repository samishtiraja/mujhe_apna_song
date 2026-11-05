/**
 * Universal Position Resolver
 * Translates position configs into consistent CSS layout styles.
 */

export const ANCHOR_PRESETS = {
  center: {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  'top-center': {
    top: '12%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
  left: {
    top: '50%',
    left: '8%',
    transform: 'translateY(-50%)',
    textAlign: 'left',
  },
  right: {
    top: '50%',
    right: '8%',
    transform: 'translateY(-50%)',
    textAlign: 'right',
  },
  'top-left': {
    top: '14%',
    left: '8%',
    transform: 'none',
    textAlign: 'left',
  },
  'top-right': {
    top: '14%',
    right: '8%',
    transform: 'none',
    textAlign: 'right',
  },
  'lower-left': {
    bottom: '16%',
    left: '8%',
    transform: 'none',
    textAlign: 'left',
  },
  'bottom-left': {
    bottom: '12%',
    left: '8%',
    transform: 'none',
    textAlign: 'left',
  },
  'bottom-right': {
    bottom: '12%',
    right: '8%',
    transform: 'none',
    textAlign: 'right',
  },
  'low-center': {
    bottom: '14%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
  low: {
    bottom: '12%',
    left: '50%',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  },
}

export function resolvePosition(pos = {}, fallbackAnchor = 'center') {
  if (typeof pos === 'string') {
    pos = { anchor: pos }
  }

  const anchorKey = pos.anchor || fallbackAnchor
  const base = ANCHOR_PRESETS[anchorKey] || ANCHOR_PRESETS.center

  const style = {
    position: 'absolute',
    textAlign: pos.textAlign || base.textAlign || 'center',
  }

  // Anchor or coordinate base
  if (pos.x != null && pos.y != null) {
    style.left = `${pos.x}%`
    style.top = `${pos.y}%`
    style.transform = 'translate(-50%, -50%)'
  } else {
    if (pos.left != null) style.left = pos.left
    else if (pos.right != null) style.right = pos.right
    else if (base.left != null) style.left = base.left
    else if (base.right != null) style.right = base.right

    if (pos.top != null) style.top = pos.top
    else if (pos.bottom != null) style.bottom = pos.bottom
    else if (base.top != null) style.top = base.top
    else if (base.bottom != null) style.bottom = base.bottom
  }

  if (pos.width != null) style.width = pos.width
  if (pos.height != null) style.height = pos.height

  // Base transforms
  const baseTransform = pos.transform || base.transform || ''
  const extraTransforms = []

  if (pos.offsetX != null || pos.offsetY != null) {
    const ox = pos.offsetX != null ? (typeof pos.offsetX === 'number' ? `${pos.offsetX}px` : pos.offsetX) : '0px'
    const oy = pos.offsetY != null ? (typeof pos.offsetY === 'number' ? `${pos.offsetY}px` : pos.offsetY) : '0px'
    extraTransforms.push(`translate(${ox}, ${oy})`)
  }

  if (pos.rotation != null && pos.rotation !== 0) {
    extraTransforms.push(`rotate(${pos.rotation}deg)`)
  }

  const combined = [baseTransform, ...extraTransforms].filter(Boolean).join(' ')
  if (combined) {
    style.transform = combined
  }

  return style
}
