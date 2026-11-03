import type { CSSProperties } from "react";
import Pencil from "./Pencil";
import { works } from "../data/site";

const floatCards = [
  { src: works[0].src, left: "6%", top: "20%", width: 150, rotate: -8, opacity: 0.32, delay: "0s", duration: "11s" },
  { src: works[2].src, left: "80%", top: "16%", width: 165, rotate: 7, opacity: 0.28, delay: "-2s", duration: "13s" },
  { src: works[4].src, left: "4%", top: "58%", width: 125, rotate: -4, opacity: 0.24, delay: "-4s", duration: "12s" },
  { src: works[6].src, left: "84%", top: "60%", width: 140, rotate: 5, opacity: 0.3, delay: "-1s", duration: "14s" },
  { src: works[7].src, left: "20%", top: "76%", width: 115, rotate: -6, opacity: 0.2, delay: "-6s", duration: "15s" },
];

const emojis = [
  { char: "✨", left: "12%", top: "15%", size: 20, delay: "0s", duration: "9s" },
  { char: "✏️", left: "30%", top: "10%", size: 18, delay: "-3s", duration: "11s" },
  { char: "✦", left: "48%", top: "13%", size: 16, delay: "-6s", duration: "10s" },
  { char: "🎨", left: "64%", top: "9%", size: 18, delay: "-2s", duration: "12s" },
  { char: "✷", left: "78%", top: "16%", size: 15, delay: "-8s", duration: "9s" },
  { char: "☀", left: "88%", top: "11%", size: 16, delay: "-5s", duration: "13s" },
  { char: "✨", left: "7%", top: "28%", size: 14, delay: "-7s", duration: "10s" },
  { char: "✒️", left: "90%", top: "27%", size: 18, delay: "-4s", duration: "12s" },
];

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const capabilities = [
  {
    title: "Portfólio no ar",
    text: "Uma página que é só sua.",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 8h18" />
        <circle cx="6" cy="6" r=".7" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Cartão de visita",
    text: "Impresso ou digital.",
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <path d="M6 10h7M6 13h4" />
      </svg>
    ),
  },
  {
    title: "PDF pronto",
    text: "Para levar a qualquer lugar.",
    icon: (
      <svg {...iconProps}>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5M9 13h6M9 16h4" />
      </svg>
    ),
  },
  {
    title: "Link que viaja",
    text: "Um toque para compartilhar.",
    icon: (
      <svg {...iconProps}>
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
  },
];

export default function HeroPencil() {
  return (
    <section className="hero hero-pencil" id="showcase" aria-labelledby="hero-title" data-hero-pencil="">
      <div className="hero-stage" data-hero-stage="">
        <div className="hero-float" aria-hidden="true">
          {floatCards.map((card) => (
            <figure
              className="float-card"
              key={card.src}
              style={
                {
                  left: card.left,
                  top: card.top,
                  width: card.width,
                  "--rot": `${card.rotate}deg`,
                  "--o": card.opacity,
                  "--delay": card.delay,
                  "--dur": card.duration,
                } as CSSProperties
              }
            >
              <img src={card.src} alt="" width={900} height={1200} loading="eager" decoding="async" />
            </figure>
          ))}
        </div>

        <div className="hero-emojis" aria-hidden="true">
          {emojis.map((emoji, index) => (
            <span
              className="hero-emoji"
              key={`${emoji.char}-${index}`}
              style={
                {
                  left: emoji.left,
                  top: emoji.top,
                  fontSize: emoji.size,
                  "--delay": emoji.delay,
                  "--dur": emoji.duration,
                } as CSSProperties
              }
            >
              {emoji.char}
            </span>
          ))}
        </div>

        <p className="hero-kicker">
          <span aria-hidden="true">✦</span> Sparkle.do — estúdio de portfólios
        </p>

        <div className="hero-pencil-wrap" aria-hidden="true">
          <span className="pencil-shadow" />
          <div className="pencil-rig pencil-intro">
            <div className="pencil-spin">
              <Pencil />
            </div>
          </div>
        </div>

        <div className="hero-panel-bg" aria-hidden="true" />
        <div className="hero-panel-decor" aria-hidden="true">
          <span className="hero-panel-print">sparkle.do</span>
          <span className="hero-panel-star">✦</span>
        </div>

        <div className="hero-story">
          <div className="hero-story-inner">
            <section className="story-block story-block-1" data-story-block>
              <p className="story-eyebrow">
                <span aria-hidden="true">✦</span> O que é o Sparkle.do
              </p>
              <h1 className="story-title" id="hero-title">
                Faça<span className="story-spark" aria-hidden="true">✦</span>
              </h1>
              <p className="story-tagline">o seu portfólio, com brilho.</p>
              <p className="story-lede">
                O seu trabalho vira portfólio, cartão de visita e PDF. Sem tela em branco — só o que você já faz.
              </p>
            </section>

            <section className="story-block story-block-2" data-story-block>
              <p className="story-eyebrow">
                <span aria-hidden="true">✦</span> O que você pode fazer
              </p>
              <h2 className="story-h2">
                Quatro saídas. <span className="story-accent">Um lápis.</span>
              </h2>
              <div className="story-caps">
                {capabilities.map((cap) => (
                  <article className="story-cap" key={cap.title}>
                    <span className="story-cap-icon" aria-hidden="true">
                      {cap.icon}
                    </span>
                    <h3>{cap.title}</h3>
                    <p>{cap.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="story-block story-block-3" data-story-block>
              <p className="story-eyebrow">
                <span aria-hidden="true">✦</span> O próximo passo
              </p>
              <h2 className="story-h2">
                O próximo portfólio <span className="story-accent">é o seu.</span>
              </h2>
              <p className="story-lede">
                Você já tem o trabalho. O Sparkle.do desenha o resto.
              </p>
              <a className="story-cta" href="#formats">
                Ver formatos
                <span aria-hidden="true">→</span>
              </a>
            </section>
          </div>
        </div>

        <div className="hero-final-copy">
          <p className="hero-final-kicker">
            <span aria-hidden="true">✦</span> O lápis já desenhou
          </p>
          <a className="story-cta" href="#formats">
            Ver formatos
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-progress" aria-hidden="true">
          <span>01</span>
          <span>02</span>
          <span>03</span>
        </div>

        <div className="pencil-dock" aria-hidden="true">
          <span className="pencil-dock-star">✦</span>
          <span className="pencil-dock-caption">sparkle.do</span>
        </div>

        <div className="hero-cue" aria-hidden="true">
          <span>Role para desenhar</span>
          <span className="cue-line" />
        </div>
      </div>
    </section>
  );
}
