/**
 * Timeline Resolver System
 * Resolves active shots, layers, lyrics, credits, and tracks at any timestamp.
 */

export function resolvePlateOpacity(time, shot, index, allShots) {
  if (time < shot.start || time > shot.end) return 0
  const fade = shot.fade ?? 0.5
  const isSameAsPrev = index > 0 && allShots[index - 1].file === shot.file
  const isSameAsNext = index < allShots.length - 1 && allShots[index + 1].file === shot.file

  const fadeIn = !isSameAsPrev
  const fadeOut = shot.fadeOut !== false && !isSameAsNext

  let op = 1
  if (fadeIn && time < shot.start + fade) {
    op = Math.min(op, (time - shot.start) / Math.max(0.01, fade))
  }
  if (fadeOut && time > shot.end - fade) {
    op = Math.min(op, (shot.end - time) / Math.max(0.01, fade))
  }
  return Math.max(0, Math.min(1, op))
}

export function resolveTimelineState(time, script = {}) {
  const { shots = [], lyricLines = [], credits = [], tracks = [], sections = [] } = script

  // 1. Active Shots
  const activeShots = shots
    .map((shot, index) => {
      const opacity = resolvePlateOpacity(time, shot, index, shots)
      const duration = Math.max(0.01, shot.end - shot.start)
      const progress = Math.max(0, Math.min(1, (time - shot.start) / duration))
      return { shot, index, opacity, progress }
    })
    .filter((item) => item.opacity > 0.005)

  // 2. Active Lyric Line
  const activeLyric = lyricLines.find((line) => time >= line.start && time < line.end) || null

  // 3. Active Credits
  const activeCredits = credits.filter((c) => time >= c.start && time < c.end)

  // 4. Active Tracks (Overlays, Particles, Floating Text, Color Grading)
  const activeTracks = tracks.filter((t) => time >= t.start && time < t.end)

  // 5. Current Section
  const currentSection = sections.find((s) => time >= s.start && time < s.end) || null

  return {
    activeShots,
    activeLyric,
    activeCredits,
    activeTracks,
    currentSection,
  }
}
