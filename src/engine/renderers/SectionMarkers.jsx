/**
 * Interactive Section Markers on Scrubber
 */
export default function SectionMarkers({ sections = [], totalDuration = 289, currentTime = 0, onSeek }) {
  if (!sections || sections.length === 0 || totalDuration <= 0) return null

  return (
    <div className="section-markers-track">
      {sections.map((sec) => {
        const leftPct = (sec.start / totalDuration) * 100
        const widthPct = ((sec.end - sec.start) / totalDuration) * 100
        const isActive = currentTime >= sec.start && currentTime < sec.end

        return (
          <div
            key={sec.id}
            className={`section-segment ${isActive ? 'active' : ''}`}
            style={{
              left: `${leftPct}%`,
              width: `${widthPct}%`,
              '--sec-color': sec.color || '#8c2f2f',
            }}
            title={`${sec.label} (${Math.floor(sec.start / 60)}:${Math.floor(sec.start % 60).toString().padStart(2, '0')})`}
            onClick={(e) => {
              e.stopPropagation()
              if (onSeek) onSeek(sec.start)
            }}
          >
            <span className="section-dot" />
            <span className="section-label-chip">{sec.label}</span>
          </div>
        )
      })}
    </div>
  )
}
