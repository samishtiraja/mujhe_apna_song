# Project Review & Suggestions: "मुझे अपना बनाकर छोड़ गए" (Web Song)

This document outlines key technical observations, potential improvements, and feature recommendations for the paper-cutout visual lyric film.

---

## 1. Performance & Media Optimizations

### A. Overlay Chroma-Key Caching
- **Current Behavior:** In `src/Stage.jsx`, `useChromaKeyedImage` renders the green-screen overlay onto an offscreen canvas and converts it to a base64 `dataURL` via `canvas.toDataURL()`.
- **Suggestion:**
  - Convert to `createImageBitmap()` or `canvas.toBlob()` + `URL.createObjectURL(blob)`.
  - Alternatively, pre-process `ov_rain.png` and `ov_tear.png` ahead of build time with true alpha transparency (PNG-32) so no runtime canvas manipulation or per-pixel processing loop is needed on mobile or low-power devices.

### B. Preloading Strategy for High-Resolution Plates
- **Current Behavior:** The component preloads all 27+ images upfront inside a single `useEffect` loop.
- **Suggestion:**
  - Implement a **windowed preload buffer** (e.g., preloading only the active shot ± 2 adjacent shots).
  - Modern web formats: Provide AVIF/WebP alternatives with fallback to PNG for significantly faster load times and bandwidth savings over cellular connections.

---

## 2. Audio-Visual Synchronization & Clock Enhancements

### A. Strict Audio Latency Correction
- In `src/useClock.js`, the internal loop checks `media.currentTime`. On some browsers (notably iOS Safari and Android Chrome), `audio.currentTime` can report discrete chunks (every ~200ms) rather than fluid sub-frame values.
- **Suggestion:**
  - Blend `audio.currentTime` with `performance.now()` interpolation during continuous playback to ensure fluid 60fps lyric highlight transitions and camera zooms even when audio hardware buffer updates are jittery.

### B. Keyboard Shortcuts for Playback
- Add standard cinematic keyboard shortcuts:
  - `Space` or `K`: Play / Pause toggle
  - `ArrowLeft` / `ArrowRight` or `J` / `L`: Seek backward / forward 5 seconds
  - `F`: Toggle Fullscreen
  - `M`: Mute / Unmute audio

---

## 3. Visual & Aesthetic Polish

### A. Placeholder / Blank Plate Transitions
- Plates `plate_09_bansuri.png` through `plate_27_end.png` currently duplicate `paper_01_blank.png`.
- **Suggestion:**
  - When a plate is using the blank fallback, consider rendering a subtle watermark, minimal pencil sketch outline, or gentle ambient ink dust particle effect so the screen retains visual intrigue while remaining faithful to the paper aesthetic.

### B. Dynamic Subtitle / Anchor Resizing
- The lyric text position anchors dynamically to different areas of the plate (e.g., `center`, `bottom-left`, `top-right`).
- **Suggestion:**
  - Ensure contrast safety checks with CSS `mix-blend-mode: multiply` or text shadow masks on paper textures so words remain legible across all paper grain variations and viewport dimensions.

---

## 4. Mobile & Touch Responsive Enhancements

### A. Touch Gestures on the Stage
- Double-tap on the left/right halves of the stage to seek ±5s (similar to YouTube).
- Single-tap to toggle the visibility of the timeline scrub bar and playback controls.

### B. Notch & Aspect Ratio Letterboxing
- For modern phone screens (19.5:9 or 20:9 aspect ratios), ensure paper borders seamlessly feather into `#efe2d0` or letterbox with matching parchment texture rather than stark cutoffs.

---

## 5. Development & Testing Workflow

- **Unit / Sync Testing:** Add a lightweight timeline test validating that no shot intervals overlap or create negative gaps, and all word timestamps stay within their parent shot duration.
- **Bundle Analysis:** Run `@vitejs/plugin-react` alongside automated asset optimization plugins (e.g., `vite-plugin-image-optimizer`) during production build.
