const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function folderPath(w: number, h: number): string {
  const th = Math.min(40, h / 4);
  const tw = Math.min(150, w * 0.42);
  const tr = 14;
  const r = Math.min(26, w / 6);
  const j = 10;
  return `path("M0 ${tr} A${tr} ${tr} 0 0 1 ${tr} 0 L${tw - tr} 0 A${tr} ${tr} 0 0 1 ${tw} ${tr} L${tw} ${th - j} A${j} ${j} 0 0 0 ${tw + j} ${th} L${w - r} ${th} A${r} ${r} 0 0 1 ${w} ${th + r} L${w} ${h - r} A${r} ${r} 0 0 1 ${w - r} ${h} L${r} ${h} A${r} ${r} 0 0 1 0 ${h - r} Z")`;
}

export function initFaq(): void {
  const section = document.querySelector<HTMLElement>("#faq");
  const folder = document.querySelector<HTMLElement>("[data-folder]");
  const shape = document.querySelector<HTMLElement>(".folder-shape");
  const sil = document.querySelector<HTMLElement>("[data-folder-sil]");
  const card = document.querySelector<HTMLElement>("[data-folder-card]");
  const rows = Array.from(document.querySelectorAll<HTMLElement>("[data-row]"));
  const fly = document.querySelector<HTMLElement>("[data-fly]");
  const flyPhoto = document.querySelector<HTMLElement>("[data-fly-photo]");
  const formList = document.querySelector<HTMLElement>(".formats-list");
  if (!section || !folder || !shape || !sil || !card || !rows.length || !fly || !flyPhoto) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const updatePath = () => {
    const w = sil.offsetWidth;
    const h = sil.offsetHeight;
    if (w && h) sil.style.clipPath = folderPath(w, h);
  };

  /* ---------- accordion ---------- */
  rows[0]?.classList.add("open");

  rows.forEach((row) => {
    const button = row.querySelector<HTMLButtonElement>(".faq-btn");
    if (!button) return;
    button.addEventListener("click", () => {
      const open = !row.classList.contains("open");
      if (open) {
        rows.forEach((other) => {
          other.classList.remove("open");
          other.querySelector(".faq-btn")?.setAttribute("aria-expanded", "false");
        });
      }
      row.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
      if (open) {
        row.querySelectorAll(".tiles span").forEach((tile, index) => {
          tile.classList.remove("go");
          void (tile as HTMLElement).offsetWidth;
          window.setTimeout(() => tile.classList.add("go"), index * 90);
        });
      }
    });
  });

  /* ---------- the flight ---------- */
  let raf = 0;
  let lastScroll = -1;

  const openFormat = () =>
    document.querySelector<HTMLElement>(".format:hover") ??
    formList?.querySelectorAll<HTMLElement>(".format")[2] ??
    null;

  const off = () => window.innerWidth < 1024 || reduced.matches;

  const reset = () => {
    fly.style.display = "none";
    card.classList.add("on");
  };

  const frame = () => {
    raf = 0;
    if (off()) {
      reset();
      return;
    }
    const sy = window.scrollY || window.pageYOffset;
    if (Math.abs(sy - lastScroll) < 0.5) return;
    lastScroll = sy;

    const vh = window.innerHeight;
    const fr = folder.getBoundingClientRect();
    const p = clamp((vh - fr.top) / (vh * 0.6), 0, 1);

    if (p <= 0 || p >= 0.66) {
      if (p >= 0.66) {
        fly.style.display = "none";
        card.classList.add("on");
      } else {
        reset();
      }
      return;
    }

    const source = openFormat();
    if (!source) {
      reset();
      return;
    }
    const pass = source.querySelector<HTMLElement>("[data-pass]");
    if (!pass) {
      reset();
      return;
    }

    const sr = pass.getBoundingClientRect();
    const srShape = shape.getBoundingClientRect();
    const a = inOut(clamp(p / 0.62, 0, 1));
    const flip = inOut(clamp((p - 0.08) / 0.46, 0, 1)) * 180;
    const fade = clamp((p - 0.57) / 0.07, 0, 1);

    const w = lerp(sr.width, srShape.width, a);
    const h = lerp(sr.height, srShape.height, a);
    const x = lerp(sr.left, srShape.left, a);
    const y = lerp(sr.top, srShape.top, a) - Math.sin(Math.PI * a) * 80;

    fly.style.display = "block";
    fly.style.width = `${w}px`;
    fly.style.height = `${h}px`;
    flyPhoto.style.clipPath = folderPath(w, h);
    flyPhoto.style.opacity = String(1 - fade);
    fly.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) perspective(1400px) rotate(${(Math.sin(Math.PI * a) * -6).toFixed(2)}deg) rotateY(${flip.toFixed(1)}deg)`;

    card.classList.toggle("on", fade > 0);
  };

  const start = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  updatePath();
  if (window.ResizeObserver) {
    new ResizeObserver(() => {
      updatePath();
      start();
    }).observe(sil);
  } else {
    window.addEventListener("resize", updatePath);
  }

  window.addEventListener("scroll", start, { passive: true });
  window.addEventListener("resize", () => {
    lastScroll = -1;
    start();
  });

  if (off()) card.classList.add("on");
  start();
}
