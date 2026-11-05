# SongScript Engine (V2) — Final Implementation Plan

Transform `timeline.js` into an **enterprise-grade, declarative video & animation DSL**. One file completely orchestrates the video experience: shots, transitions, filters, blend modes, particle tracks, multi-layered cast elements, and kinetic typography with full motion/keyframe control.

---

## 1. Key Highlights & User Capabilities

| Feature | Scope & Capabilities |
|---|---|
| **Universal Text Motion** | Any text (Lyrics, Credits, Titles, Doha/Subtitles) can move linearly ($A \rightarrow B$), through multi-stop `keyframes`, or breathe via `living` animations (float, tremble, wave, pulse). |
| **Cast & Element Keyframes** | Scene elements & cast cutouts can follow complex motion curves/paths with customizable easing, scale, rotation, and continuous living dynamics. |
| **11 Cinematic Transitions** | `cut`, `dissolve`, `wipe-left`, `wipe-right`, `wipe-up`, `wipe-down`, `iris-in`, `iris-out`, `slide-left`, `slide-right`, `blur-through`, `ink-wash`. |
| **10 Word Reveal Animations** | `ink-draw` (pen nib), `fade`, `pop`, `glow-pulse`, `stamp`, `typewriter`, `brush-stroke`, `ripple`, `bloom`, `chisel`. |
| **Unlimited Multi-Tracks** | Independent overlay tracks (rain, tears, light leaks), multiple concurrent particle tracks (dust motes, fire embers), and floating text tracks anywhere in the song. |
| **Universal Positioning** | Coordinate system (`x`, `y` in %), CSS values (`top`, `left`, `bottom`, `right`), named anchors (`center`, `low-center`, etc.), offset nudges (`offsetX`, `offsetY`), and rotation. |
| **Backward Compatible & Recreative** | Existing "मुझे अपना बनाकर छोड़ गए" data will be migrated 1:1, verifying pixel-perfect visual output while unlocking the new engine. |

---

## 2. Updated Data Schema (`timeline.js`)

### A. Motion & Keyframe System (For Text & Cast)

Every element (whether a lyric line, a cast layer, or a track text item) can specify either:
1. **`motion` (Simple $A \rightarrow B$)**:
```js
motion: {
  xStart: 0, xEnd: 30,           // horizontal movement in px or %
  yStart: 0, yEnd: -25,          // vertical drift
  scaleStart: 1.0, scaleEnd: 1.05,
  rotStart: 0, rotEnd: -3,       // degrees
  opacityStart: 1.0, opacityEnd: 0.85,
  easing: 'ease-out'             // 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}
```

2. **`keyframes` (Multi-stop Path / Trajectory)**:
```js
keyframes: [
  { at: 0.0, x: -50, y: 20, scale: 0.8, rot: -5, opacity: 0 },
  { at: 0.3, x: -10, y: -10, scale: 0.95, rot: 2, opacity: 1 },
  { at: 0.7, x: 25,  y: -15, scale: 1.02, rot: -1, opacity: 1 },
  { at: 1.0, x: 60,  y: 0,   scale: 1.1,  rot: 0, opacity: 0.8 }
]
// 'at' is normalized progress [0.0 -> 1.0] across the element's active lifetime
```

3. **`living` (Continuous Organic Micro-movements)**:
Supported presets for both Cast Elements & Text:
- `float` — sinusoidal vertical floating
- `sway` — pendulum rotational sway
- `flicker` — brightness/luminescence fluctuation
- `drift` — slow ambient horizontal/vertical translation
- `pulse` — rhythmic scale breathing
- `tremble` — subtle high-frequency vibration for dramatic/emotional emphasis
- `orbit` — circular orbital path around the element's origin
- `wave` — undulated horizontal & vertical sine oscillation

---

### B. Complete `songScript` Structure

```js
export const songScript = {
  // ── 1. Metadata ──
  meta: {
    title: 'मुझे अपना बनाकर छोड़ गए',
    artist: 'Raja Hindustani',
    duration: 289.0,
    audio: '/song/aaye%20na%20sawariya.mp3',
  },

  // ── 2. Sections (Interactive Progress Markers & Jump Points) ──
  sections: [
    { id: 'intro',   label: 'प्रस्तावना', start: 0.0,   end: 14.8,  color: '#c99e64' },
    { id: 'chorus1', label: 'मुखड़ा',     start: 14.8,  end: 57.8,  color: '#8c2f2f' },
    { id: 'verse1',  label: 'अंतरा १',   start: 57.8,  end: 120.0, color: '#4a5d4e' },
    { id: 'verse2',  label: 'अंतरा २',   start: 122.0, end: 184.0, color: '#684a5d' },
    { id: 'verse3',  label: 'अंतरा ३',   start: 184.0, end: 234.0, color: '#a0522d' },
    { id: 'verse4',  label: 'अंतरा ४',   start: 236.0, end: 287.0, color: '#3d4a68' },
    { id: 'outro',   label: 'समाप्ति',    start: 287.0, end: 289.0, color: '#777777' },
  ],

  // ── 3. Shots & Multi-Layer Cast Elements ──
  shots: [
    {
      id: 's03',
      start: 9.8,
      end: 15.2,
      src: '/assets/paper/plate_radha_krishna_separation.png',
      transition: { type: 'dissolve', duration: 0.6 },
      effects: {
        filter: 'contrast(102%)',
        blend: 'normal',
        colorGrade: { brightness: 1.0, contrast: 1.05, saturate: 1.0 },
        vignette: { strength: 0.2, size: 75 },
      },
      camera: { scaleStart: 1.0, scaleEnd: 1.05, originStartX: 32, originStartY: 52, originEndX: 42, originEndY: 50 },
      layers: [
        {
          id: 'mourning_peacock',
          src: '/assets/paper/ref_peacock_mourning.png',
          start: 10.4,
          end: 15.2,
          position: { top: '6%', left: '26%', width: '16%' },
          enter: { type: 'smoke-dissolve', duration: 1.0 },
          exit: { type: 'smoke-evaporate', duration: 0.8 },
          keyframes: [
            { at: 0.0, x: 0, y: 0, scale: 0.95 },
            { at: 0.5, x: 5, y: -4, scale: 1.0 },
            { at: 1.0, x: 10, y: 0, scale: 1.05 },
          ],
          living: { type: 'sway', amp: 3.5, period: 4.2 },
          blend: 'normal',
          zIndex: 2,
        },
      ],
    },
    // ... all 48 shots
  ],

  // ── 4. Lyrics with Kinetic Typography & Location Management ──
  lyricLines: [
    {
      id: 'l01',
      start: 14.8,
      end: 20.0,
      position: { anchor: 'left', top: '70%', left: '10%' },
      // Optional text motion during vocal delivery
      motion: { yStart: 0, yEnd: -15, scaleStart: 1.0, scaleEnd: 1.03 },
      living: { type: 'float', amp: 2.5, period: 3.0 },
      style: {
        fontSize: '3.2vw',
        color: '#2a2118',
        activeColor: '#8c2f2f',
        sungColor: '#4d3728',
      },
      enter: { type: 'ink-reveal', duration: 0.4 },
      exit: { type: 'fade-out', duration: 0.3 },
      wordReveal: { type: 'ink-draw', cursor: 'pen-nib' },
      words: [
        { text: 'मुझे', time: 15.0 },
        { text: 'अपना', time: 16.0 },
        { text: 'बनाकर', time: 17.0 },
        { text: 'छोड़', time: 19.0 },
        { text: 'गए', time: 20.0 },
      ],
    },
    // ... all lyric lines
  ],

  // ── 5. Multi-Track System (Overlays, Particles, Floating Titles/Texts) ──
  tracks: [
    {
      id: 'rain_overlay',
      type: 'overlay',
      start: 183.8,
      end: 224.0,
      src: '/assets/paper/ov_rain.png',
      chromaKey: true,
      blend: 'screen',
      opacity: { peak: 0.52 },
      fadeIn: 1.2,
      fadeOut: 1.5,
      zIndex: 10,
    },
    {
      id: 'tear_overlay',
      type: 'overlay',
      start: 250.0,
      end: 254.0,
      src: '/assets/paper/ov_tear.png',
      chromaKey: true,
      motion: { yStart: 0, yEnd: 120 },
      fadeIn: 0.4,
      fadeOut: 0.6,
      zIndex: 10,
    },
    {
      id: 'ambient_dust',
      type: 'particle',
      start: 0.0,
      end: 289.0,
      particle: {
        count: 20,
        shape: 'circle',
        color: 'rgba(215, 190, 160, 0.35)',
        sizeRange: [2, 5],
        speedRange: [0.2, 0.6],
        drift: 'float-up',
      },
      blend: 'screen',
      zIndex: 5,
    },
    {
      id: 'viraha_embers',
      type: 'particle',
      start: 184.0,
      end: 224.0,
      particle: {
        count: 25,
        shape: 'circle',
        color: 'rgba(255, 120, 30, 0.55)',
        sizeRange: [1, 4],
        speedRange: [0.6, 1.4],
        drift: 'float-up',
      },
      blend: 'screen',
      zIndex: 6,
    },
    {
      id: 'verse3_callout',
      type: 'text',
      start: 184.0,
      end: 188.0,
      text: 'तृतीय अंतरा — विरह ज्वाला',
      position: { top: '8%', right: '6%', textAlign: 'right' },
      motion: { xStart: 20, xEnd: 0, opacityStart: 0, opacityEnd: 0.8 },
      style: { fontSize: '1.4vw', color: '#8c2f2f', letterSpacing: '0.08em' },
      enter: { type: 'blur-in', duration: 0.6 },
      exit: { type: 'fade-out', duration: 0.4 },
      zIndex: 15,
    },
  ],

  // ── 6. Titles & Credits ──
  credits: [
    {
      id: 'title',
      text: 'मुझे अपना बनाकर छोड़ गए',
      start: 4.6,
      end: 8.4,
      isTitle: true,
      position: { anchor: 'center', top: '50%', left: '50%' },
      motion: { scaleStart: 0.95, scaleEnd: 1.05 },
      enter: { type: 'fade-in', duration: 0.8 },
      exit: { type: 'fade-out', duration: 0.6 },
    },
    // ... remaining credit definitions
  ],
}
```

---

## 3. Modular Engine Architecture (`src/engine/`)

```
src/
├── timeline.js                         // SongScript DSL (Pure configuration & timing)
├── engine/
│   ├── motion/
│   │   ├── interpolate.js              // Keyframe evaluation & bezier/easing math
│   │   └── livingPresets.js            // 8 micro-animation formulas (float, sway, pulse, etc.)
│   ├── registries/
│   │   ├── transitions.js              // 11 shot transition implementations
│   │   ├── wordReveals.js              // 10 word reveal styles
│   │   ├── lineAnimations.js           // Line enter & exit animations
│   │   └── effects.js                  // ColorGrade, Vignette, Grain, Blend filters
│   ├── systems/
│   │   ├── positionResolver.js         // Universal placement (anchors, coords, offsets)
│   │   └── timelineResolver.js         // Time-indexed state resolution for active elements
│   ├── renderers/
│   │   ├── ShotRenderer.jsx            // Renders plate, transitions, camera, and cast layers
│   │   ├── LyricRenderer.jsx           // Renders styled kinetic lyrics & word sync
│   │   ├── TrackRenderer.jsx           // Renders overlays, text callouts, effects
│   │   ├── ParticleCanvas.jsx          // Canvas 2D engine running concurrent particle systems
│   │   ├── CreditRenderer.jsx          // Positionable cinematic credits
│   │   └── SectionMarkers.jsx          // Clickable section track on the progress bar
│   └── Stage.jsx                       // Master orchestrator (~250 LOC)
├── useClock.js
├── Stage.css
└── App.jsx
```

---

## 4. Execution & Delivery Plan

### Phase 1: Engine Foundation & Motion Math
- Implement `src/engine/motion/interpolate.js` (supporting normalized progress, linear $A \rightarrow B$, and multi-stop keyframes with easing).
- Implement `src/engine/motion/livingPresets.js` (8 living animation math functions).
- Implement `src/engine/systems/positionResolver.js` (handling standard anchors, percentage coordinates, pixel offsets, and rotation).
- Implement `src/engine/systems/timelineResolver.js` (efficient lookup for active items at timestamp $t$).

### Phase 2: Registries (Transitions, Reveals & Effects)
- Build `transitions.js` with all 11 transitions.
- Build `wordReveals.js` with all 10 word reveal presets.
- Build `lineAnimations.js` (enter/exit effects).
- Build `effects.js` (color grading, vignette, grain generator).

### Phase 3: Component Renderers & Canvas Particles
- Build `ParticleCanvas.jsx` supporting multiple concurrent particle tracks.
- Build `ShotRenderer.jsx`, `LyricRenderer.jsx`, `TrackRenderer.jsx`, `CreditRenderer.jsx`, and `SectionMarkers.jsx`.

### Phase 4: Data Migration & Re-creation
- Migrate existing `timeline.js` to the new `songScript` export while maintaining backward-compatible named exports.
- Wire `Stage.jsx` to consume `songScript` cleanly and dynamically.
- Update `Stage.css` with transition masks, font styling, and particle layering.

### Phase 5: Verification & Quality Assurance
- **Full Run Verification**: Play the complete song from 0:00 to 4:49 to ensure every visual and timing cue matches the original experience.
- **Motion Verification**: Test text movement, keyframe paths on cast elements, and particle tracks.
- **Section Jump Verification**: Click section markers on the timeline to verify seamless audio and visual synchronization.
