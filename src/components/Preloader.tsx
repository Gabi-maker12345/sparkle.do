"use client";

import { useEffect, useRef } from "react";
import { PRELOADER_LOGO } from "./preloader-logo";

const CONFIG = {
  storageKey: "sparkle:preloader-seen",
  timeline: {
    word1: 0,
    melt1: 0.78,
    word2: 0.95,
    melt2: 1.7,
    word3: 1.85,
    melt3: 2.5,
    draw: 3.1,
    wordmark: 4.5,
    star: 5.15,
    open: 5.7,
  },
  durations: {
    wordIn: 0.58,
    wordHold: 0.16,
    melt: 0.62,
    mass: 0.55,
    draw: 1.35,
    wordmark: 0.52,
    star: 0.46,
    open: 0.7,
    dotsDelay: 0.25,
    safety: 10_000,
  },
  ease: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    pop: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    draw: "cubic-bezier(0.45, 0, 0.2, 1)",
    soft: "cubic-bezier(0.3, 0.7, 0.4, 1)",
  },
  words: [
    { text: "Rápido", plus: true },
    { text: "Eficiente", plus: true },
    { text: "Elegante", plus: false },
  ],
};

const SVG_NS = "http://www.w3.org/2000/svg";
const WORDS = CONFIG.words;

type AnyWindow = Window & {
  __appReady?: boolean;
  __sparklePreloader?: { skip: () => void; done: () => boolean };
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

function playPlin(ctx: AudioContext | null) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  const voices = [
    { hz: 1760, gain: 0.12, decay: 1.0 },
    { hz: 2637, gain: 0.05, decay: 0.6 },
    { hz: 3520, gain: 0.03, decay: 0.35 },
  ];
  for (const voice of voices) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(voice.hz, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(voice.gain, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + voice.decay);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + voice.decay + 0.06);
  }
}

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || startedRef.current) return;
    startedRef.current = true;

    const win = window as AnyWindow;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const introForced = new URLSearchParams(window.location.search).get("intro") === "1";
    let seen = false;
    try {
      seen = sessionStorage.getItem(CONFIG.storageKey) === "1";
    } catch {
      // private mode / disabled storage — behave like a first visit
    }
    const short = seen && !introForced;
    try {
      sessionStorage.setItem(CONFIG.storageKey, "1");
    } catch {
      // ignore
    }

    document.documentElement.classList.add("preloader-active");
    const inertTargets = [
      document.getElementById("page"),
      document.querySelector(".site-header"),
      document.querySelector(".site-footer"),
    ].filter((el): el is HTMLElement => Boolean(el));
    const inertState = inertTargets.map((el) => ({
      el,
      inert: el.hasAttribute("inert"),
      ariaHidden: el.getAttribute("aria-hidden"),
    }));
    for (const { el } of inertState) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const skip = root.querySelector<HTMLButtonElement>(".preloader-skip");

    const timers = new Set<number>();
    let done = false;
    let raf = 0;
    let audio: AudioContext | null = null;
    let master: GainNode | null = null;

    try {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        audio = new AudioCtor();
        master = audio.createGain();
        master.gain.value = 0.22;
        master.connect(audio.destination);
        audio.resume().catch(() => {});
      }
    } catch {
      audio = null;
    }

    const unlockAudio = () => {
      if (audio?.state === "suspended") audio.resume().catch(() => {});
    };
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    const ready = (async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const load = document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
      const hero = new Promise<void>((resolve) => {
        if (win.__appReady) {
          resolve();
          return;
        }
        const onReady = () => resolve();
        window.addEventListener("sparkle:ready", onReady, { once: true });
        window.setTimeout(() => window.removeEventListener("sparkle:ready", onReady), CONFIG.durations.safety);
      });
      const images = Array.from(document.querySelectorAll<HTMLImageElement>(".hero img")).map((img) => {
        if (img.complete) return Promise.resolve();
        return img.decode?.().catch(() => undefined) ?? Promise.resolve();
      });
      await Promise.race([Promise.all([fonts, load, hero, ...images]), wait(CONFIG.durations.safety)]);
      return true;
    })();

    const at = (label: keyof typeof CONFIG.timeline) => {
      const target = CONFIG.timeline[label] * 1000;
      const elapsed = performance.now() - timelineStart;
      return new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          resolve();
        }, Math.max(0, target - elapsed));
        timers.add(id);
      });
    };

    let timelineStart = performance.now();
    const timersToClear = () => {
      for (const id of timers) window.clearTimeout(id);
      timers.clear();
      cancelAnimationFrame(raf);
    };

    const finish = (skipped = false) => {
      if (done) return;
      done = true;
      timersToClear();
      try {
        audio?.close().catch(() => {});
      } catch {
        // ignore
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      document.documentElement.classList.remove("preloader-active");
      document.documentElement.classList.add("preloader-revealed");
      for (const { el, inert, ariaHidden } of inertState) {
        if (!inert) el.removeAttribute("inert");
        if (ariaHidden === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", ariaHidden);
      }
      root.setAttribute("aria-busy", "false");
      root.remove();
      if (!skipped && previousFocus && document.contains(previousFocus)) {
        previousFocus.focus({ preventScroll: true });
      }
      window.dispatchEvent(new CustomEvent("preloader:done"));
      delete win.__sparklePreloader;
    };

    win.__sparklePreloader = { skip: () => finish(true), done: () => done };
    const safetyId = window.setTimeout(() => finish(true), CONFIG.durations.safety);
    timers.add(safetyId);

    const setIndex = (index: number) => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(".preloader-index span"));
      items.forEach((item, i) => item.classList.toggle("is-active", i === index));
    };

    const words = Array.from(root.querySelectorAll<SVGGElement>(".preloader-word"));
    const letters = words.map((group) =>
      Array.from(group.querySelectorAll<SVGTextElement>(".preloader-letter")),
    );
    const layoutWords = () => {
      words.forEach((group, wordIndex) => {
        const word = letters[wordIndex];
        word.forEach((letter) => {
          letter.setAttribute("x", "0");
          letter.setAttribute("y", "260");
        });
        const widths = word.map((letter) => letter.getComputedTextLength());
        const total = widths.reduce((sum, width) => sum + width, 0);
        let x = 500 - total / 2;
        word.forEach((letter, i) => {
          letter.setAttribute("x", String(x));
          x += widths[i];
        });
        group.style.transformOrigin = "500px 260px";
      });
    };

    const gooBlurNode = root.querySelector<SVGFEGaussianBlurElement>("#preloader-goo feGaussianBlur");

    const animateGoo = (duration: number) => {
      if (!gooBlurNode) return;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = t * t * (3 - 2 * t);
        gooBlurNode.setAttribute("stdDeviation", String(9 * eased));
        if (t < 1 && !done) requestAnimationFrame(tick);
      };
      gooBlurNode.setAttribute("stdDeviation", "0");
      requestAnimationFrame(tick);
    };

    const enterWord = (index: number) => {
      const group = words[index];
      if (!group) return;
      setIndex(index);
      group.style.opacity = "1";
      group.animate(
        [
          { opacity: 0, transform: "translateY(64px) scale(0.96)", filter: "blur(10px)" },
          { opacity: 1, transform: "translateY(-4px) scale(1.018)", filter: "blur(0)", offset: 0.72 },
          { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" },
        ],
        { duration: CONFIG.durations.wordIn * 1000, easing: CONFIG.ease.pop, fill: "both" },
      );
    };

    const mass = root.querySelector<SVGGElement>("#preloader-mass");
    const massScale = root.querySelector<SVGGElement>("#preloader-mass-scale");

    const meltWord = async (index: number) => {
      const group = words[index];
      if (!group) return;
      if (!root.classList.contains("is-goo")) {
        const indexBar = root.querySelector<HTMLElement>(".preloader-index");
        if (indexBar) {
          indexBar.style.opacity = "0";
          indexBar.style.visibility = "hidden";
        }
      }
      root.classList.add("is-goo");
      group.style.filter = "url(#preloader-goo)";
      animateGoo(CONFIG.durations.melt * 1000);

      const word = letters[index];
      word.forEach((letter, i) => {
        const box = letter.getBBox();
        const dx = 500 - (box.x + box.width / 2);
        const dy = 260 - (box.y + box.height / 2);
        letter.animate(
          [
            { transform: "translate(0, 0) scale(1)", opacity: 1 },
            {
              transform: `translate(${dx * 0.45}px, ${34 + i * 2}px) scale(0.88)`,
              opacity: 0.8,
              offset: 0.55,
            },
            {
              transform: `translate(${dx * 0.88}px, ${dy * 0.82 + 18}px) scale(0.24)`,
              opacity: 0,
            },
          ],
          {
            duration: CONFIG.durations.melt * 1000,
            delay: i * 18,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
            fill: "both",
          },
        );
      });

      if (mass && massScale) {
        mass.style.opacity = "1";
        massScale.animate(
          [
            { transform: "scale(0.55)" },
            { transform: "scale(1.08)", offset: 0.68 },
            { transform: "scale(1)" },
          ],
          { duration: CONFIG.durations.mass * 1000, easing: CONFIG.ease.pop, fill: "both" },
        );
      }

      await wait(CONFIG.durations.melt * 1000 + 100);
      group.style.opacity = "0";
      group.style.filter = "none";
      gooBlurNode?.setAttribute("stdDeviation", "0");
    };

    const setFinalLogo = () => {
      const drawLayer = root.querySelector<SVGGElement>("#sd-draw-layer");
      drawLayer?.removeAttribute("mask");
      for (const selector of [
        "#sd-pencil",
        "#sd-wordmark",
        "#sd-tagline",
        "#sd-star",
      ]) {
        const node = root.querySelector<SVGGElement>(selector);
        if (node) node.style.opacity = "1";
      }
      const pencil = root.querySelector<SVGGElement>("#pre-draw-pencil");
      if (pencil) pencil.style.opacity = "0";
    };

    const drawLogo = async () => {
      const guide = root.querySelector<SVGPathElement>("#pre-draw-guide");
      const drawLayer = root.querySelector<SVGGElement>("#sd-draw-layer");
      const prePencil = root.querySelector<SVGGElement>("#pre-draw-pencil");
      const officialPencil = root.querySelector<SVGGElement>("#sd-pencil");
      if (!guide || !drawLayer) {
        setFinalLogo();
        return;
      }

      const length = guide.getTotalLength();
      guide.style.strokeDasharray = String(length);
      guide.style.strokeDashoffset = String(length);
      if (prePencil) prePencil.style.opacity = "1";

      await new Promise<void>((resolve) => {
        const start = performance.now();
        const tick = (now: number) => {
          if (done) {
            resolve();
            return;
          }
          const raw = Math.min(1, (now - start) / (CONFIG.durations.draw * 1000));
          const t = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
          guide.style.strokeDashoffset = String(length * (1 - t));
          if (prePencil) {
            const point = guide.getPointAtLength(length * t);
            const ahead = guide.getPointAtLength(Math.min(length, length * t + 1.5));
            const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
            prePencil.setAttribute(
              "transform",
              `translate(${point.x} ${point.y}) rotate(${angle}) scale(0.72)`,
            );
          }
          if (t < 1) {
            requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

      drawLayer.removeAttribute("mask");
      if (officialPencil) officialPencil.style.opacity = "1";
      if (prePencil) prePencil.style.opacity = "0";
    };

    const revealWordmark = async () => {
      const wordmark = root.querySelector<SVGGElement>("#sd-wordmark");
      const tagline = root.querySelector<SVGGElement>("#sd-tagline");
      if (wordmark) {
        wordmark.style.opacity = "1";
        wordmark.animate(
          [
            { opacity: 0, filter: "blur(16px)", transform: "translateY(12px) scale(0.98)" },
            { opacity: 1, filter: "blur(0)", transform: "translateY(0) scale(1)" },
          ],
          {
            duration: CONFIG.durations.wordmark * 1000,
            easing: CONFIG.ease.soft,
            fill: "both",
          },
        );
      }
      if (tagline) {
        tagline.style.opacity = "0";
        await wait(90);
        tagline.style.opacity = "1";
        tagline.animate(
          [
            { opacity: 0, filter: "blur(8px)", transform: "scaleX(0.92)" },
            { opacity: 1, filter: "blur(0)", transform: "scaleX(1)" },
          ],
          {
            duration: CONFIG.durations.wordmark * 1000,
            easing: CONFIG.ease.soft,
            fill: "both",
          },
        );
      }
    };

    const spawnSparks = (star: SVGGElement) => {
      const host = root.querySelector<HTMLElement>(".preloader-sparks");
      if (!host) return;
      const rect = star.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 6; i += 1) {
        const spark = document.createElement("span");
        spark.className = "preloader-spark";
        spark.textContent = "✦";
        spark.style.left = `${cx}px`;
        spark.style.top = `${cy}px`;
        spark.style.fontSize = `${11 + (i % 3) * 4}px`;
        host.appendChild(spark);
        const angle = (Math.PI * 2 * i) / 6 + 0.2;
        const distance = 32 + (i % 2) * 18;
        spark.animate(
          [
            { opacity: 0, transform: "translate(-50%, -50%) scale(0.4)" },
            { opacity: 0.8, transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(1)`, offset: 0.55 },
            { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(angle) * distance * 1.55}px), calc(-50% + ${Math.sin(angle) * distance * 1.55}px)) scale(0.6)` },
          ],
          { duration: 540, easing: CONFIG.ease.soft, fill: "both" },
        );
        window.setTimeout(() => spark.remove(), 600);
      }
    };

    const revealStar = async () => {
      const star = root.querySelector<SVGGElement>("#sd-star");
      if (!star) return;
      star.style.opacity = "1";
      playPlin(audio);
      star.animate(
        [
          { opacity: 0, transform: "translate(571px, 115px) scale(0) rotate(45deg)" },
          { opacity: 1, transform: "translate(571px, 115px) scale(1.15) rotate(0deg)", offset: 0.72 },
          { opacity: 1, transform: "translate(571px, 115px) scale(1) rotate(0deg)" },
        ],
        { duration: CONFIG.durations.star * 1000, easing: CONFIG.ease.pop, fill: "both" },
      );
      spawnSparks(star);
      await wait(CONFIG.durations.star * 1000);
      star.style.transform = "";
      root.classList.add("is-final-logo");
    };

    const openPreloader = async () => {
      const star = root.querySelector<SVGGElement>("#sd-star");
      const rect = star?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      root.classList.add("is-opening");
      root.style.background = "var(--peach)";
      document.documentElement.classList.add("preloader-revealed");
      const max = Math.hypot(window.innerWidth, window.innerHeight) * 1.15;
      const start = performance.now();
      await new Promise<void>((resolve) => {
        const tick = (now: number) => {
          const raw = Math.min(1, (now - start) / (CONFIG.durations.open * 1000));
          const t = raw * raw * (3 - 2 * raw);
          const radius = max * t;
          const mask = `radial-gradient(circle at ${cx}px ${cy}px, transparent 0, transparent ${radius}px, #000 ${radius + 1}px)`;
          root.style.maskImage = mask;
          (root.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = mask;
          if (raw < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      finish();
    };

    const waitForReady = async () => {
      const dots = root.querySelector<HTMLElement>(".preloader-dots");
      let readyNow = false;
      ready.then(() => {
        readyNow = true;
      });
      await wait(CONFIG.durations.dotsDelay * 1000);
      if (!readyNow) {
        dots?.classList.add("is-visible");
      }
      await ready;
      dots?.classList.remove("is-visible");
    };

    const runFull = async () => {
      await document.fonts?.ready.catch(() => undefined);
      if (done) return;
      root.classList.add("show-words");
      layoutWords();
      timelineStart = performance.now();

      const wordTasks = WORDS.map((_, index) =>
        (async () => {
          await at((`word${index + 1}`) as keyof typeof CONFIG.timeline);
          enterWord(index);
          await at((`melt${index + 1}`) as keyof typeof CONFIG.timeline);
          await meltWord(index);
        })(),
      );

      await Promise.all(wordTasks);
      if (done) return;
      await at("draw");
      if (done) return;

      const wordsStage = root.querySelector<SVGElement>(".preloader-words");
      wordsStage?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 240,
        easing: "ease",
        fill: "forwards",
      });
      if (mass) {
        mass.animate(
          [
            { transform: "translate(500px, 260px) scale(1)", opacity: 1 },
            { transform: "translate(285px, 155px) scale(0.16)", opacity: 0 },
          ],
          { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
        );
      }
      await wait(300);
      root.classList.add("show-draw");
      await drawLogo();
      if (done) return;
      await at("wordmark");
      await revealWordmark();
      if (done) return;
      await at("star");
      await revealStar();
      if (done) return;
      await waitForReady();
      if (done) return;
      await openPreloader();
    };

    const runShort = async () => {
      await document.fonts?.ready.catch(() => undefined);
      if (done) return;
      root.classList.add("show-draw", "is-short");
      setFinalLogo();
      await wait(120);
      await revealStar();
      if (done) return;
      await waitForReady();
      if (done) return;
      await openPreloader();
    };

    const runReduced = async () => {
      root.classList.add("is-reduced");
      const dots = root.querySelector<HTMLElement>(".preloader-dots");
      let readyNow = false;
      ready.then(() => {
        readyNow = true;
      });
      await wait(CONFIG.durations.dotsDelay * 1000);
      if (!readyNow) dots?.classList.add("is-visible");
      await ready;
      dots?.classList.remove("is-visible");
      if (done) return;
      document.documentElement.classList.add("preloader-revealed");
      await new Promise<void>((resolve) => {
        root.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 380,
          easing: "ease",
          fill: "forwards",
        }).finished.then(() => resolve());
      });
      finish();
    };

    skip?.addEventListener("click", () => finish(true));

    const run = async () => {
      try {
        if (reduced) await runReduced();
        else if (short) await runShort();
        else await runFull();
      } catch {
        finish(true);
      }
    };
    void run();

    return () => {
      timersToClear();
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      try {
        audio?.close().catch(() => {});
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div
      className="sparkle-preloader"
      id="sparkle-preloader"
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando sparkle.do"
      data-preloader=""
    >
      <p className="preloader-top">
        <span aria-hidden="true">✦</span> SPARKLE.DO — ESTÚDIO DE PORTFÓLIOS
      </p>

      <div className="preloader-stage">
        <img
          className="preloader-static"
          src="/sparkle-do-logo.svg"
          alt="sparkle.do"
          width={698}
          height={559}
          fetchPriority="high"
        />

        <div className="preloader-animated" aria-hidden="true">
          <svg
            className="preloader-words"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <filter id="preloader-goo" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                <feDropShadow dx="6" dy="8" stdDeviation="0" floodColor="#2a0c13" floodOpacity="0.9" />
              </filter>
              <filter id="preloader-mass-goo" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 22 -10"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>

            {WORDS.map((word, wordIndex) => (
              <g
                className="preloader-word"
                data-word={wordIndex}
                key={word.text}
                opacity="0"
                role="img"
                aria-label={word.text}
              >
                {Array.from(word.text).map((char, charIndex) => (
                  <text className="preloader-letter" key={`${char}-${charIndex}`}>
                    {char}
                  </text>
                ))}
                {word.plus && <text className="preloader-letter preloader-plus">+</text>}
              </g>
            ))}

            <g className="preloader-mass" id="preloader-mass" transform="translate(500 260)" opacity="0">
              <g id="preloader-mass-scale">
                <g transform="translate(7 9)" fill="#2a0c13" filter="url(#preloader-mass-goo)" opacity="0.9">
                  <path d="M-96,-8C-92,-48 -62,-67 -27,-51C-8,-78 42,-73 62,-41C97,-30 97,20 65,42C49,68 8,73 -17,55C-45,72 -88,55 -96,22C-100,10 -100,2 -96,-8Z" />
                  <circle cx="-65" cy="16" r="26" />
                  <circle cx="58" cy="19" r="24" />
                </g>
                <g fill="#4e1e2a" filter="url(#preloader-mass-goo)">
                  <path d="M-96,-8C-92,-48 -62,-67 -27,-51C-8,-78 42,-73 62,-41C97,-30 97,20 65,42C49,68 8,73 -17,55C-45,72 -88,55 -96,22C-100,10 -100,2 -96,-8Z" />
                  <circle cx="-65" cy="16" r="26" />
                  <circle cx="58" cy="19" r="24" />
                </g>
                <g fill="#f0d0c8" opacity="0.38" transform="translate(-20 -19)">
                  <path d="M-57,-2C-52,-27 -23,-36 -5,-20C9,-40 38,-30 43,-4C58,9 45,29 22,33C4,46 -21,40 -28,20C-45,19 -60,12 -57,-2Z" />
                </g>
              </g>
            </g>
          </svg>

          <div className="preloader-logo">
            <div dangerouslySetInnerHTML={{ __html: PRELOADER_LOGO }} />
          </div>
        </div>

        <div className="preloader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="preloader-index" aria-hidden="true">
        <span className="is-active">01</span>
        <span>02</span>
        <span>03</span>
      </div>

      <button className="preloader-skip" type="button">
        Pular
      </button>

      <div className="preloader-sparks" aria-hidden="true" />
      <p className="sr-only">Carregando sparkle.do</p>
    </div>
  );
}
