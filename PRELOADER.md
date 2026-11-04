# Preloader — sparkle.do

Brand-first loading screen built with the existing Next.js + React stack. No animation dependencies were added. The official logo SVG is used as the final art; the inline copy lives in `src/components/preloader-logo.ts`, and the first-paint fallback is `public/sparkle-do-logo.svg`.

## Files
- `src/components/Preloader.tsx` — timeline, words/goo, draw, star, reveal, audio, state.
- `src/styles/preloader.css` — layout, masks, dots, opening and reduced motion.
- `src/app/layout.tsx` — server-rendered preloader markup and critical first-paint CSS.
- `src/components/HeroPencil3D.tsx` — emits `sparkle:ready` and `window.__appReady = true` after the first rendered 3D frame.
- `PRELOADER.md` — this note.

## Force / reset
- Full intro: append `?intro=1` to the URL.
- First-visit state: `sessionStorage.removeItem("sparkle:preloader-seen")`, then reload.
- Repeat visit: words and goo are skipped; the final logo, star and loading dots still run.
- The animation shares one config object at the top of `Preloader.tsx`:
  - `CONFIG.timeline` — labels `word1`, `melt1`, `word2`, `melt2`, `word3`, `melt3`, `draw`, `wordmark`, `star`, `open`.
  - `CONFIG.durations` — word/melt/draw/star/open/dots/safety values.

## Sound
`playPlin()` synthesizes three sines at 1760 Hz, 2637 Hz and 3520 Hz through a gain envelope. The master stays at 0.22. If the AudioContext is not `running` when the star appears, the sound is skipped silently. A pointer/key interaction before the star unlocks it. The ambient site soundtrack is separate.

## Safety and fallbacks
- Readiness = fonts + `window.load` + hero `sparkle:ready` + decode of hero images, with a 10s hard timeout and a global 10s finish timer.
- A 12s CSS fail-safe hides the overlay and unlocks scroll if JavaScript stalls.
- The skip button is keyboard-accessible; body scroll is locked and site regions are `inert` while active, then restored.
- No JavaScript: the preloader is hidden by the existing `<noscript>` styles.
- `prefers-reduced-motion`: static logo, dots with fade, simple fade opening; no goo, no draw, no star sound.
- If assets are slow after the star, three wine dots appear below the tagline after 250ms and the intro waits; the page opens as soon as ready.

## Testing note
Verified in Chromium (desktop 1440×900, wide 1875×805, mobile 390×844), first visit, repeat visit, `?intro=1`, slow image, reduced motion, no-JS and skip. Firefox/WebKit binaries were not installed in this environment, so those engines remain a manual test gap.
