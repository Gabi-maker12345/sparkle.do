import { samples } from "../data/site";

type State = {
  A: number;
  T: number;
  v: number;
  step: number | null;
  drag: boolean;
  mx: number;
  my: number;
  tx: number;
  ty: number;
  raf: number;
  last: number;
  visible: boolean;
  timer: number;
  lastX: number;
  lastT: number;
  downX: number;
  downY: number;
  downT: number;
};

const mod = (a: number, n: number) => ((a % n) + n) % n;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function initCube(): void {
  const root = document.querySelector<HTMLElement>("[data-cube]");
  if (!root) return;

  const stage = root.querySelector<HTMLElement>("[data-stage]")!;
  const mid = root.querySelector<HTMLElement>("[data-mid]")!;
  const body = root.querySelector<HTMLElement>("[data-cube-body]")!;
  const hit = root.querySelector<HTMLButtonElement>("[data-hit]")!;
  const hint = root.querySelector<HTMLElement>("[data-hint]");
  const meta = root.querySelector<HTMLElement>("[data-meta]")!;
  const meta1 = root.querySelector<HTMLElement>("[data-meta-1]")!;
  const meta2 = root.querySelector<HTMLElement>("[data-meta-2]")!;
  const tLeft = root.querySelector<HTMLElement>("[data-ticket-left]");
  const tRight = root.querySelector<HTMLElement>("[data-ticket-right]");
  const tLeftWord = root.querySelector<HTMLElement>("[data-ticket-left-word]");
  const tRightWord = root.querySelector<HTMLElement>("[data-ticket-right-word]");
  const intro = root.querySelector<HTMLElement>(".hero-intro");
  const chipsBox = root.querySelector<HTMLElement>(".hero-chips");
  const faces = Array.from(root.querySelectorAll<HTMLElement>("[data-face]"));
  const shades = faces.map((face) => face.querySelector<HTMLElement>(".cube-shade"));
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-chip]"));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = mid.clientWidth || 403;


  const state: State = {
    A: 0,
    T: 0,
    v: 0,
    step: null,
    drag: false,
    mx: 0,
    my: 0,
    tx: 0,
    ty: 0,
    raf: 0,
    last: 0,
    visible: true,
    timer: 0,
    lastX: 0,
    lastT: 0,
    downX: 0,
    downY: 0,
    downT: 0,
  };

  const progress = () => {
    if (reduced) return 0;
    const r = stage.getBoundingClientRect();
    return clamp(-r.top / (r.height * 0.85), 0, 1);
  };

  const fitWord = (el: HTMLElement | null, text: string) => {
    if (!el) return;
    el.textContent = text;
    el.style.fontSize = "100px";
    const measured = el.scrollWidth || 1;
    const size = Math.max(28, Math.min(46, (220 * 100) / measured));
    el.style.fontSize = `${size.toFixed(1)}px`;
  };

  function applyData(step: number, animate: boolean) {
    const d = samples[mod(step, samples.length)];
    faces.forEach((face, k) => {
      const item = samples[mod(k, samples.length)];
      const img = face.querySelector<HTMLImageElement>("img");
      const label = face.querySelector<HTMLElement>("[data-face-label]");
      if (img && img.getAttribute("src") !== item.cover) img.src = item.cover;
      if (label) label.textContent = item.field;
    });

    hit.setAttribute("aria-label", `Ver portfólio de ${d.name} — ${d.field}`);
    chips.forEach((chip, i) => chip.setAttribute("aria-pressed", String(i === mod(step, samples.length))));

    const [left, right] = d.phrases;
    if (!animate) {
      meta1.textContent = `${d.word} · ${d.caption}`;
      meta2.textContent = `${d.field}, com ${d.name}`;
      fitWord(tLeftWord, left);
      fitWord(tRightWord, right);
      return;
    }

    tLeft?.classList.add("out");
    tRight?.classList.add("out");
    meta.classList.add("sw");
    window.setTimeout(() => {
      meta1.textContent = `${d.word} · ${d.caption}`;
      meta2.textContent = `${d.field}, com ${d.name}`;
      fitWord(tLeftWord, left);
      fitWord(tRightWord, right);
      meta.classList.remove("sw");
      tLeft?.classList.remove("out");
      tRight?.classList.remove("out");
    }, 240);
  }

  const start = performance.now();

  function render(now: number) {
    const p = progress();
    const ang = state.A + 22 + state.tx * 18 + p * 50;
    const rx = -12 - state.ty * 10;
    faces.forEach((face, k) => {
      const c = Math.cos(((ang + k * 90) * Math.PI) / 180);
      const shade = shades[k];
      if (shade) shade.style.opacity = clamp((1 - c) * 0.32, 0, 0.55).toFixed(3);
      face.classList.toggle("side", c < 0.8);
    });
    body.style.transform = `translateZ(${-W / 2}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ang.toFixed(2)}deg)`;

    const scale = 1 - p * 0.45;
    mid.style.transform = `translate(-50%, -50%) translateY(${(p * 60).toFixed(1)}px) scale(${scale.toFixed(3)})`;
    const op = clamp(1.4 - p * 1.2, 0, 1);
    mid.style.opacity = op.toFixed(3);
    const sideOp = clamp(1.3 - p * 1.3, 0, 1).toFixed(3);
    if (tLeft) tLeft.style.opacity = sideOp;
    if (tRight) tRight.style.opacity = sideOp;
    if (intro) intro.style.opacity = sideOp;
    if (meta) meta.style.opacity = op.toFixed(3);
    if (chipsBox) chipsBox.style.opacity = op.toFixed(3);
    if (hint) hint.style.opacity = String(clamp(0.6 * (1.3 - p * 1.3), 0, 0.6));

    if (!reduced) {
      const bob = Math.sin((now - start) / 1000 * 1.3) * 6;
      body.style.setProperty("--bob", `${bob.toFixed(2)}px`);
    }
  }

  function tick(now: number) {
    state.raf = 0;
    if (!state.visible || document.hidden) {
      state.last = 0;
      return;
    }
    const dt = state.last ? Math.min(0.1, (now - state.last) / 1000) : 0;
    state.last = now;

    if (!state.drag) {
      state.v += ((state.T - state.A) * 60 - state.v * 11) * dt;
      state.A += state.v * dt;
    }
    const k = Math.min(1, dt * 5);
    state.tx += (state.mx - state.tx) * k;
    state.ty += (state.my - state.ty) * k;

    const step = Math.round(-state.A / 90);
    if (step !== state.step) {
      const first = state.step === null;
      state.step = step;
      applyData(step, !first);
    }

    render(now);
    state.raf = requestAnimationFrame(tick);
  }

  function startRaf() {
    if (!state.raf) state.raf = requestAnimationFrame(tick);
  }

  function auto() {
    window.clearInterval(state.timer);
    if (reduced) return;
    state.timer = window.setInterval(() => {
      if (!state.drag && state.visible && !document.hidden) {
        state.T -= 90;
      }
    }, 3000);
  }

  function advance(dir = -1) {
    state.T += 90 * dir;
    auto();
    startRaf();
    if (hint) hint.style.opacity = "0";
  }

  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse") {
      const r = stage.getBoundingClientRect();
      state.mx = ((event.clientX - r.left) / r.width - 0.5) * 2;
      state.my = ((event.clientY - r.top) / r.height - 0.5) * 2;
    }
    if (!state.drag) return;
    const now = performance.now();
    const dx = event.clientX - state.lastX;
    const dA = (dx * 180) / Math.max(300, W * 2.2);
    state.A += dA;
    const dt = Math.max(0.008, (now - state.lastT) / 1000);
    state.v = state.v * 0.5 + (dA / dt) * 0.5;
    state.lastX = event.clientX;
    state.lastT = now;
  });

  stage.addEventListener("pointerleave", () => {
    state.mx = 0;
    state.my = 0;
  });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("a, .hero-chips button")) return;
    state.drag = true;
    state.lastX = event.clientX;
    state.lastT = performance.now();
    state.v = 0;
    state.downX = event.clientX;
    state.downY = event.clientY;
    state.downT = performance.now();
    mid.classList.add("is-dragging");
    try {
      stage.setPointerCapture(event.pointerId);
    } catch {
      /* pointer capture is optional */
    }
  });

  function end(event: PointerEvent) {
    if (!state.drag) return;
    state.drag = false;
    mid.classList.remove("is-dragging");
    const tap =
      event.type === "pointerup" &&
      Math.abs(event.clientX - state.downX) < 6 &&
      Math.abs(event.clientY - state.downY) < 6 &&
      performance.now() - state.downT < 400;
    if (tap) {
      advance(-1);
      return;
    }
    state.T = Math.round((state.A + clamp(state.v, -900, 900) * 0.18) / 90) * 90;
    state.v = 0;
    state.last = 0;
    startRaf();
    auto();
  }

  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("lostpointercapture", end);

  hit.addEventListener("click", (event) => {
    if (event.detail === 0) advance(-1);
  });
  hit.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      advance(-1);
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      advance(1);
      event.preventDefault();
    } else if (event.key === "Enter" || event.key === " ") {
      advance(-1);
      event.preventDefault();
    }
  });

  chips.forEach((chip, index) => {
    chip.addEventListener("click", () => {
      const current = state.step ?? 0;
      let delta = mod(index - current, samples.length);
      if (delta > samples.length / 2) delta -= samples.length;
      state.T = -90 * (current + delta);
      auto();
      startRaf();
    });
  });

  const resize = () => {
    W = mid.clientWidth || W;
  };
  window.addEventListener("resize", resize);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      state.visible = entries[0]?.isIntersecting ?? true;
      if (state.visible) {
        state.last = 0;
        startRaf();
      }
    });
    io.observe(stage);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      state.last = 0;
      startRaf();
    }
  });

  applyData(0, false);
  state.step = 0;
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => {
      if (state.step !== null) applyData(state.step, false);
    });
  }
  resize();
  startRaf();
  auto();
}
