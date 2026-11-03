import { formats } from "../data/site";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function initRoll(): void {
  const actor = document.querySelector<HTMLElement>("[data-roll]");
  const card = document.querySelector<HTMLElement>("[data-roll-card]");
  const hero = document.querySelector<HTMLElement>("#showcase");
  const section = document.querySelector<HTMLElement>("#formats");
  const list = document.querySelector<HTMLElement>(".formats-list");
  if (!actor || !card || !hero || !section || !list) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const last = formats[formats.length - 1];
  const eyebrow = card.querySelector<HTMLElement>("[data-roll-eyebrow]");
  const to = card.querySelector<HTMLElement>("[data-roll-to]");
  const title = card.querySelector<HTMLElement>("[data-roll-title]");
  if (eyebrow) eyebrow.textContent = last.eyebrow.replace("Passe de embarque · ", "");
  if (to) to.textContent = last.to;
  if (title) title.textContent = last.title;

  const BASE_W = 365;
  const BASE_H = 476;

  let raf = 0;
  let lastScroll = -1;

  const measure = () => {
    const mid = document.querySelector<HTMLElement>("[data-mid]");
    const cube = mid?.querySelector<HTMLElement>(".cube") ?? mid;
    const cubeRect = (cube ?? hero).getBoundingClientRect();
    const start = {
      x: cubeRect.left + cubeRect.width / 2,
      y: cubeRect.top + cubeRect.height / 2,
      size: Math.min(cubeRect.width, cubeRect.height) * 0.86,
    };
    const pass = section.querySelectorAll<HTMLElement>("[data-pass]");
    const target = pass[pass.length - 1];
    const pr = target.getBoundingClientRect();
    const end = {
      x: pr.left + pr.width / 2,
      y: pr.top + pr.height / 2,
      w: pr.width || BASE_W,
      h: pr.height || BASE_H,
    };
    return { start, end };
  };

  const off = () =>
    window.innerWidth < 1024 ||
    document.body.classList.contains("sqs-edit-mode-active") ||
    reduced.matches;

  const frame = () => {
    raf = 0;
    if (!actor || !card) return;
    if (off()) {
      actor.style.display = "none";
      return;
    }
    const sy = window.scrollY || window.pageYOffset;
    if (Math.abs(sy - lastScroll) < 0.5) {
      raf = requestAnimationFrame(frame);
      return;
    }
    lastScroll = sy;

    const vh = window.innerHeight;
    const top = section.getBoundingClientRect().top + sy;
    const startPoint = hero.getBoundingClientRect().top + sy;
    const endOffset = Math.min(vh * 0.3, 260);
    const p = clamp((sy - startPoint) / Math.max(1, top - startPoint - endOffset), 0, 1);

    if (p <= 0.015 || p >= 0.985) {
      actor.style.display = "none";
      raf = requestAnimationFrame(frame);
      return;
    }

    actor.style.display = "block";
    actor.style.opacity = String(clamp(p / 0.04, 0, 1));

    const { start, end } = measure();
    const q = inOut(clamp((p - 0.04) / 0.7, 0, 1));
    const x = lerp(start.x, end.x, q);
    const y = lerp(start.y, end.y, q) - Math.sin(Math.PI * q) * 18;
    const scale = lerp(start.size / BASE_W, end.w / BASE_W, q);
    const tip = inOut(clamp((p - 0.15) / 0.55, 0, 1));
    const rx = lerp(-11, 0, tip);
    const ry = lerp(-9, 0, tip);

    card.style.transform = `translate3d(${(x - (BASE_W * scale) / 2).toFixed(1)}px, ${(y - (BASE_H * scale) / 2).toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    raf = requestAnimationFrame(frame);
  };

  const startRoll = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  window.addEventListener("resize", startRoll);
  if (document.fonts?.ready) {
    void document.fonts.ready.then(startRoll);
  }
  window.addEventListener("scroll", startRoll, { passive: true });
  startRoll();
}
