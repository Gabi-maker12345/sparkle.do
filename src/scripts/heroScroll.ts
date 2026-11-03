/**
 * The hero is a three-chapter sequence. Native wheel/touch speed can skip an
 * entire chapter in one flick, so inside the hero we accumulate the requested
 * distance and spend it at a bounded speed. Outside the hero nothing changes.
 */
export function initHeroScroll(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero-pencil]");
  if (!hero) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;

  const MAX_SPEED = 430; // px per second while the hero owns the viewport
  let raf = 0;
  let last = 0;
  let target = window.scrollY;
  let touchId: number | null = null;
  let touchStartY = 0;
  let touchStartScroll = 0;
  let dragging = false;

  const end = () =>
    Math.max(0, hero.offsetTop + hero.offsetHeight - window.innerHeight);

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const max = end();
    target = clamp(target, 0, max);
    const y = window.scrollY;
    const diff = target - y;

    if (Math.abs(diff) < 0.8) {
      window.scrollTo({ top: target, behavior: "instant" });
      raf = 0;
      return;
    }

    window.scrollTo({
      top: y + Math.sign(diff) * Math.min(Math.abs(diff), MAX_SPEED * dt),
      behavior: "instant",
    });
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const onWheel = (event: WheelEvent) => {
    if (reduced.matches || event.ctrlKey || event.metaKey || event.deltaY === 0) return;

    const max = end();
    const y = window.scrollY;
    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    if (y >= max - 1 && delta > 0) return;
    if (y <= 0 && delta < 0) return;
    if (y > max + 1) return;

    event.preventDefault();
    if (!raf) target = y;
    target = clamp(target + delta, 0, max);
    start();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (reduced.matches || event.touches.length !== 1) return;
    const max = end();
    const y = window.scrollY;
    if (y >= max - 1) return;

    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    target = y;
    touchId = event.touches[0].identifier;
    touchStartY = event.touches[0].clientY;
    touchStartScroll = y;
    dragging = true;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (reduced.matches || !dragging) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId);
    if (!touch) return;

    const delta = touchStartY - touch.clientY;
    if (Math.abs(delta) < 4) return;

    event.preventDefault();
    target = clamp(touchStartScroll + delta * 1.15, 0, end());
    start();
  };

  const stopTouch = () => {
    dragging = false;
    touchId = null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (reduced.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    const origin = event.target as HTMLElement | null;
    if (origin?.closest("a, button, input, textarea, select, [contenteditable]")) return;

    let delta = 0;
    if (event.key === "ArrowDown") delta = 80;
    else if (event.key === "ArrowUp") delta = -80;
    else if (event.key === "PageDown" || event.key === " ") delta = window.innerHeight * 0.55;
    else if (event.key === "PageUp") delta = -window.innerHeight * 0.55;
    else return;

    const max = end();
    const y = window.scrollY;
    if ((y >= max - 1 && delta > 0) || (y <= 0 && delta < 0) || y > max + 1) return;

    event.preventDefault();
    if (!raf) target = y;
    target = clamp(target + delta, 0, max);
    start();
  };

  const cancelForJump = (event: Event) => {
    const origin = event.target as Element | null;
    if (!origin?.closest('a[href^="#"]')) return;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    target = window.scrollY;
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", stopTouch);
  window.addEventListener("touchcancel", stopTouch);
  window.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", cancelForJump);
  window.addEventListener("resize", () => {
    target = clamp(target, 0, end());
  });
  reduced.addEventListener("change", () => {
    if (!reduced.matches) return;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  });
}
