# Goverdhan Divine Scape — Layered Element Prompts (0:00 – 0:05)

Yeh file **Tareeqa 2 (Layered Elements + Real Movement)** ke liye banayi gayi hai.
Isme saare visual parts alag-alag layers (elements) ke roop me banaye jayenge, jisme **Flat Green `#00FF00`** background hoga. Isse hamara web player unhe key-out karke real-time animation de sakega:
1. **Goverdhan Parvat:** Upar se niche sketch hota hua reveal hoga (peak se shuru hokar base tak ink sketch drawing).
2. **Suraj:** Goverdhan Parvat ke piche se physical motion me upar uday hoga (`translateY` motion).
3. **Panchi:** Aakash me real motion me udte hue nikalenge (`translateX` flight).
4. **Channel Credit:** "Goverdhan Divine Scape" clean serif HTML type me Goverdhan ke upar shaan se aayega.

---

## Summary Table

| # | Element Name | Ratio | Field / Background | Movement / Role in Film |
|---|---|---|---|---|
| 1 | `bg_dawn_paper_sky.png` | 16:9 | Warm Ivory Paper `#efe2d0` | Background canvas — shant subah ka aakash aur paper texture |
| 2 | `el_goverdhan_parvat.png` | 16:9 | Flat Green `#00FF00` | **Goverdhan Parvat** — Upar se niche sketch hota hua draw hoga |
| 3 | `el_rising_sun.png` | 16:9 | Flat Green `#00FF00` | **Ugta hua Suraj** — Parvat ke piche se dheere-dheere upar uthega |
| 4 | `el_flying_birds.png` | 16:9 | Flat Green `#00FF00` | **Udte hue Panchi** — Aakash me bayen se dayen (left to right) glide karenge |
| 5 | `plate_goverdhan_complete_dawn.png` | 16:9 | Warm Ivory Paper `#efe2d0` | **Full Master Frame** — Parvat, sunrise aur panchi ka complete combined plate |

---

## Detailed Image Prompts

### 1. bg_dawn_paper_sky (Base Canvas)
* **File Name:** `assets/paper/bg_dawn_paper_sky.png`
* **Ratio:** **16:9**
* **Field:** Warm Ivory Paper (`#efe2d0`)
* **Role:** Yeh sabse peeche ka canvas hai jiske upar suraj ugega aur parvat sketch hoga.

```text
A wide 16:9 background plate of warm ivory handmade paper, hex color around #efe2d0, with natural vertical fibers and delicate paper speckle. Across the lower half, a soft, subtle morning dawn gradient wash in pale saffron and warm amber whispers across the horizon, fading into calm pale paper sky above. No drawing, no mountains, no sun, no birds, no people, no text, no border. Just a beautiful, serene dawn atmosphere on textured paper.
```

---

### 2. el_goverdhan_parvat (Top-to-Bottom Sketch Element)
* **File Name:** `assets/paper/el_goverdhan_parvat.png`
* **Ratio:** **16:9**
* **Field:** Flat Chroma Green `#00FF00`
* **Role:** Is element ko web app me **upar se niche sketch effect** (`clip-path` vertical reveal) ke sath draw kiya jayega, jisse aisa lagega ki artist parvat ki choti se lekar talhati tak live sketch bana raha hai.

```text
A wide 16:9 illustration of the sacred Goverdhan Parvat (Goverdhan hill) drawn in fine black Indian ink line art, contour hatching, and dry-brush stipple. The sacred hill spans across the lower and middle frame with majestic rocky crests, ancient sacred boulders, stone crevices, and delicate silhouettes of kadamba shrubs at the base. The drawing style is a traditional devotional ink sketch with rich textures. The entire sky and area above the mountain ridge is one flat, solid, uniform chroma green background, hex #00FF00, the exact same green in every corner with no gradients, no shadows on the green, and no paper texture on the green. No sun, no birds, no people, no text. Clean, crisp silhouette edges suitable for chroma-key extraction.
```

---

### 3. el_rising_sun (Animated Sunrise Element)
* **File Name:** `assets/paper/el_rising_sun.png`
* **Ratio:** **16:9**
* **Field:** Flat Chroma Green `#00FF00`
* **Role:** Yeh suraj Goverdhan Parvat ke piche position hoga aur player me **dheere-dheere upar chadhega** (`translateY`), jisse real sunrise ka cinematic feel aayega.

```text
A wide 16:9 element of a divine radiant morning sun rising in the sky. A glowing circular sun disc surrounded by soft golden-saffron dawn radiance, fine hand-drawn ink sunbeams, and warm amber aura in a spiritual Indian picture-book style. The sun is positioned in the upper-middle area. The entire surrounding background is one flat, solid, uniform chroma green, hex #00FF00, the exact same pure green in every corner with no paper texture, no mountain, no clouds, no text, no border. The green field must remain completely flat and clean so it can be chroma-keyed out seamlessly.
```

---

### 4. el_flying_birds (Animated Flight Element)
* **File Name:** `assets/paper/el_flying_birds.png`
* **Ratio:** **16:9**
* **Field:** Flat Chroma Green `#00FF00`
* **Role:** Yeh panchi aakash me **bayen se dayen (left to right)** animate honge, jaise subah subah parvat ke upar ud rahe hon.

```text
A wide 16:9 motion overlay showing a graceful flock of sacred birds (Indian cranes and parrots) flying across the upper sky in a dynamic diagonal formation. Each bird is rendered with fluid, expressive black ink brushstrokes capturing wings in mid-flight and gliding poses. The entire background around the birds is one flat, solid, uniform chroma green, hex #00FF00, the same pure green in all corners with no gradients, no shadows, no sky, no ground, no text. Crisp ink silhouette edges ready for chroma keying.
```

---

### 5. plate_goverdhan_complete_dawn (Full Combined Masterplate)
* **File Name:** `assets/paper/plate_goverdhan_complete_dawn.png`
* **Ratio:** **16:9**
* **Field:** Warm Ivory Paper (`#efe2d0`)
* **Role:** Ek complete, perfectly balanced all-in-one artwork jisme Goverdhan Parvat, ugta hua suraj aur udte hue panchi sab ek sath warm paper par hain. Yeh master reference aur direct plate dono ke roop me kaam karta hai.

```text
A wide 16:9 master devotional illustration on warm ivory handmade paper (#efe2d0) with fine vertical fibers. In the lower half, the sacred Goverdhan Parvat stands majestically with detailed black ink contours, sacred boulders, and dry-brush stipple. Directly behind the holy ridge, a radiant golden-saffron morning sun rises, casting divine amber washes and long morning ink shadows across the crevices. In the clear morning sky above, a flock of birds soars peacefully across the dawn horizon. The upper region leaves tasteful open paper space for title and channel presentation. Pure spiritual picture-book aesthetic of Braj. No human figures, no modern elements, no text, no border.
```

---

## Web App Me Yeh Kaise Kaam Karega (Layer Architecture)

```
[Layer 5 - Top]     HTML Typography & Channel Logo: "Goverdhan Divine Scape"
[Layer 4 - Front]   el_flying_birds.png (Chroma keyed -> animates left to right translateX)
[Layer 3 - Mid]     el_goverdhan_parvat.png (Top-to-bottom sketch reveal: peak to base)
[Layer 2 - Behind]  el_rising_sun.png (Chroma keyed -> animates rising upward translateY)
[Layer 1 - Base]    bg_dawn_paper_sky.png (Warm handmade paper dawn canvas)
```

1. **Second 0.0:** Base canvas par parvat ka ink sketch **upar choti (peak) se shuru hokar niche base tak draw hota hua** appear hoga (0.0s se 1.2s). Channel name *"Goverdhan Divine Scape"* aakash me shaan se display hoga.
2. **Second 1.2 – 3.0:** Goverdhan Parvat ke piche se suraj **dheere-dheere upar nikalta hai** (`translateY`), aur aakash me golden roshni failti hai. Credit *"प्रस्तुत है"* aayega.
3. **Second 2.5 – 5.0:** Panchiyon ka jhund aakash me **udta hua nikalta hai** (`translateX`), aur song title *"मुझे अपना बनाकर छोड़ गए"* screen par aayega.
