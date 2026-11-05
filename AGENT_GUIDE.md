# Guide for the coding agent

Read this with `plan.md`. `plan.md` is the film. This file is the tracker and the review notes. Do not delete this file. Do not rename `plan.md`.

## Status

The coding agent is working on this app right now. Continue that work. Do not stop to wait for a review, and do not restart the app from scratch.

Last look: 2026-10-31.

What is already in place:

- `index.html` is Hindi, paper-colored, with Rozha One and Tiro Devanagari Hindi. The title is मुझे अपना बनाकर छोड़ गए.
- `vite.config.js` serves `/assets` from `assets/` and `/song` from `song/`, returns 404 for a missing file, and copies both folders into `dist` on build. `server.allowedHosts` allows the current ngrok host and `*.ngrok-free.dev`, `*.ngrok-free.app`, `*.ngrok.io`, and `*.ngrok.app`. Leave that list in place.
- The song and the timestamp file are in `song/`.
- `src/` does not have `main.jsx` yet. The player, the clock, and the timeline are still to be written.

What is not done:

- The stage, the word-by-word lyric, the shot timeline, play / pause / seek / fullscreen, and the pause at 4:49.
- Most paper drawings. Code the full timeline anyway. A missing PNG already 404s. Hide that plate. Do not block playback on it.

## Stay inside these rules

- Build only what Part A of `plan.md` describes. The timeline table there is the cut. Word times come from `song/timestampwithlyrics.md`. Do not round them.
- On screen the name is सँवरिया, with the chandrabindu.
- Credits are HTML only: प्रस्तुत है, the title, the subtitle, and राधा. Do not invent a singer or a music name.
- Plates use `z-index: 1`. Later plates cover earlier ones by DOM order. Do not use `z-index: 1 + index`.
- The sung line sits in the empty area named by that row's anchor. It is not a gold bar along the bottom.
- The page color stays `#efe2d0`. Ink is `#2a2118`. The sung word and राधा are `#8c2f2f`.
- `assets/images/` and the folder `images/` at the project root are the old photographic set. Do not show them. This film uses only `assets/paper/`.
- `ref_radha.png` and `ref_krishna.png` are face locks for drawing. They are not full-screen shots.
- Rain and the single tear wait until `ov_rain.png` and `ov_tear.png` exist. No other effects.
- When the same PNG continues across two timeline rows, keep it on screen and only change the line and the camera.
- The last frame is `plate_27_end.png`, held, with `fadeOut: false`. At 289 seconds the picture and the mp3 pause together.

## Paper files on disk now

Present in `assets/paper/`:

- `paper_01_blank.png`
- `plate_01_moon_sky.png`
- `plate_02_flute.png`
- `plate_03_dholak.png`
- `plate_04_face.png`
- `plate_05_footprints.png`
- `plate_06_threshold.png`
- `plate_07_lane.png`
- `plate_08_jhula.png`
- `ref_radha.png`
- `ref_krishna.png`

Not on disk yet. Leave them in the timeline. Hide each one until the file exists:

- `plate_09_bansuri.png` through `plate_27_end.png`
- `ov_rain.png`
- `ov_tear.png`

## Review

Another pass will read the code after this working pass. Until then, keep going from `plan.md`.
