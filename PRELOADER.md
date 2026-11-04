# Preloader — sparkle.do (v2)

The loader is an equation that becomes the mark:
**Rápido + Eficiente + Elegante = sparkle.do**.

## Files
- `src/components/Preloader.tsx` — single clock/timeline, equation layout, goo, draw, star, reveal, audio.
- `src/components/preloader-logo.ts` — inlined official logo with `sd-*` ids, per-letter draw masks and centerlines.
- `src/styles/preloader.css` — first-paint shell, equation/goo styles, site gating, reveal.
- `src/app/layout.tsx` — server-rendered preloader + critical first-paint CSS.
- `src/components/HeroPencil3D.tsx` — emits `sparkle:ready` after the first 3D frame.
- `public/sparkle-do-logo.svg` — exact official fallback/final art.

## Debug API
Open `/?debug=1` (it does not auto-play):

```js
await window.__preloader.seek(3.6); // freeze at seconds
window.__preloader.play();          // resume the clock
window.__preloader.time();
```

`seek(8.4)` opens the site and removes the loader. Screenshots were checked at
`0.2, 0.9, 1.7, 2.6, 3.1, 3.6, 4.0, 4.4, 4.9, 5.4, 5.9, 6.6, 7.2, 7.8, 8.4`
on 1440×900 and 390×844.

## Timing
All timings are in `CONFIG.timings` / `CONFIG.durations` at the top of `Preloader.tsx`:

- equation `0.35–3.3`
- goo `3.3–4.6`
- draw `4.6–6.5`
- wordmark + tagline `6.5–7.0`
- star `7.0–7.45`
- pause + circular reveal to `8.4`

The equation is one SVG. Its characters are measured only after
`document.fonts.ready`, fitted to 88% of the viewBox, then recentered as tokens
arrive. On mobile the same SVG stacks the equation in three lines.

## Force / repeat
- Full intro: `?intro=1`.
- Reset first-visit state: `sessionStorage.removeItem("sparkle:preloader-seen")`, reload.
- Repeat visits: `sessionStorage` skips words/goo/draw and shows the mark, star and dots.

## Sound
`playPlin()` synthesizes 1760 / 2637 / 3520 Hz sines through a 0.22 master gain.
No file is downloaded. If the AudioContext is not `running` at the star frame,
the sound is skipped silently; a pointer/key before that unlocks it.

## Safety
- Readiness = fonts + `window.load` + `sparkle:ready` + hero image decode.
- After the star, dots appear if assets are still loading.
- Hard 10s timeout and a 12s CSS fail-safe.
- `Pular` is keyboard accessible; body scroll and `inert` are restored on close.
- Reduced motion: static logo, dots with fade, simple fade open.
- No JavaScript: the `<noscript>` rules hide the loader.

## Verification
Chromium tested: 1440×900, 390×844, live first visit, repeat visit, debug seek/play,
slow image + dots, reduced motion, no-JS, skip, timeout, `preloader:done`, nav after
60% of the reveal. Firefox/WebKit binaries were not installed in this environment,
so those engines remain a manual test gap.

## Performance gate
The goo filter is used at full strength when a frame fits the budget. If the
first goo frame takes more than 18ms, `.low-fx` removes the SVG filter and keeps
the word-drop/mass timing (the degraded crossfade path). On headless Chromium
the full filter measured 43fps and the degraded path measured 59–61fps; the
debug screenshots still show the full goo because `seek()` is paused. A screen
recording of the first visit was captured at `/tmp/preloader-video/` during the
test run. Real Safari/Firefox performance was not measurable in this container.
