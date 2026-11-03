export function initHow(): void {
  const section = document.querySelector<HTMLElement>("[data-how]");
  const visual = document.querySelector<HTMLElement>("[data-how-visual]");
  const stepsBox = document.querySelector<HTMLElement>("[data-how-steps]");
  const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-step]"));
  if (!section || !visual || !stepsBox || !steps.length) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let raf = 0;

  const update = () => {
    raf = 0;
    const mobile = window.innerWidth < 901;
    const vh = window.innerHeight;
    let p = 1;

    if (!mobile && !reduced.matches) {
      const stepsRect = stepsBox.getBoundingClientRect();
      const span = Math.max(1, stepsRect.height + vh * 0.18);
      p = Math.max(0, Math.min(1, (vh * 0.82 - stepsRect.top) / span));
    }

    visual.style.setProperty("--fan", p.toFixed(3));
    stepsBox.style.setProperty("--p", p.toFixed(3));

    const active = Math.min(steps.length - 1, Math.floor(p * steps.length));
    steps.forEach((step, index) => {
      step.classList.toggle("is-active", mobile || reduced.matches || index === active);
    });
  };

  const request = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  reduced.addEventListener("change", request);
  update();
}
