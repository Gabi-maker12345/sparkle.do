export function initPencil(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero-pencil]");
  const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
  if (!hero || !stage) return;

  const blocks = Array.from(hero.querySelectorAll<HTMLElement>("[data-story-block]"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const ZOOM_SCALE = 28;
  let raf = 0;
  let total = 1;
  let finalScale = 0.65;

  const clamp = (value: number) => Math.max(0, Math.min(1, value));
  const smooth = (value: number) => value * value * (3 - 2 * value);

  const measure = () => {
    total = Math.max(1, hero.offsetHeight - window.innerHeight);
    finalScale =
      parseFloat(getComputedStyle(stage).getPropertyValue("--final-scale")) || 0.65;
  };

  const apply = (p: number) => {
    stage.style.setProperty("--p", p.toFixed(4));

    const enter = smooth(clamp(p / 0.18));
    const zoom = Math.pow(clamp(p / 0.18), 5);
    const exit = smooth(clamp((p - 0.78) / 0.12));
    stage.style.setProperty("--exit", exit.toFixed(4));

    const scale =
      p < 0.18
        ? 0.78 + (ZOOM_SCALE - 0.78) * zoom
        : p < 0.76
          ? ZOOM_SCALE
          : ZOOM_SCALE + (finalScale - ZOOM_SCALE) * exit;
    const rz =
      p < 0.18
        ? -26 + (-90 + 26) * enter
        : p < 0.76
          ? -90
          : -90 + 88 * exit;
    const ry =
      p < 0.18
        ? 32 + 12 * enter
        : p < 0.76
          ? 44
          : 44 + (14 - 44) * exit;
    const rx = p < 0.76 ? 6 : 6 * (1 - exit);

    stage.style.setProperty("--pencil-scale", scale.toFixed(4));
    stage.style.setProperty("--rot-x", `${rx.toFixed(3)}deg`);
    stage.style.setProperty("--rot-y", `${ry.toFixed(3)}deg`);
    stage.style.setProperty("--rot-z", `${rz.toFixed(3)}deg`);

    const step = p >= 0.62 ? 3 : p >= 0.42 ? 2 : p >= 0.22 ? 1 : 0;
    const chapters = step > 0 && p < 0.78;

    hero.classList.toggle("is-panel", p >= 0.22);
    hero.classList.toggle("is-world", p >= 0.22 && p < 0.78);
    hero.classList.toggle("is-chapters", chapters);
    hero.classList.toggle("is-exit", p >= 0.78);
    hero.classList.toggle("is-exiting", p >= 0.78 && p < 0.9);
    hero.classList.toggle("is-final", p >= 0.9);
    hero.classList.toggle("is-step-1", chapters && step === 1);
    hero.classList.toggle("is-step-2", chapters && step === 2);
    hero.classList.toggle("is-step-3", chapters && step === 3);

    blocks.forEach((block, index) => {
      block.classList.toggle("is-active", chapters && index === step - 1);
    });

    window.dispatchEvent(
      new CustomEvent("sparkle:pencil", { detail: { p } }),
    );
  };

  const update = () => {
    raf = 0;

    if (reduced.matches) {
      stage.style.setProperty("--p", "1");
      stage.style.setProperty("--exit", "0");
      hero.classList.add("is-panel");
      blocks.forEach((block) => block.classList.add("is-active"));
      return;
    }

    const rect = hero.getBoundingClientRect();
    apply(Math.max(0, Math.min(1, -rect.top / total)));
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  const onResize = () => {
    measure();
    request();
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", onResize);
  reduced.addEventListener("change", onResize);
  measure();
  update();
}
