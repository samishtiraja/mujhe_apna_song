# Paper lyric film — complete build prompt and image prompts

Use this file to make a **new app**. Do not extend the old photoreal cutout player.

- **Part A** is the prompt for the coding agent. Paste Part A as the build brief.
- **Part B** is every image the app needs. Copy one fenced prompt at a time into Nano Banana Pro. Set the ratio in the tool as written. Export 2K PNG. Save it under `assets/paper/` with the file name given here.
- Draw original pictures. Do not copy frames, faces, lettering, or title cards from any existing music video.

The song is one devotional lyric film, about four minutes and forty-nine seconds. It should feel like a handmade picture book that moves: warm paper, black ink, one idea at a time, and the sung line sitting in the empty part of the page. It should not feel like a slideshow of photographs with a caption bar.

---

# Part A — prompt for the new app

Build a Vite + React JavaScript app that plays one song as a paper-and-ink lyric film in the browser. The picture is timed animation of still drawings plus HTML type. It is not an edited MP4, not a photoreal collage, and not a 3D scene.

## What it must feel like

The screen is a sheet of warm handmade paper. Each shot is one drawing with a lot of empty paper left on purpose. The Hindi line is placed in that empty area, like handwriting on the page, and the words arrive as they are sung.

Every few seconds the idea changes. A face. Footprints leaving. An empty swing. A thread about to snap. A knot. Wood, coal, ash. Two eyes. A road with nobody on it. Do not stage the same pose on a new background. If the line repeats, either hold the same drawing and only change the words, or cut to a different idea. Never put a full-size woman on the right of every frame with a gold caption along the bottom.

The reference feeling is an illustrated music film: quiet, sparse, emotional, original. Camera moves are slow pushes and drifts. The drawing and the type are the picture. There is no lower-third banner, no gold gradient, no glow, no karaoke pill, and no credit slab.

## What not to build

- Do not paste photographic cutouts over photographic plates.
- Do not use magenta or green screens on the story plates. Those plates already include the people, drawn in the same ink as the paper.
- Do not bake Hindi or English words, titles, credits, signatures, logos, or watermarks into images. All type is HTML.
- Do not invent a singer name or a music-director name. Those credits stay hidden because the names are unknown.
- Do not depict gore. The crow verse and the pyre verse stay symbolic. No wounds, no blood, no body being eaten, no person on fire.
- Do not add a particle system, floating embers, lens dirt, or extra effects beyond the rain overlay and the motions listed in the timeline.
- Do not build a second song, a menu of songs, or an account system.
- Do not use Three.js or WebGL. CSS opacity, transform, and HTML type are the whole picture.

## Song and language

- Title on screen: मुझे अपना बनाकर छोड़ गए
- Subtitle on screen: आए ना सँवरिया बेदरदी
- Poet credit: राधा
- This is Radha speaking about Krishna, who left and did not come back. Krishna is absent from the intro.
- On-screen spelling uses सँवरिया with a chandrabindu, even if a timing note writes सवरिया.
- Soundtrack file: `song/aaye na sawariya.mp3`
- Timing source: `song/timestampwithlyrics.md`
- Visual duration is the full song, **289 seconds** (0:00.0 through 4:49.0). When the picture reaches the end, pause the audio with it. Do not loop.
- Copy every word time from the timing file. Do not round, shift, or invent times. A line is the words that share one lyric row in the timeline below. Reveal each word at its own timestamp. The current word is maroon. Words already sung are ink black. Words not yet sung are a faint ink. When the next line starts, replace the line. Do not stack lines.
- `lang` is `hi`. Title and sung lines use Rozha One. Small credits and the clock use Tiro Devanagari Hindi, with Nirmala UI and Mangal as fallbacks.

## Player behavior

- The browser will not start audio until a gesture. The first gesture is a play control on the paper, a click on the frame, or Space. Ignore Space when the target is a button or a text field.
- After the audio is actually playing, the clock follows `audio.currentTime`. Before it plays, or if playback is blocked, a `requestAnimationFrame` clock may move the picture only until a gesture starts the song.
- Seek sets `audio.currentTime` and must ignore a stale time update for that seek.
- Replay seeks the audio to 0 and starts again.
- Controls: play and pause, seek, current time, total time `4:49`, and fullscreen. Controls fade while the film plays and return on pointer move. Labels in Hindi: चलाएँ, रोकें, फिर से.
- The frame is 16:9, centered, as large as the viewport allows. The page around it is the same warm paper color, not a black theater.
- `prefers-reduced-motion`: no camera drift and no word-rise. Crossfades and word color changes stay.

## How a shot is drawn

Each timeline row is one layer:

- `src` is `/assets/paper/<file>.png`
- `start`, `end` in seconds
- `fade` is the crossfade length, usually 0.5 seconds
- `fadeOut: false` only on the final end plate, so the paused last frame is not blank
- `anchor` is where the HTML line sits: `left`, `right`, `center`, `low-center`, `lower-left`
- `camera` is a slow scale and origin change across the shot, different per shot. Do not use the same 5 percent zoom on every plate.
- While two plates overlap, both are opacity-faded. Every plate has CSS `z-index: 1`. Later plates paint over earlier ones by DOM order. Do not set `z-index` from the array index. Type sits above the plates. The rain overlay sits above the plates and below the type.

Missing images hide themselves. A missing file must not fall through to `index.html`.

Serve the `assets/` folder from the site root at `/assets`. In dev, do not cache the images. On build, copy `assets/paper/` into the output.

## Color and type

- Paper: `#efe2d0`
- Ink: `#2a2118`
- Faint ink: `rgba(42, 33, 24, 0.28)`
- Maroon, for the sung word and for राधा: `#8c2f2f`
- The sung line is large, but it must sit in the empty region named by `anchor`. It is not locked to the bottom center. No gold, no gradient, no heavy shadow. A very soft ink shadow is enough for separation.
- Credits appear only in the intro, in the empty paper, then leave:
  - 2.2–5.4: प्रस्तुत है
  - 4.6–8.4: the title
  - 6.2–9.0: the subtitle
  - 9.2–12.4: राधा
  - No गायन line. No संगीत line.

## Story order

Krishna, when he appears, is always leaving. He is small. He is a back view or a profile facing away. He never looks out of the frame. Radha watches. Often she is only a face, or she is small. Some shots contain neither of them. That emptiness is intentional.

Intro, 0:00–0:15. Flute and dholak. No Krishna. Moon, then a flute, then a dholak. The title sits in the empty sky of the first plate.

Chorus, 0:15–0:58. She was made his and left. He did not come. Each pair of lines is a new idea: her face, footprints, the doorway, the lane, the empty swing, the dropped flute, empty hands, his profile leaving, then an empty road.

Verse 1, 0:58–2:02. If she had known love hurts, she would have had it cried through the town. He made her a lover and left. Then the chorus returns on earlier plates.

Verse 2, 2:02–3:04. Rahim’s thread of love. Do not snap it. Once broken, the knot remains. He tied that bond and left.

Verse 3, 3:04–3:56. Wood becomes coal, coal becomes ash. She burned and became neither. He left her by a distant pyre. The pyre is a small far flame, not a person burning.

Verse 4, 3:56–4:47. A crow may take the body, but not the two eyes, because they still hope to see the beloved. He met her eyes and left.

Outro, 4:47–4:49. Empty paper, one moon, one still swing. No people. No line. Hold on the pause.

## Timeline

Times are seconds. Crossfade is 0.5 unless noted. When the same file continues into the next row, do not fade it out and back in. Only change the line and the camera.

| Start | End | File | Line | Anchor | Camera |
| --- | --- | --- | --- | --- | --- |
| 0.0 | 6.2 | plate_01_moon_sky.png | title only | center | drift up, scale 1.00 to 1.04, origin 50% 42% |
| 5.6 | 11.2 | plate_02_flute.png | subtitle only | right | drift left, scale 1.02 to 1.00, origin 30% 70% |
| 10.6 | 15.4 | plate_03_dholak.png | राधा | left | still, scale 1.00 to 1.03, origin 28% 72% |
| 14.8 | 20.3 | plate_04_face.png | मुझे अपना बनाकर छोड़ गए | left | push toward her eye, scale 1.00 to 1.08, origin 78% 42% |
| 19.8 | 25.3 | plate_05_footprints.png | आए ना सँवरिया बेदरदी | left | follow the prints, origin 40% 60% to 70% 50% |
| 24.8 | 30.3 | plate_06_threshold.png | मुझे अपना बनाकर छोड़ गए | lower-left | drift into the arch, scale 1.02 to 1.06, origin 48% 40% |
| 29.8 | 35.3 | plate_07_lane.png | आए ना सँवरिया बेदरदी | left | drift down the lane, origin 46% 48% to 55% 40% |
| 34.8 | 40.3 | plate_08_jhula.png | मुझे अपना बनाकर छोड़ गए | right | slow swing drift, scale 1.00 to 1.03, origin 32% 45% |
| 39.8 | 45.3 | plate_09_bansuri.png | आए ना सँवरिया बेदरदी | center | settle on the flute, origin 30% 78% |
| 44.8 | 50.3 | plate_10_hands.png | मुझे अपना बनाकर छोड़ गए | left | still, scale 1.00 to 1.04, origin 72% 55% |
| 49.8 | 54.3 | plate_11_profile.png | आए ना सँवरिया बेदरदी | low-center | drift left with him, origin 30% 55% to 18% 55% |
| 53.8 | 58.2 | plate_12_empty_path.png | आए ना सँवरिया बेदरदी | low-center | continue down the road, scale 1.02 to 1.06, origin 50% 40% |
| 57.8 | 68.3 | plate_13_knowing.png | जो मैं ऐसो जानती प्रीत करे दुख होए | left | push to the lowered eyes, scale 1.00 to 1.07, origin 70% 40% |
| 67.8 | 78.3 | plate_14_dindora.png | नगर डिंडोरा पीटती प्रीत ना करियो कोए | right | drift through the lane, origin 40% 55% |
| 77.8 | 84.2 | plate_15_lover.png | मुझे प्रेमी बनाकर छोड़ गए | left | still, origin 68% 60% |
| 83.8 | 89.2 | plate_16_nobody.png | आए ना सँवरिया बेदरदी | right | push into the empty arch, scale 1.00 to 1.06, origin 50% 42% |
| 88.8 | 94.2 | plate_15_lover.png | मुझे प्रेमी बनाकर छोड़ गए | left | closer, scale 1.04 to 1.08, origin 70% 48% |
| 93.8 | 99.2 | plate_16_nobody.png | आए ना सँवरिया बेदरदी | right | same plate, origin 50% 36% |
| 98.8 | 104.2 | plate_04_face.png | मुझे अपना बनाकर छोड़ गए | left | scale 1.04 to 1.08, origin 76% 40% |
| 103.8 | 109.2 | plate_05_footprints.png | आए ना सँवरिया बेदरदी | left | origin 55% 58% |
| 108.8 | 120.2 | plate_12_empty_path.png | first line, then आए ना सँवरिया बेदरदी at 114.0 | low-center | one continuous move, scale 1.00 to 1.05 |
| 119.8 | 122.4 | plate_02_flute.png | no line | right | still |
| 121.8 | 132.3 | plate_17_thread.png | रहिमन धागा प्रेम का मत तोड़ो चटकाए | center | drift along the thread, origin 30% 50% to 70% 50% |
| 131.8 | 142.3 | plate_18_knot.png | टूटे से फिर ना जुड़े जुड़े गाँठ पड़ जाए | center | push to the knot, scale 1.00 to 1.08, origin 50% 50% |
| 141.8 | 148.3 | plate_19_knot_left.png | गठ बंधन बनाकर छोड़ गए | left | drift toward the leaving figure, origin 40% 60% |
| 147.8 | 153.3 | plate_16_nobody.png | आए ना सँवरिया बेदरदी | right | origin 50% 40% |
| 152.8 | 158.3 | plate_19_knot_left.png | गठ बंधन बनाकर छोड़ गए | left | closer on the knot, origin 42% 62% |
| 157.8 | 163.3 | plate_12_empty_path.png | आए ना सँवरिया बेदरदी | low-center | origin 48% 38% |
| 162.8 | 168.3 | plate_04_face.png | मुझे अपना बनाकर छोड़ गए | left | origin 78% 42% |
| 167.8 | 173.3 | plate_05_footprints.png | आए ना सँवरिया बेदरदी | left | origin 60% 55% |
| 172.8 | 178.3 | plate_08_jhula.png | मुझे अपना बनाकर छोड़ गए | right | origin 34% 46% |
| 177.8 | 184.2 | plate_12_empty_path.png | आए ना सँवरिया बेदरदी | low-center | scale 1.02 to 1.05 |
| 183.8 | 194.3 | plate_20_wood.png | लकड़ी जल कोयला भई कोयला जल भई राख | left | move left to right across wood, coal, ash, origin 25% 65% to 75% 65% |
| 193.8 | 204.3 | plate_21_ash.png | मैं पापिन ऐसी जली ना कोयला बनी ना राख | right | still, scale 1.00 to 1.04, origin 72% 58% |
| 203.8 | 209.3 | plate_22_pyre.png | मुझे जलती चिता में छोड़ गए | left | toward the far flame, origin 30% 45% |
| 208.8 | 214.3 | plate_16_nobody.png | आए ना सँवरिया बेदरदी | right | origin 50% 40% |
| 213.8 | 219.3 | plate_22_pyre.png | मुझे जलती चिता में छोड़ गए | left | closer, scale 1.03 to 1.07 |
| 218.8 | 224.3 | plate_12_empty_path.png | आए ना सँवरिया बेदरदी | low-center | origin 50% 36% |
| 223.8 | 229.3 | plate_04_face.png | मुझे अपना बनाकर छोड़ गए | left | origin 76% 42% |
| 228.8 | 236.2 | plate_05_footprints.png | आए ना सँवरिया बेदरदी, then no line after 234.0 | left | one hold |
| 235.8 | 246.3 | plate_23_crow.png | कागा सब तन खाइयो चुन चुन खइयो मांस | left | drift to the eyes, origin 20% 30% to 75% 70% |
| 245.8 | 256.3 | plate_24_eyes.png | दो नैना मत खाइयो मोहे पिया मिलन की आस | low | very slow push, scale 1.00 to 1.05, origin 50% 42% |
| 255.8 | 261.3 | plate_25_eyes_apart.png | मोसे नैना मिलाकर छोड़ गए | center | drift from her eye toward his turning eye |
| 260.8 | 266.3 | plate_05_footprints.png | आए ना सँवरिया बेदरदी | left | origin 62% 55% |
| 265.8 | 271.3 | plate_25_eyes_apart.png | मोसे नैना मिलाकर छोड़ गए | center | closer on the gap between the eyes |
| 270.8 | 276.3 | plate_12_empty_path.png | आए ना सँवरिया बेदरदी | low-center | origin 50% 38% |
| 275.8 | 287.2 | plate_26_last_road.png | मुझे अपना बनाकर छोड़ गए, then आए ना सँवरिया बेदरदी at 281.0 | left | one slow drift down the empty road, scale 1.00 to 1.04 |
| 286.6 | 289.0 | plate_27_end.png | no line | none | still, fadeOut false |

Word times inside each line come from `song/timestampwithlyrics.md`. The rows above are the picture cuts. The words inside a row still change at their own timestamps. Where a row says the line changes at 114.0, 234.0, or 281.0, switch the HTML line at that exact time without changing the plate.

Rain overlay `ov_rain.png`, keyed from flat green, fades in at 183.8 and out by 224.0, opacity no higher than 0.55. It is behind the type. One ink tear `ov_tear.png` may fall once across `plate_24_eyes.png` between 250 and 254. No other overlays.

## Build notes

- React function components, JavaScript, CSS. One clock hook. One timeline module. One stage component.
- Do not assign refs during render.
- Preload the paper images on mount.
- The audio element is created on mount, before any query-string autoplay experiment. Clean it up on unmount.
- Keep the implementation small. The timeline data is the product. Do not add a scene editor.
- When the film is done, the last frame holds on `plate_27_end.png` and the audio is paused.

## Done when

- A gesture starts the song and the picture together.
- Seeking keeps the words, the plate, and the audio on the same time.
- At 4:49 both are paused on the empty end plate.
- The sung word is maroon and sits in the empty paper, in a different place on different shots.
- Krishna does not appear before 0:20, and whenever he appears he is leaving.
- No gold caption bar, no photographic cutout edge, no invented credit names.
- Reduced motion still shows the right plate and the right words.

---

# Part B — image prompts

## How to generate

1. Generate `ref_radha.png` and `ref_krishna.png` first. Every later plate that includes them is an edit: attach the reference files named on that plate.
2. Then generate the plates that have no people. They need no attachment.
3. Then generate the plates that attach Radha, Krishna, or both.
4. Generate the two green overlays last.
5. Set the ratio in Nano Banana Pro to the ratio on the plate. Allowed ratios are only 16:9, 4:3, 1:1, 3:4, and 9:16. These prompts use 16:9, 3:4, and 1:1.
6. Export PNG at 2K. Save to `assets/paper/` with the exact file name.
7. If a face drifts, regenerate that plate as an edit of the reference. Do not accept a new face.
8. No plate may contain writing. If letters appear, regenerate.

## Style lock

Use this look on every plate except the two green overlays.

Warm ivory handmade paper, about the color of pale tea, with soft vertical fibers and a little natural speckle. The drawing is black ink with dry brush and stipple, plus a small amount of maroon wash and indigo wash. It is a modern Indian picture-book frame for a sad night song. It is not a photograph, not anime, not a cartoon mascot, not 3D, not flat vector, and not a charcoal photo studio. People are drawn in the same ink as the scene. They are not cut out and pasted on. Leave a large area of untouched paper where the prompt says the page must stay empty. No Hindi text, no English text, no numbers, no signature, no watermark, no logo, no border, no frame line.

Radha, when present, is the same original fictional young Indian woman: about twenty, warm medium-brown skin, quiet eyes, a small red bindi, a thin gold nose ring with a fine chain toward the ear, a long dark braid over her left shoulder woven with white jasmine, a maroon sari with a narrow gold border, and a sheer dupatta. Not a celebrity.

Krishna, when present, is the same original fictional young Indian man: about twenty, warm medium-brown skin, never blue and never grey, black hair, one peacock feather, a yellow dhoti, an indigo cloth over one shoulder, barefoot, carrying a bamboo flute. He is always leaving. Show him from the back or in profile facing away. He never looks at the viewer. He is usually small in the distance.

## 01 — ref_radha.png

- Ratio: **3:4**
- Attach: none. Generate this first.
- Save: `assets/paper/ref_radha.png`
- Used as the face and costume lock for every later plate of Radha. It is not shown full-screen in the film.

```
A vertical 3:4 character drawing on warm ivory handmade paper. Follow the style lock. Full figure of Radha standing, facing slightly to her right so we see a three-quarter view, eyes calm and lowered a little, weight on one foot. Warm medium-brown skin, small red bindi, thin gold nose ring with a fine chain, long dark braid over her left shoulder with white jasmine, maroon sari with a narrow gold border, sheer dupatta, a few thin bangles. The ink lines and the paper are the whole picture. Plain empty paper behind her, no room, no floor shadow, no extra objects, no text. Leave a margin of paper around the figure. This face is the master reference, so keep the features clear and unobstructed.
```

## 02 — ref_krishna.png

- Ratio: **3:4**
- Attach: none. Generate this second.
- Save: `assets/paper/ref_krishna.png`
- Used as the costume lock. The film never shows him looking at the camera. This sheet shows the back view that the plates will repeat.

```
A vertical 3:4 character drawing on warm ivory handmade paper. Follow the style lock. Full figure of Krishna seen from behind, walking away toward the left edge, head turned just enough that the face stays hidden. Warm medium-brown skin, not blue, not grey. Black hair, one peacock feather, yellow dhoti, indigo cloth over the left shoulder, barefoot, a bamboo flute held down in his right hand. Ink and stipple on plain empty paper. No room, no path, no second flute, no extra objects floating beside him, no floor shadow, no text. Leave a margin of paper around the figure.
```

## 03 — paper_01_blank.png

- Ratio: **16:9**
- Attach: none
- Save: `assets/paper/paper_01_blank.png`
- Used under the short musical beat near 3:54, and as the page color reference.

```
A wide 16:9 sheet of warm ivory handmade paper, nothing else. Vertical paper fibers, a soft natural speckle, slightly darker toward the edges, pale tea color, not white and not orange. No drawing, no people, no moon, no stain shaped like an object, no text, no border.
```

## 04 — plate_01_moon_sky.png

- Ratio: **16:9**
- Attach: none
- Empty region: the center, for the title
- Film: 0:00–0:06

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. In the upper center, a small ink moon and five tiny stippled stars. A very light indigo wash only behind the moon, fading into blank paper. The middle and lower page are almost empty. No people, no buildings, no flute, no text, no border. The emptiness is the subject.
```

## 05 — plate_02_flute.png

- Ratio: **16:9**
- Attach: none
- Empty region: the right half
- Film: about 0:06–0:11, and a short return at 2:00

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. One bamboo flute lies almost horizontal in the lower left, drawn in black and warm brown ink, small, about a fifth of the frame width. A faint moon sits far above it. The entire right half is untouched paper. No person, no hands, no dholak, no text, no border.
```

## 06 — plate_03_dholak.png

- Ratio: **16:9**
- Attach: none
- Empty region: the left half, for the poet credit
- Film: about 0:11–0:15

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. A small wooden dholak rests in the lower right, ink and a little maroon wash, seen from a slight angle. Six loose marigold petals are scattered just beside it, not a garland. The left half of the page is empty paper. No person, no flute, no text, no border.
```

## 07 — plate_04_face.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left half
- Film: 0:15, and later returns of the same chorus line

```
Edit the attached Radha. A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. Keep her face, age, bindi, nose ring, jasmine braid, and maroon sari. Redraw her as ink on this paper, not as a photo pasted on top. Her face and shoulder fill the right third, large, looking left, one tear on the near cheek. The left half is untouched paper. No Krishna, no room interior, no text, no border.
```

## 08 — plate_05_footprints.png

- Ratio: **16:9**
- Attach: none
- Empty region: the left half
- Film: 0:20, and later "he did not come" lines

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. A trail of bare footprints in black ink starts near the lower center and walks off the right edge. The prints get smaller and lighter as they leave, as if the person is already gone. A few prints are only stipple. The left half is empty paper. No bodies, no faces, no shoes, no text, no border.
```

## 09 — plate_06_threshold.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: lower left
- Film: 0:25

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. On the right, Radha stands at a simply drawn stone doorway, full figure but not huge, looking left. Inside the arch, far away, Krishna is small, seen from the back, walking toward a tiny moon. His feet belong on the path inside the arch. He does not look back. Warm medium-brown skin, not blue. The lower left of the page stays empty paper. No text, no border. Both figures are ink, the same pen as the doorway.
```

## 10 — plate_07_lane.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: the left side
- Film: 0:30

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. A balcony and a lane, drawn lightly. Radha is on the right balcony, small, one arm reaching left. Krishna is much smaller, farther down the lane, back view, walking away. He is clearly beyond the railing, not standing on the balcony. The left third of the page is almost empty paper. No text, no border. Not a photograph.
```

## 11 — plate_08_jhula.png

- Ratio: **16:9**
- Attach: none
- Empty region: the right half
- Film: 0:35, and one later chorus return

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. One empty wooden swing hangs from two chains in the left half. The seat is still. No person is sitting on it, and no person stands nearby. A little indigo night wash behind the swing only. The right half is untouched paper. No text, no border.
```

## 12 — plate_09_bansuri.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: the lower center, so keep drawings clear of that band
- Film: 0:40

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. A quiet grove road and a small moon. A bamboo flute lies on the dirt in the lower left, clearly dropped, with nobody touching it. Krishna is tiny, far up the road, back view, walking toward the moon. Radha is only a small waist-up figure at the far right edge, looking left. Leave the lower center of the page as open paper. No text, no border. Do not draw a second flute in his hand and another on the ground unless the one on the ground is the only flute.
```

## 13 — plate_10_hands.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left half
- Film: 0:45

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. Keep her face and maroon sari. She stands on the right beside a simply drawn wooden door and a small oil lamp. Both hands are open and empty in front of her. A flute lies on the step near the lamp, not in her hands. No Krishna. The left half is empty paper. No text, no border.
```

## 14 — plate_11_profile.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: lower center
- Film: 0:50

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. On the left, Krishna is in profile walking toward the left edge, medium size, face turned away, warm medium-brown skin, not blue, yellow dhoti, indigo cloth, one flute only, one peacock feather. On the right, Radha's face is large, looking left toward the way he went, one tear. A small moon sits in the empty paper between them. The lower center stays open. No text, no border, no extra flute floating beside his hip.
```

## 15 — plate_12_empty_path.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: lower center
- Film: 0:54 and many later holds of the empty road

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. A long empty dirt road goes toward a small moon, trees lightly inked on the left, mist as pale stipple. Krishna is not in this picture. No footprints. Radha's face is large on the right, looking left down the road, eyes wet. The lower center of the page is open paper. No text, no border.
```

## 16 — plate_13_knowing.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left half
- Film: 0:58–1:08, the line about knowing love would hurt

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. She is shown from the chest up on the right, head bowed, eyes lowered, one hand resting on her collarbone. The braid and jasmine fall forward. The feeling is a private regret, not a performance. The left half is empty paper. No Krishna, no town, no text, no border.
```

## 17 — plate_14_dindora.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the upper right, for the line
- Film: 1:08–1:18, she would have the town warned

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. A simple town lane of flat roofs and a few small arched doors, drawn lightly. Radha stands in the lower left, small, striking a handheld drum that hangs from her shoulder. A few distant townspeople are only tiny ink marks, not portraits. The upper right is open paper. No Krishna, no modern signs, no text, no border.
```

## 18 — plate_15_lover.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left half
- Film: 1:18 and 1:29, he made her a lover and left

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. She stands small on the right, alone. A thin garland is slipping out of her open hand and falling toward the ground. A short trail of footprints leaves toward the right edge. Krishna himself is not shown. The left half is empty paper. No text, no border.
```

## 19 — plate_16_nobody.png

- Ratio: **16:9**
- Attach: none
- Empty region: the right half
- Film: the lines where he does not come, from verse 1 onward

```
A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. An empty arched doorway in the left third, opening onto a blank pale path and one small moon. The lamp by the door is unlit. Nobody stands in the door, on the path, or in the distance. The right half is untouched paper. No text, no border.
```

## 20 — plate_17_thread.png

- Ratio: **16:9**
- Attach: none
- Empty region: above and below the thread, the line sits on the thread's open paper
- Film: 2:02–2:12, Rahim's thread of love

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. One long maroon thread stretches horizontally across the middle, pulled tight, a few fibers fraying at the center as if it is about to snap. The thread is thin and physical, not a ribbon logo. Everything else is empty paper. No people, no needle, no text, no border.
```

## 21 — plate_18_knot.png

- Ratio: **16:9**
- Attach: none
- Empty region: the page around the knot
- Film: 2:12–2:22, a broken thread knots and will not be the same

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. The same maroon thread has snapped. The two ends hang, and one tight, slightly ugly knot sits in the exact center. A few loose fibers stick out of the knot. The rest of the page is empty. No people, no text, no border.
```

## 22 — plate_19_knot_left.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: the left side, above the knot
- Film: 2:22 and 2:33, he tied the bond and left

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. The broken knotted maroon thread lies on the ground near the lower center. Radha stands small on the right, looking down at the knot and then toward the distance. Krishna is a tiny back view far to the right, already walking out of the page. Warm medium-brown skin, not blue. The upper left stays empty paper. No text, no border.
```

## 23 — plate_20_wood.png

- Ratio: **16:9**
- Attach: none
- Empty region: the upper left
- Film: 3:04–3:13, wood becomes coal, coal becomes ash

```
A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. Three small still-life groups in a row along the lower page, with space between them: a neat pile of unburnt sticks on the left, a few pieces of black coal in the middle, and a soft scatter of grey ash on the right. No flame yet. No person. The upper half is empty paper. No text, no border.
```

## 24 — plate_21_ash.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the right side
- Film: 3:13–3:24, she burned and became neither coal nor ash

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. Keep her face, braid, and maroon sari. She sits on the ground at the left, small, unhurt, sari wrapped close, looking at a scatter of cool ash beside her. There is no fire on her, no burn, no injury. The ash is only ash. The right half is empty paper. No Krishna, no text, no border.
```

## 25 — plate_22_pyre.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left-center
- Film: 3:24 and 3:34, he left her by a burning pyre

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. Far on the left horizon there is only a small maroon flame and a thin line of smoke, distant and symbolic. Radha sits in the right foreground, small, alive, unhurt, wrapped in her sari, watching that far flame. Do not draw a body in the fire. Do not draw burns or pain on her skin. Krishna is not in the picture. The center of the page is open paper. No text, no border.
```

## 26 — plate_23_crow.png

- Ratio: **16:9**
- Attach: `ref_radha.png` for the eyes only
- Empty region: the left and the middle
- Film: 3:56–4:05, the crow may take the body, not the eyes

```
Edit from the attached Radha only for the shape of her eyes. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. One small black crow perches on a thin bare branch in the upper left. In the lower right, draw only her two open eyes, the same eyes as the reference, calm, with a single tear. Do not draw a body, a face around the eyes, blood, wounds, or the crow touching anything. The middle of the page is empty paper. No text, no border.
```

## 27 — plate_24_eyes.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the lower edge, a low line of type
- Film: 4:05–4:16, do not eat the eyes, they still hope to see him

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. Only her two eyes, brows, and the top of the cheeks, very large, centered in the upper two thirds. Same bindi and the hint of the nose ring at the edge. One tear has not yet fallen. The lower fifth of the page is empty paper. No mouth, no full face, no Krishna, no crow, no text, no border.
```

## 28 — plate_25_eyes_apart.png

- Ratio: **16:9**
- Attach: `ref_radha.png` and `ref_krishna.png`
- Empty region: the center gap, where the line can sit
- Film: 4:16 and 4:26, he met her eyes and left

```
Edit the attached Radha and Krishna into one new drawing. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. On the right, Radha's eye is large, looking left, one tear. On the left, Krishna's eye is smaller and in profile, already turning away toward the left edge, warm medium-brown skin, not blue, a little of the peacock feather at the corner. A wide field of empty paper separates the two eyes. They are not looking at each other anymore. No full bodies, no text, no border.
```

## 29 — plate_26_last_road.png

- Ratio: **16:9**
- Attach: `ref_radha.png`
- Empty region: the left side
- Film: 4:36–4:47, the last chorus

```
Edit the attached Radha. A wide 16:9 ink drawing on warm ivory paper. Follow the style lock. An empty road in pale stipple runs to a small moon. Radha is small, seen from behind, standing at the lower right, braid and maroon sari, looking down the road. Krishna is not there. No footprints. The left half is open paper. The feeling is the end of a letter. No text, no border.
```

## 30 — plate_27_end.png

- Ratio: **16:9**
- Attach: none
- Empty region: the whole page
- Film: 4:47–4:49, hold

```
A wide 16:9 sheet of warm ivory handmade paper. Follow the style lock. A small ink moon near the top, and the same empty wooden swing from the earlier picture, very small, still, in the lower left. No person, no flute, no footprints, no text, no border. Almost all of the page is untouched paper.
```

## 31 — ov_rain.png

- Ratio: **16:9**
- Attach: none
- This one does **not** use paper. It is a motion overlay. The app removes the green.

```
A wide 16:9 overlay on a completely flat chroma green background, exact green #00FF00, the same green in every corner, no gradient, no shadow, no paper texture. Draw only thin diagonal ink rain strokes in black and pale grey, uneven, like a dry brush, spread across the frame with gaps between them. No people, no clouds, no puddles, no ground, no text. The green must stay flat so it can be keyed out.
```

## 32 — ov_tear.png

- Ratio: **1:1**
- Attach: none
- Motion overlay. The app removes the green. One tear falls across the eyes plate.

```
A square 1:1 overlay on a completely flat chroma green background, exact green #00FF00, the same in every corner, no gradient and no shadow. Draw one single ink tear, black and a little grey, vertical, with a round head and a thin tail, centered. Nothing else. No eye, no face, no paper texture, no text.
```

## Generation checklist

- [ ] ref_radha.png — 3:4
- [ ] ref_krishna.png — 3:4
- [ ] paper_01_blank.png — 16:9
- [ ] plate_01_moon_sky.png — 16:9
- [ ] plate_02_flute.png — 16:9
- [ ] plate_03_dholak.png — 16:9
- [ ] plate_04_face.png — 16:9 — attach Radha
- [ ] plate_05_footprints.png — 16:9
- [ ] plate_06_threshold.png — 16:9 — attach both
- [ ] plate_07_lane.png — 16:9 — attach both
- [ ] plate_08_jhula.png — 16:9
- [ ] plate_09_bansuri.png — 16:9 — attach both
- [ ] plate_10_hands.png — 16:9 — attach Radha
- [ ] plate_11_profile.png — 16:9 — attach both
- [ ] plate_12_empty_path.png — 16:9 — attach Radha
- [ ] plate_13_knowing.png — 16:9 — attach Radha
- [ ] plate_14_dindora.png — 16:9 — attach Radha
- [ ] plate_15_lover.png — 16:9 — attach Radha
- [ ] plate_16_nobody.png — 16:9
- [ ] plate_17_thread.png — 16:9
- [ ] plate_18_knot.png — 16:9
- [ ] plate_19_knot_left.png — 16:9 — attach both
- [ ] plate_20_wood.png — 16:9
- [ ] plate_21_ash.png — 16:9 — attach Radha
- [ ] plate_22_pyre.png — 16:9 — attach Radha
- [ ] plate_23_crow.png — 16:9 — attach Radha, eyes only
- [ ] plate_24_eyes.png — 16:9 — attach Radha
- [ ] plate_25_eyes_apart.png — 16:9 — attach both
- [ ] plate_26_last_road.png — 16:9 — attach Radha
- [ ] plate_27_end.png — 16:9
- [ ] ov_rain.png — 16:9 — flat green #00FF00
- [ ] ov_tear.png — 1:1 — flat green #00FF00

32 files. The story plates are the film. The old photographic set in `assets/intro/` is not used by this app.
