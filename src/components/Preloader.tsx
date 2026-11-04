"use client";

import { useEffect, useRef } from "react";
import { PRELOADER_LOGO } from "./preloader-logo";

const CONFIG = {
  storageKey: "sparkle:preloader-seen",
  timings: {
    equationStart: 0.35,
    word1: 0.35,
    plus1: 1.05,
    word2: 1.05,
    plus2: 1.95,
    word3: 1.95,
    equals: 2.85,
    gooStart: 3.3,
    gooMerge: 3.95,
    gooEnd: 4.6,
    drawStart: 4.6,
    sStart: 4.6,
    sEnd: 4.85,
    dStart: 4.9,
    dEnd: 5.4,
    fStart: 5.45,
    fEnd: 5.95,
    wordmark: 6.5,
    wordmarkEnd: 7.0,
    star: 7.0,
    starEnd: 7.45,
    open: 7.8,
    end: 8.4,
  },
  durations: {
    wordIn: 0.45,
    symbolIn: 0.25,
    recenter: 0.4,
    gooBlur: 0.3,
    melt: 0.5,
    merge: 0.4,
    drawPop: 0.18,
    wordmark: 0.1,
    star: 0.45,
    open: 0.6,
    dotsDelay: 0.25,
    safety: 10_000,
  },
  ease: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    soft: "cubic-bezier(0.3, 0.7, 0.4, 1)",
  },
  words: [
    { text: "Rápido", plus: true },
    { text: "Eficiente", plus: true },
    { text: "Elegante", plus: false },
  ],
  equation: "Rápido+Eficiente+Elegante=",
  viewBoxDesktop: { w: 1200, h: 320 },
  viewBoxMobile: { w: 900, h: 700 },
};

const WORDS = CONFIG.words;
const SYMBOLS = ["+", "+", "="];
const NS = "http://www.w3.org/2000/svg";
const TOKEN_ORDER = [0, 1, 2, 3, 4, 5];
const TIP = { x: 436.3, y: 322.8 };

type Box = { minX: number; maxX: number; minY: number; maxY: number; cx: number; cy: number };
type WordData = {
  group: SVGGElement;
  chars: SVGTextElement[];
  drops: SVGCircleElement[];
  start: number;
  box: Box;
  clip: SVGRectElement;
  text: string;
};
type SymbolData = {
  group: SVGGElement;
  char: SVGTextElement;
  drop: SVGCircleElement;
  start: number;
  box: Box;
  text: string;
  nearestWord: number;
};
type Layout = {
  vbW: number;
  vbH: number;
  font: number;
  mobile: boolean;
  words: WordData[];
  symbols: SymbolData[];
  equation: SVGSVGElement;
  eqGroup: SVGGElement;
  recenter: { x: number; y: number };
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}
function easeOut(x: number) {
  return 1 - Math.pow(1 - x, 3);
}
function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function easeOutBack(x: number) {
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
}
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

    const debug = new URLSearchParams(window.location.search).get("debug") === "1";
    const introForced = new URLSearchParams(window.location.search).get("intro") === "1";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(CONFIG.storageKey) === "1";
    } catch {
      // ignore private storage
    }
    const short = !debug && seen && !introForced;
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
    const top = root.querySelector<HTMLElement>(".preloader-top");
    const index = root.querySelector<HTMLElement>(".preloader-index");
    const dots = root.querySelector<HTMLElement>(".preloader-dots");
    const stage = root.querySelector<HTMLElement>(".preloader-stage");
    const staticLogo = root.querySelector<HTMLImageElement>(".preloader-static");
    const logoStage = root.querySelector<HTMLElement>(".preloader-logo");
    const equationSvg = root.querySelector<SVGSVGElement>(".pre-eq-svg");
    const eqGroup = root.querySelector<SVGGElement>("#pre-eq-group");
    const wordGroups = Array.from(root.querySelectorAll<SVGGElement>(".pre-eq-word"));
    const symbolGroups = Array.from(root.querySelectorAll<SVGGElement>(".pre-eq-symbol"));
    const allGroups = [...wordGroups, ...symbolGroups];
    const logo = root.querySelector<SVGSVGElement>(".preloader-logo-svg");
    const star = root.querySelector<SVGGElement>("#sd-star");
    const wordmark = root.querySelector<SVGGElement>("#sd-wordmark");
    const tagline = root.querySelector<SVGGElement>("#sd-tagline");
    const pencil = root.querySelector<SVGGElement>("#sd-pencil");
    const drawLayer = root.querySelector<SVGGElement>("#sd-draw-layer");
    const sComplete = root.querySelector<SVGGElement>("#pre-s-complete");
    const guideS = root.querySelector<SVGPathElement>("#pre-guide-s");
    const guideD = root.querySelector<SVGPathElement>("#pre-guide-d");
    const guideF = root.querySelector<SVGPathElement>("#pre-guide-f");
    const gooFilter = root.querySelector<SVGFilterElement>("#pre-eq-goo");
    const gooBlur = root.querySelector<SVGFEGaussianBlurElement>("#pre-eq-goo feGaussianBlur");
    const clips = Array.from(root.querySelectorAll<SVGRectElement>(".pre-eq-clip"));

    if (!equationSvg || !eqGroup || !logo || !star || !tagline) return;

    let done = false;
    let playing = false;
    let clock = 0;
    let last = performance.now();
    let raf = 0;
    let readyResolved = false;
    let soundPlayed = false;
    let fpsWindow = 0;
    let fpsFrames = 0;
    let slowFrames = 0;
    let starScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let layout: Layout | null = null;
    const audioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let audio: AudioContext | null = null;
    try {
      if (audioCtor) {
        audio = new audioCtor();
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

    const safetyId = window.setTimeout(() => finish(true), debug ? 60_000 : CONFIG.durations.safety);

    const ready = (async () => {
      const fonts = document.fonts?.ready ?? Promise.resolve();
      const load = document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
      const hero = new Promise<void>((resolve) => {
        const w = window as Window & { __appReady?: boolean };
        if (w.__appReady) {
          resolve();
          return;
        }
        const onReady = () => resolve();
        window.addEventListener("sparkle:ready", onReady, { once: true });
      });
      const images = Array.from(document.querySelectorAll<HTMLImageElement>(".hero img")).map((img) => {
        if (img.complete) return Promise.resolve();
        return img.decode?.().catch(() => undefined) ?? Promise.resolve();
      });
      await Promise.race([Promise.all([fonts, load, hero, ...images]), wait(CONFIG.durations.safety)]);
      return true;
    })();
    ready.then(() => {
      readyResolved = true;
    });

    function finish(skipped = false) {
      if (done) return;
      done = true;
      playing = false;
      cancelAnimationFrame(raf);
      clearTimeout(safetyId);
      document.documentElement.classList.remove("preloader-active", "preloader-opening", "preloader-nav-in", "preloader-hero-in");
      document.documentElement.classList.add("preloader-revealed");
      for (const { el, inert, ariaHidden } of inertState) {
        if (!inert) el.removeAttribute("inert");
        if (ariaHidden === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", ariaHidden);
      }
      root?.setAttribute("aria-busy", "false");
      root?.remove();
      if (!skipped && previousFocus && document.contains(previousFocus)) {
        previousFocus.focus({ preventScroll: true });
      }
      try {
        audio?.close().catch(() => {});
      } catch {
        // ignore
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.dispatchEvent(new CustomEvent("preloader:done"));
      delete (window as Window & { __preloader?: unknown }).__preloader;
    }

    const setIndex = (active: number) => {
      const spans = Array.from(index?.querySelectorAll("span") ?? []);
      spans.forEach((span, i) => span.classList.toggle("is-active", i === active));
    };

    const measureToken = (el: SVGTextElement) => {
      el.setAttribute("x", "0");
      return el.getComputedTextLength();
    };

    function layoutEquation() {
      if (!equationSvg || !eqGroup || !gooFilter) return null;
      const mobile = window.innerWidth < 640;
      const vb = mobile ? CONFIG.viewBoxMobile : CONFIG.viewBoxDesktop;
      equationSvg.setAttribute("viewBox", `0 0 ${vb.w} ${vb.h}`);
      equationSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      equationSvg.style.setProperty("--eq-size", "150px");
      gooFilter.setAttribute("x", "0");
      gooFilter.setAttribute("y", "0");
      gooFilter.setAttribute("width", String(vb.w));
      gooFilter.setAttribute("height", String(vb.h));

      const words: WordData[] = wordGroups.map((group, i) => {
        const chars = Array.from(group.querySelectorAll<SVGTextElement>(".pre-eq-char"));
        const drops = Array.from(group.querySelectorAll<SVGCircleElement>(".pre-eq-drop"));
        chars.forEach((char) => {
          char.setAttribute("x", "0");
          char.setAttribute("y", "0");
        });
        return {
          group,
          chars,
          drops,
          start: [CONFIG.timings.word1, CONFIG.timings.word2, CONFIG.timings.word3][i],
          box: { minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0 },
          clip: clips[i],
          text: WORDS[i].text,
        };
      });
      const symbols: SymbolData[] = symbolGroups.map((group, i) => {
        const char = group.querySelector<SVGTextElement>(".pre-eq-char");
        const drop = group.querySelector<SVGCircleElement>(".pre-eq-drop");
        if (!char || !drop) throw new Error("symbol missing");
        char.setAttribute("x", "0");
        char.setAttribute("y", "0");
        return {
          group,
          char,
          drop,
          start: [CONFIG.timings.plus1, CONFIG.timings.plus2, CONFIG.timings.equals][i],
          box: { minX: 0, maxX: 0, minY: 0, maxY: 0, cx: 0, cy: 0 },
          text: SYMBOLS[i],
          nearestWord: Math.min(i, 2),
        };
      });

      const base = 150;
      const tokenWidths = (font: number) => {
        equationSvg.style.setProperty("--eq-size", `${font}px`);
        return {
          words: words.map((word) => word.chars.reduce((sum, char) => sum + measureToken(char), 0)),
          symbols: symbols.map((symbol) => measureToken(symbol.char)),
        };
      };
      let font = base;
      if (mobile) {
        const w = tokenWidths(base);
        const maxLine = Math.max(
          w.words[0] + w.symbols[0] + font * 0.42,
          w.words[1] + w.symbols[1] + font * 0.42,
          w.words[2] + w.symbols[2] + font * 0.42,
        );
        font = base * Math.min(1, (vb.w * 0.88) / maxLine);
      } else {
        const w = tokenWidths(base);
        const total = w.words.reduce((sum, x) => sum + x, 0) + w.symbols.reduce((sum, x) => sum + x, 0) + font * 0.42 * 5;
        font = base * Math.min(1, (vb.w * 0.88) / total);
      }
      const widths = tokenWidths(font);
      const gap = font * 0.42;
      const lineCenters = mobile
        ? [vb.h / 2 - font * 1.55, vb.h / 2, vb.h / 2 + font * 1.55]
        : [vb.h / 2, vb.h / 2, vb.h / 2];

      const positionToken = (el: SVGTextElement[], startX: number, y: number) => {
        let x = startX;
        for (const char of el) {
          char.setAttribute("x", String(x));
          char.setAttribute("y", String(y));
          x += char.getComputedTextLength();
        }
      };

      if (!mobile) {
        const total = widths.words.reduce((sum, x) => sum + x, 0) + widths.symbols.reduce((sum, x) => sum + x, 0) + gap * 5;
        let x = vb.w / 2 - total / 2;
        const seq: Array<{ kind: "word" | "symbol"; i: number }> = [
          { kind: "word", i: 0 },
          { kind: "symbol", i: 0 },
          { kind: "word", i: 1 },
          { kind: "symbol", i: 1 },
          { kind: "word", i: 2 },
          { kind: "symbol", i: 2 },
        ];
        for (const token of seq) {
          if (token.kind === "word") {
            const word = words[token.i];
            positionToken(word.chars, x, vb.h / 2);
            const width = widths.words[token.i];
            word.box = { minX: x, maxX: x + width, minY: vb.h / 2 - font * 0.55, maxY: vb.h / 2 + font * 0.55, cx: x + width / 2, cy: vb.h / 2 };
            x += width + gap;
          } else {
            const symbol = symbols[token.i];
            positionToken([symbol.char], x, vb.h / 2);
            const width = widths.symbols[token.i];
            symbol.box = { minX: x, maxX: x + width, minY: vb.h / 2 - font * 0.55, maxY: vb.h / 2 + font * 0.55, cx: x + width / 2, cy: vb.h / 2 };
            x += width + gap;
          }
        }
      } else {
        lineCenters.forEach((lineY, lineIndex) => {
          const word = words[lineIndex];
          const symbol = symbols[lineIndex];
          const width = widths.words[lineIndex] + gap + widths.symbols[lineIndex];
          let x = vb.w / 2 - width / 2;
          positionToken(word.chars, x, lineY);
          word.box = { minX: x, maxX: x + widths.words[lineIndex], minY: lineY - font * 0.55, maxY: lineY + font * 0.55, cx: x + widths.words[lineIndex] / 2, cy: lineY };
          x += widths.words[lineIndex] + gap;
          positionToken([symbol.char], x, lineY);
          symbol.box = { minX: x, maxX: x + widths.symbols[lineIndex], minY: lineY - font * 0.55, maxY: lineY + font * 0.55, cx: x + widths.symbols[lineIndex] / 2, cy: lineY };
        });
      }

      clips.forEach((clip, i) => {
        const word = words[i];
        const lineY = mobile ? lineCenters[i] : vb.h / 2;
        clip.setAttribute("x", "0");
        clip.setAttribute("width", String(vb.w));
        clip.setAttribute("y", String(lineY - font * 0.85));
        clip.setAttribute("height", String(font * 1.7));
      });

      words.forEach((word) => {
        word.drops.forEach((drop, i) => {
          const char = word.chars[i];
          const box = char.getBBox();
          drop.setAttribute("cx", String(box.x + box.width / 2));
          drop.setAttribute("cy", String(box.y + box.height / 2));
          drop.setAttribute("r", "0");
        });
      });
      symbols.forEach((symbol) => {
        const box = symbol.char.getBBox();
        symbol.drop.setAttribute("cx", String(box.x + box.width / 2));
        symbol.drop.setAttribute("cy", String(box.y + box.height / 2));
        symbol.drop.setAttribute("r", "0");
      });

      eqGroup.style.transformOrigin = `${vb.w / 2}px ${vb.h / 2}px`;
      return { vbW: vb.w, vbH: vb.h, font, mobile, words, symbols, equation: equationSvg, eqGroup, recenter: { x: 0, y: 0 } };
    }

    const visibleBox = (l: Layout, t: number) => {
      const boxes: Box[] = [];
      for (const word of l.words) if (t >= word.start) boxes.push(word.box);
      for (const symbol of l.symbols) if (t >= symbol.start) boxes.push(symbol.box);
      if (!boxes.length) return { x: 0, y: 0 };
      const minX = Math.min(...boxes.map((b) => b.minX));
      const maxX = Math.max(...boxes.map((b) => b.maxX));
      const minY = Math.min(...boxes.map((b) => b.minY));
      const maxY = Math.max(...boxes.map((b) => b.maxY));
      return l.mobile
        ? { x: 0, y: l.vbH / 2 - (minY + maxY) / 2 }
        : { x: l.vbW / 2 - (minX + maxX) / 2, y: 0 };
    };

    const renderEquation = (l: Layout, t: number) => {
      const goo = t >= CONFIG.timings.gooStart;
      const recenter = visibleBox(l, t);
      l.recenter = recenter;
      l.eqGroup.style.transition = debug ? "none" : `transform ${CONFIG.durations.recenter}s ${CONFIG.ease.out}`;
      l.eqGroup.style.transform = `translate(${recenter.x}px, ${recenter.y}px)`;
      l.eqGroup.style.transformOrigin = `${l.vbW / 2}px ${l.vbH / 2}px`;

      if (goo) {
        l.eqGroup.setAttribute("filter", "url(#pre-eq-goo)");
        if (gooBlur) gooBlur.setAttribute("stdDeviation", String(9 * clamp01((t - CONFIG.timings.gooStart) / CONFIG.durations.gooBlur)));
      } else {
        l.eqGroup.removeAttribute("filter");
      }

      const hideLetterBodies = t >= 3.9;
      l.words.forEach((word, wordIndex) => {
        const p = clamp01((t - word.start) / CONFIG.durations.wordIn);
        const visible = t >= word.start;
        word.group.style.visibility = hideLetterBodies ? "hidden" : visible || goo ? "visible" : "hidden";
        word.group.style.opacity = goo ? "1" : String(p);
        if (word.clip) {
          if (goo || l.mobile) word.group.style.clipPath = "none";
          else word.group.style.clipPath = `url(#pre-clip-${wordIndex})`;
          word.clip.setAttribute("y", String((l.mobile ? (wordIndex === 0 ? l.vbH / 2 - l.font * 1.55 : wordIndex === 1 ? l.vbH / 2 : l.vbH / 2 + l.font * 1.55) : l.vbH / 2) - l.font * 0.85 + recenter.y));
        }
        if (!goo) {
          word.group.style.transform = `translateY(${(1 - p) * l.font * 0.6}px)`;
          word.group.style.filter = p < 1 ? `blur(${(1 - p) * 7}px)` : "none";
        } else {
          word.group.style.filter = "none";
        }
      });

      l.symbols.forEach((symbol, symbolIndex) => {
        const p = clamp01((t - symbol.start) / CONFIG.durations.symbolIn);
        const visible = t >= symbol.start;
        symbol.group.style.visibility = hideLetterBodies ? "hidden" : visible || goo ? "visible" : "hidden";
        symbol.group.style.opacity = goo ? "1" : String(p);
        if (!goo) {
          const scale = 0.55 + 0.45 * easeOutBack(p);
          symbol.group.style.transform = `scale(${scale})`;
          symbol.group.style.transformOrigin = `${symbol.box.cx}px ${symbol.box.cy}px`;
        } else {
          symbol.group.style.transform = "none";
        }
      });

      if (t < CONFIG.timings.gooStart) {
        l.words.forEach((word) => word.drops.forEach((drop) => { drop.style.visibility = "hidden"; drop.style.opacity = "0"; drop.setAttribute("r", "0"); }));
        l.symbols.forEach((symbol) => { symbol.drop.style.visibility = "hidden"; symbol.drop.style.opacity = "0"; symbol.drop.setAttribute("r", "0"); });
        l.words.forEach((word) => { word.group.style.transform = ""; });
        return;
      }

      const globalX = l.vbW / 2;
      const globalY = l.vbH / 2;
      const mergeTargets = [
        { x: globalX - 58, y: globalY - 10 },
        { x: globalX + 58, y: globalY - 10 },
        { x: globalX, y: globalY + 26 },
      ];
      l.words.forEach((word, wordIndex) => {
        const merge = easeInOut(clamp01((t - CONFIG.timings.gooMerge) / CONFIG.durations.merge));
        const target = mergeTargets[wordIndex];
        word.group.style.transform = `translate(${(target.x - word.box.cx) * merge}px, ${(target.y - word.box.cy) * merge}px)`;
        word.chars.forEach((char, i) => {
          const drop = word.drops[i];
          const delay = wordIndex * 0.04 + i * 0.012;
          const start = CONFIG.timings.gooStart + delay;
          const a = clamp01((t - start) / 0.12);
          const m = clamp01((t - (start + 0.12)) / CONFIG.durations.melt);
          const rect = char.getBBox();
          const ring = word.chars.length > 1 ? l.font * 0.17 : 0;
          const angle = (i / Math.max(1, word.chars.length)) * Math.PI * 2;
          const tx = word.box.cx + Math.cos(angle) * ring;
          const ty = word.box.cy + Math.sin(angle) * ring;
          const dx = tx - (rect.x + rect.width / 2);
          const dy = ty - (rect.y + rect.height / 2);
          const gravity = 8 + (i % 3) * 3;
          const rot = (i % 2 === 0 ? 1 : -1) * 6 * m;
          const scale = 1 - 0.45 * m;
          char.style.transform = `translate(${dx * m}px, ${(dy + gravity) * m}px) scale(${scale}) rotate(${rot}deg)`;
          char.style.transformOrigin = `${rect.x + rect.width / 2}px ${rect.y + rect.height / 2}px`;
          drop.style.visibility = "visible";
          drop.style.opacity = "1";
          drop.setAttribute("r", String(0.38 * l.font * m));
          drop.style.transform = `translate(${dx * m}px, ${(dy + gravity) * m}px)`;
          drop.style.transformOrigin = `${rect.x + rect.width / 2}px ${rect.y + rect.height / 2}px`;
          void a;
        });
      });
      l.symbols.forEach((symbol, symbolIndex) => {
        const word = l.words[symbol.nearestWord];
        const merge = easeInOut(clamp01((t - CONFIG.timings.gooMerge) / CONFIG.durations.merge));
        const target = mergeTargets[symbol.nearestWord];
        symbol.group.style.transform = `translate(${(target.x - word.box.cx) * merge}px, ${(target.y - word.box.cy) * merge}px)`;
        const rect = symbol.char.getBBox();
        const dx = word.box.cx - (rect.x + rect.width / 2);
        const dy = word.box.cy - (rect.y + rect.height / 2);
        const m = clamp01((t - (CONFIG.timings.gooStart + 0.08 + symbolIndex * 0.04)) / CONFIG.durations.melt);
        symbol.char.style.transform = `translate(${dx * m}px, ${dy * m}px) scale(${1 - 0.35 * m})`;
        symbol.char.style.transformOrigin = `${rect.x + rect.width / 2}px ${rect.y + rect.height / 2}px`;
        symbol.drop.style.visibility = "visible";
        symbol.drop.style.opacity = "1";
        symbol.drop.setAttribute("r", String(0.18 * l.font * m));
        symbol.drop.style.transform = `translate(${dx * m}px, ${dy * m}px)`;
        symbol.drop.style.transformOrigin = `${rect.x + rect.width / 2}px ${rect.y + rect.height / 2}px`;
      });

      const wordDropGroup = l.equation.querySelector<SVGGElement>("#pre-eq-word-drops");
      if (wordDropGroup) {
        const p = easeOutBack(clamp01((t - 3.45) / 0.45));
        const visible = t >= 3.45 && t < 4.16;
        wordDropGroup.style.opacity = visible ? "1" : "0";
        wordDropGroup.style.visibility = visible ? "visible" : "hidden";
        const drops = Array.from(wordDropGroup.querySelectorAll<SVGCircleElement>(".pre-eq-word-drop"));
        drops.forEach((drop, i) => {
          const word = l.words[i];
          drop.setAttribute("cx", String(word.box.cx));
          drop.setAttribute("cy", String(word.box.cy));
          drop.setAttribute("r", String(l.font * 0.86 * p));
        });
      }

      const massGroup = l.equation.querySelector<SVGGElement>("#pre-eq-mass");
      if (massGroup) {
        const massP = clamp01((t - 4.1) / 0.3);
        massGroup.style.opacity = massP > 0 ? "1" : "0";
        massGroup.style.visibility = massP > 0 ? "visible" : "hidden";
        const blobs = Array.from(massGroup.querySelectorAll<SVGCircleElement>(".pre-eq-mass-blob"));
        const r = l.font * 0.9 * easeOutBack(massP);
        const offsets = [
          { x: -72, y: 4 },
          { x: -24, y: -18 },
          { x: 30, y: -12 },
          { x: 72, y: 8 },
        ];
        blobs.forEach((blob, i) => {
          blob.setAttribute("cx", String(globalX + offsets[i].x));
          blob.setAttribute("cy", String(globalY + offsets[i].y));
          blob.setAttribute("r", String(r));
        });
      }

      if (t >= CONFIG.timings.gooMerge + CONFIG.durations.merge) {
        const wobble = 1 + 0.035 * Math.sin((t - CONFIG.timings.gooMerge) * 10);
        l.eqGroup.style.transform = `translate(${recenter.x}px, ${recenter.y}px) scale(${wobble})`;
      }
    };

    const guideSegments = (t: number) => {
      const s = { start: CONFIG.timings.sStart, end: CONFIG.timings.sEnd, path: guideS, p: 0 };
      const d = { start: CONFIG.timings.dStart, end: CONFIG.timings.dEnd, path: guideD, p: 0 };
      const f = { start: CONFIG.timings.fStart, end: CONFIG.timings.fEnd, path: guideF, p: 0 };
      const segments = [s, d, f];
      for (const segment of segments) {
        segment.p = clamp01((t - segment.start) / (segment.end - segment.start));
        if (!segment.path) continue;
        const length = segment.path.getTotalLength();
        segment.path.style.strokeDasharray = String(length);
        segment.path.style.strokeDashoffset = String(length * (1 - easeInOut(segment.p)));
      }
      return segments;
    };

    const renderDraw = (t: number) => {
      type Segment = { start: number; end: number; path: SVGPathElement | null; p: number };
      const segments: Segment[] = guideSegments(t);
      if (sComplete) sComplete.style.visibility = t >= 4.82 ? "visible" : "hidden";
      if (drawLayer) {
        const before = t < CONFIG.timings.drawStart;
        drawLayer.style.visibility = before ? "hidden" : "visible";
      }
      if (pencil) {
        pencil.style.opacity = t >= CONFIG.timings.drawStart ? "1" : "0";
        if (t >= CONFIG.timings.drawStart && t < CONFIG.timings.wordmark) {
          let head = { x: TIP.x, y: TIP.y };
          let active = false;
          for (const segment of segments) {
            if (!segment.path) continue;
            if (t >= segment.start && t <= segment.end) {
              head = segment.path.getPointAtLength(segment.path.getTotalLength() * easeInOut(segment.p));
              active = true;
            } else if (t > segment.end) {
              head = segment.path.getPointAtLength(segment.path.getTotalLength());
            }
          }
          let lift = 0;
          if (!active && t >= CONFIG.timings.sStart && t < CONFIG.timings.wordmark) lift = -6;
          const pop = easeOutBack(clamp01((t - CONFIG.timings.drawStart) / CONFIG.durations.drawPop));
          const scale = 0.6 + 0.4 * pop;
          const wobble = Math.sin(t * 18) * 2.5;
          const transform = `translate(${head.x} ${head.y + lift}) rotate(${wobble}) translate(${-TIP.x} ${-TIP.y}) scale(${scale})`;
          pencil.setAttribute("transform", transform);
        } else if (t >= CONFIG.timings.wordmark) {
          pencil.removeAttribute("transform");
        }
      }
      if (wordmark) {
        const p = clamp01((t - CONFIG.timings.wordmark) / CONFIG.durations.wordmark);
        wordmark.style.opacity = String(p);
        wordmark.style.filter = p < 1 ? `blur(${(1 - p) * 10}px)` : "none";
        wordmark.style.transform = `translateY(${(1 - p) * 12}px)`;
      }
      if (tagline) {
        const p = clamp01((t - CONFIG.timings.wordmark) / CONFIG.durations.wordmark);
        tagline.style.opacity = String(p);
        tagline.style.filter = p < 1 ? `blur(${(1 - p) * 6}px)` : "none";
        tagline.style.transform = `scaleX(${0.92 + 0.08 * p})`;
      }
      if (star) {
        const p = clamp01((t - CONFIG.timings.star) / CONFIG.durations.star);
        if (t >= CONFIG.timings.star) {
          const rect = star.getBoundingClientRect();
          if (rect.width > 0) starScreen = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        star.style.opacity = t >= CONFIG.timings.star ? "1" : "0";
        const scale = p < 0.7 ? easeOutBack(p / 0.7) * 1.15 : 1.15 - 0.15 * clamp01((p - 0.7) / 0.3);
        const rotate = 45 * (1 - p);
        star.setAttribute("transform", `translate(571 115) scale(${scale}) rotate(${rotate})`);
        if (t >= CONFIG.timings.star && !soundPlayed) {
          soundPlayed = true;
          playPlin(audio);
        }
      }
    };

    const renderAt = (t: number) => {
      if (!layout) return;
      const clamped = Math.max(0, t);
      const phaseEquation = clamped >= CONFIG.timings.equationStart && clamped < CONFIG.timings.drawStart;
      root.classList.toggle("has-started", clamped >= 0);
      root.classList.toggle("show-equation", phaseEquation);
      root.classList.toggle("show-draw", clamped >= CONFIG.timings.drawStart);
      root.classList.toggle("is-final-logo", clamped >= CONFIG.timings.starEnd);
      root.classList.toggle("is-opening", clamped >= CONFIG.timings.open && clamped < CONFIG.timings.end);
      root.classList.toggle("is-goo", clamped >= CONFIG.timings.gooStart && clamped < CONFIG.timings.drawStart);
      if (index) {
        const active = clamped < CONFIG.timings.plus1 ? 0 : clamped < CONFIG.timings.plus2 ? 1 : 2;
        setIndex(active);
        index.style.opacity = clamped >= CONFIG.timings.gooStart ? "0" : "1";
        index.style.visibility = clamped >= CONFIG.timings.gooStart ? "hidden" : "visible";
      }
      if (top) top.style.opacity = clamped >= CONFIG.timings.open ? "0" : "1";
      if (dots) {
        const waiting = clamped >= CONFIG.timings.starEnd && clamped < CONFIG.timings.open && !readyResolved;
        dots.classList.toggle("is-visible", waiting);
      }
      if (staticLogo) {
        const showStatic = clamped >= CONFIG.timings.starEnd || clamped < 0.01;
        staticLogo.style.opacity = showStatic ? "1" : "0";
        staticLogo.style.visibility = showStatic ? "visible" : "hidden";
      }
      if (logoStage) {
        const drawing = clamped >= CONFIG.timings.drawStart;
        const finalLogo = clamped >= CONFIG.timings.starEnd;
        logoStage.style.opacity = finalLogo ? "0" : drawing ? "1" : "0";
        logoStage.style.visibility = finalLogo ? "hidden" : drawing ? "visible" : "hidden";
      }
      if (equationSvg) {
        equationSvg.style.opacity = phaseEquation ? "1" : "0";
        equationSvg.style.visibility = phaseEquation ? "visible" : "hidden";
      }
      if (stage && clamped >= CONFIG.timings.open) {
        const p = clamp01((clamped - CONFIG.timings.open) / (CONFIG.timings.end - CONFIG.timings.open));
        stage.style.opacity = String(1 - p);
        stage.style.transform = `scale(${1 - 0.04 * p})`;
      } else if (stage) {
        stage.style.opacity = "1";
        stage.style.transform = "none";
      }
      if (phaseEquation) renderEquation(layout, clamped);
      if (clamped >= CONFIG.timings.drawStart) renderDraw(clamped);
      if (clamped < CONFIG.timings.drawStart && wordmark) wordmark.style.opacity = "0";
      if (clamped < CONFIG.timings.drawStart && tagline) tagline.style.opacity = "0";

      const open = clamped >= CONFIG.timings.open;
      document.documentElement.classList.toggle("preloader-active", !open);
      document.documentElement.classList.toggle("preloader-opening", open && clamped < CONFIG.timings.end);
      document.documentElement.classList.toggle("preloader-hero-in", open);
      if (open) {
        const p = clamp01((clamped - CONFIG.timings.open) / (CONFIG.timings.end - CONFIG.timings.open));
        if (p >= 0.6) document.documentElement.classList.add("preloader-nav-in");
        const max = Math.hypot(window.innerWidth, window.innerHeight) * 1.15;
        const radius = max * p;
        const mask = `radial-gradient(circle at ${starScreen.x}px ${starScreen.y}px, transparent 0, transparent ${radius}px, #000 ${radius + 1}px)`;
        root.style.background = "var(--peach)";
        root.style.maskImage = mask;
        (root.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = mask;
        root.style.opacity = "1";
      } else {
        document.documentElement.classList.remove("preloader-nav-in", "preloader-hero-in");
        root.style.maskImage = "none";
        (root.style as CSSStyleDeclaration & { webkitMaskImage?: string }).webkitMaskImage = "none";
        root.style.background = "var(--paper)";
        root.style.opacity = "1";
      }
      if (clamped >= CONFIG.timings.end) finish();
    };

    const loop = (now: number) => {
      if (done) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
      last = now;
      if (playing) {
        if (clock >= CONFIG.timings.starEnd && !readyResolved) {
          renderAt(CONFIG.timings.starEnd);
          if (dots) dots.classList.add("is-visible");
        } else {
          clock += dt;
          renderAt(clock);
          if (clock >= CONFIG.timings.gooStart && clock < CONFIG.timings.drawStart) {
            if (!fpsWindow) {
              fpsWindow = now;
              fpsFrames = 0;
            }
            fpsFrames += 1;
            if (dt > 0.018) slowFrames += 1;
            else slowFrames = 0;
            if (slowFrames >= 1) root.classList.add("low-fx");
            if (now - fpsWindow >= 1000) {
              if (fpsFrames < 48) root.classList.add("low-fx");
              fpsWindow = now;
              fpsFrames = 0;
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (playing) return;
      playing = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      playing = false;
      cancelAnimationFrame(raf);
    };

    skip?.addEventListener("click", () => finish(true));

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady
      .then(() => {
        layout = layoutEquation();
        if (!layout) {
          finish(true);
          return;
        }
        if (debug) {
          root.classList.add("is-debug");
          renderAt(0);
        } else if (reduced) {
          root.classList.add("is-reduced");
          if (staticLogo) staticLogo.style.opacity = "1";
          if (logoStage) {
            logoStage.style.opacity = "0";
            logoStage.style.visibility = "hidden";
          }
          if (equationSvg) {
            equationSvg.style.opacity = "0";
            equationSvg.style.visibility = "hidden";
          }
          document.documentElement.classList.add("preloader-active");
          void (async () => {
            await wait(CONFIG.durations.dotsDelay * 1000);
            if (!readyResolved) dots?.classList.add("is-visible");
            await ready;
            dots?.classList.remove("is-visible");
            if (done) return;
            document.documentElement.classList.add("preloader-revealed");
            await root.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 380,
              easing: "ease",
              fill: "forwards",
            }).finished.catch(() => undefined);
            finish();
          })();
        } else {
          clock = short ? CONFIG.timings.star : 0;
          renderAt(clock);
          startLoop();
        }
      })
      .catch((error) => {
        console.error("preloader layout failed", error);
        finish(true);
      });

    const api = {
      seek: async (t: number) => {
        stopLoop();
        if (!layout) await fontsReady;
        if (t >= CONFIG.timings.end) {
          finish(true);
          return;
        }
        clock = Math.max(0, t);
        root.classList.add("is-debug");
        renderAt(clock);
      },
      play: () => {
        if (done) return;
        root.classList.remove("is-debug");
        if (clock >= CONFIG.timings.end) clock = 0;
        renderAt(clock);
        startLoop();
      },
      time: () => clock,
    };
    (window as Window & { __preloader?: typeof api }).__preloader = api;

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safetyId);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      skip?.removeEventListener("click", () => {});
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

        <div className="preloader-logo">
          <div dangerouslySetInnerHTML={{ __html: PRELOADER_LOGO }} />
        </div>

        <div className="preloader-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <svg className="pre-eq-svg" viewBox="0 0 1200 320" aria-hidden="true">
        <defs>
          <filter id="pre-eq-goo" filterUnits="userSpaceOnUse" x="0" y="0" width="1200" height="320">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -11"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="over" result="body" />
            <feOffset in="body" dx="6" dy="8" result="shadowOff" />
            <feFlood floodColor="#2a0c13" floodOpacity="0.92" result="shadowColor" />
            <feComposite in="shadowColor" in2="shadowOff" operator="in" result="shadow" />
            <feOffset in="body" dx="-4" dy="-5" result="rimOff" />
            <feComposite in="rimOff" in2="body" operator="out" result="rimAlpha" />
            <feFlood floodColor="#f0d0c8" floodOpacity="0.45" result="rimColor" />
            <feComposite in="rimColor" in2="rimAlpha" operator="in" result="rim" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="body" />
              <feMergeNode in="rim" />
            </feMerge>
          </filter>
          {WORDS.map((_, i) => (
            <clipPath id={`pre-clip-${i}`} key={`clip-${i}`}>
              <rect className="pre-eq-clip" data-clip={i} x="0" y="0" width="1200" height="300" />
            </clipPath>
          ))}
        </defs>
        <g id="pre-eq-group">
          {WORDS.map((word, wordIndex) => (
            <g className="pre-eq-word" data-word={wordIndex} key={word.text}>
              {Array.from(word.text).map((char, charIndex) => (
                <text className="pre-eq-char" key={`${char}-${charIndex}`}>
                  {char}
                </text>
              ))}
              {Array.from(word.text).map((_, charIndex) => (
                <circle className="pre-eq-drop" data-drop={charIndex} key={`drop-${charIndex}`} />
              ))}
            </g>
          ))}
          {SYMBOLS.map((symbol, symbolIndex) => (
            <g className="pre-eq-symbol" data-symbol={symbolIndex} key={`symbol-${symbolIndex}`}>
              <text className="pre-eq-char">{symbol}</text>
              <circle className="pre-eq-drop" />
            </g>
          ))}
          <g id="pre-eq-word-drops" aria-hidden="true">
            <circle className="pre-eq-word-drop" />
            <circle className="pre-eq-word-drop" />
            <circle className="pre-eq-word-drop" />
          </g>
          <g id="pre-eq-mass" aria-hidden="true">
            <circle className="pre-eq-mass-blob" />
            <circle className="pre-eq-mass-blob" />
            <circle className="pre-eq-mass-blob" />
            <circle className="pre-eq-mass-blob" />
          </g>
        </g>
      </svg>

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
