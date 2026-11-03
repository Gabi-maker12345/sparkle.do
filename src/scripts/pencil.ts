export function initPencil(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero-pencil]");
  const stage = document.querySelector<HTMLElement>("[data-hero-stage]");
  if (!hero || !stage) return;

  const blocks = Array.from(hero.querySelectorAll<HTMLElement>("[data-story-block]"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;
  let total = 1;

  const measure = () => {
    total = Math.max(1, hero.offsetHeight - window.innerHeight);
  };

  const clamp = (value: number) => Math.max(0, Math.min(1, value));

  const apply = (p: number) => {
    stage.style.setProperty("--p", p.toFixed(4));

    const rawFace = clamp((p - 0.12) / 0.18);
    const face = rawFace * rawFace;
    stage.style.setProperty("--face", face.toFixed(4));

    const exit = clamp((p - 0.76) / 0.14);
    stage.style.setProperty("--exit", exit.toFixed(4));

    const step = p >= 0.62 ? 3 : p >= 0.48 ? 2 : p >= 0.32 ? 1 : 0;
    const chapters = step > 0 && p < 0.76;
    const panel = p >= 0.3;

    hero.classList.toggle("is-panel", panel);
    hero.classList.toggle("is-chapters", chapters);
    hero.classList.toggle("is-exit", p >= 0.76);
    hero.classList.toggle("is-final", p >= 0.9);
    hero.classList.toggle("is-step-1", chapters && step === 1);
    hero.classList.toggle("is-step-2", chapters && step === 2);
    hero.classList.toggle("is-step-3", chapters && step === 3);

    blocks.forEach((block, index) => {
      block.classList.toggle("is-active", chapters && index === step - 1);
    });
  };

  const update = () => {
    raf = 0;

    if (reduced.matches) {
      stage.style.setProperty("--p", "1");
      stage.style.setProperty("--face", "1");
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
